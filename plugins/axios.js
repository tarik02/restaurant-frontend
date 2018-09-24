export default function ({ $axios, store }) {
  $axios.onRequest(config => {
    if (null === config.headers['Authorization']) {
      delete config.headers['Authorization']
    } else {
      const account = store.getters['accounts/current']

      if (account !== null) {
        const {tokenType, accessToken} = account.auth

        config.headers['Authorization'] = `${tokenType} ${accessToken}`
      }
    }

    return config
  })
}
