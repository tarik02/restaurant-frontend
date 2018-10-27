import qs from 'qs'

export default function ({ $axios, store }) {
  (async () => {
    try {
      const response = await $axios.$get('/info')
      store.commit('setAppName', response.name)
    } catch (e) {
      console.error(e)
    }
  })()
}
