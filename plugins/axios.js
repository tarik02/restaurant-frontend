export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    const account = store.getters['accounts/current']
    if (account !== null) {
      const {tokenType, accessToken} = account.auth
      config.headers.common['Authorization'] = `${tokenType} ${accessToken}`
    }

    return config
  })
}
