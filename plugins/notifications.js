import interval from 'interval-promise'
import AsyncQueue from '~/common/async-queue'

export default function ({ $axios, store }) {
  const handleNotification = async notification => {
    switch (notification.type) {
      // TODO:
    }
  }

  const notificationQueue = new AsyncQueue(handleNotification)

  const updateNotifications = async () => {
    const currentAccount = store.getters['accounts/current']

    if (currentAccount !== null) {
      const { tokenType, accessToken } = currentAccount.auth
      const response = await $axios.$get('/user/notifications', {}, {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
        },
      })

      notificationQueue.push(...(response.map(({ data, created_at }) => data)))
    }
  }
  
  interval(updateNotifications, 1000, {
    stopOnError: false,
  })
}
