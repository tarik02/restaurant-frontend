export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    const account = store.getters['accounts/current']
    if (account !== null) {
      const {tokenType, accessToken} = account.auth
      
      if (null !== config.headers['Authorization']) {
        config.headers['Authorization'] = `${tokenType} ${accessToken}`
      } else {
        delete config.headers['Authorization']
      }
    }

    return config
  })
}
