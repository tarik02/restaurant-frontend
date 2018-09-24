export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    const account = store.getters['accounts/current']
    if (account !== null) {
      const {tokenType, accessToken} = account.auth

      console.info('before', config.url, { ...config.headers })
      if (null === config.headers['Authorization']) {
        delete config.headers['Authorization']
      } else {
        config.headers['Authorization'] = `${tokenType} ${accessToken}`
      }
      console.info('after', config.url, { ...config.headers })
    }

    return config
  })
}
