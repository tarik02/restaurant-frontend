import _ from 'lodash'

export default function ({ $axios, store, app }, inject) {
  let watchId = null

  const sendLocation = ({latitude, longitude, accuracy}) => {
    const currentAccount = store.getters['accounts/current']

    if (currentAccount !== null) {
      const { tokenType, accessToken } = currentAccount.auth
      $axios.$post('/driver/report-location', {
        location: {
          latitude,
          longitude,
          accuracy,
        },
      }, {
        progress: false,

        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
        },
      })
    } else {
      console.warn('Tried to send location without an account')
    }
  }

  let _enabled = false
  const driverTracker = {
    start(notification = true) {
      this.stop(false)
      _enabled = true

      store.commit('driver/enablingTracker')
      if (notification) {
        app.$toast.show('Увімкнення трекера...')
      }

      let first = true
      watchId = navigator.geolocation.watchPosition(
        ({ coords: { latitude, longitude, accuracy } }) => {
          if (first) {
            store.commit('driver/enableTracker')
            app.$toast.success('Трекер увімкнений')
            first = false
          }

          sendLocation({ latitude, longitude, accuracy })
        },
        error => {
          console.error(error)

          this.stop(false)
          app.$toast.error('Помилка увімкнення трекера')
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      )
    },

    stop(notification = true) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }

      store.commit('driver/disableTracker')
      if (_enabled && notification) {
        app.$toast.success('Трекер вимкнений')
      }
      _enabled = false
    },
  }

  inject('driverTracker', driverTracker)

  store.watch(
    state => state.driver.trackerEnabled,
    enabled => {
      if (enabled && !_enabled) {
        driverTracker.start(false)
      }
    }
  )

  store.watch(
    (state, getters) => {
      const account = getters['accounts/current']
      if (account === null) {
        return null
      }

      return account.data.roles
    },
    roles => {
      if (roles === null) {
        return
      }

      const shouldWatch = _.includes(roles, 'driver')

      if (_enabled !== shouldWatch) {
        if (!shouldWatch) {
          driverTracker.stop()
        }
      }
    },
    {
      immediate: true,
      deep: true,
    }
  )
}
