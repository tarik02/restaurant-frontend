export default class AsyncQueue {
  constructor(handler, { concurrent = 1 } = {}) {
    this._handler = handler
    this._concurrent = concurrent

    this._queue = []
    this._freeWorkers = this._concurrent
  }

  push(...tasks) {
    if (tasks.length === 0) {
      return Promise.resolve([])
    }

    return new Promise(resolve => {
      let remaining = tasks.length
      const results = tasks.map(() => null)
      const fulfilled = (i, result) => {
        results[i] = result

        if (--remaining === 0) {
          resolve(results)
        }
      }

      this._queue.push(...tasks.map((data, index) => ({
        index,
        data,
        fulfilled,
      })))
      this._update()
    })
  }

  _update() {
    let task
    while (this._freeWorkers !== 0 && (task = this._queue.shift()) !== null) {
      this._handle(task)
    }
  }

  async _handle(task) {
    --this._freeWorkers

    try {
      const result = await this._handler(task.data)
      task.fulfilled(task.index, result)
    } catch (e) {
      console.error(e)
    } finally {
      ++this._freeWorkers
    }
  }
}
