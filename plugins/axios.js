import qs from 'qs'

export default function ({ $axios, store, app, redirect }) {
  $axios.defaults.paramsSerializer = params => qs.stringify(params, { arrayFormat: 'brackets' })

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

  $axios.onError(error => {
    if (
      error.response &&
      parseInt(error.response.status) === 401 &&
      error.response.statusText === 'not-installed'
    ) {
      if (app.router.currentRoute.name !== 'install') {
        app.router.replace({ name: 'install' })
      }
    }
  })
}
