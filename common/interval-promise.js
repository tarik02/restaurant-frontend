import delay from 'await-delay'

export const interval = async (callback, interval) => {
  let iteration = 0
  let running = true

  const stop = () => {
    running = false
  }

  while (running) {
    try {
      await callback(iteration, stop)
    } catch (e) {
      console.error(e)
    }
    ++iteration

    await delay(interval)
  }
}
