import moment from 'moment'
import { interval } from '~/common/interval-promise'
import AsyncQueue from '~/common/async-queue'

export default function ({ $axios, store, app }) {
  const notificationHandlers = {
    'storage-batches-old': batches => {
      app.$toast.show(`Закінчуються терміни придатності ${batches.length} товарів`, {
        position: 'bottom-center',
        duration: Infinity,
        action: {
          text: 'Переглянути',
          push: {
            name: 'storage-id',
            params: {
              id: 'old',
            },
          },
        },
      })
    },
  }

  const handleNotification = async ({ type, data, createdAt }) => {
    if (type in notificationHandlers) {
      notificationHandlers[type](data)
    } else {
      console.warn('Notification of unknown type:')
      console.warn('type:', type)
      console.warn('data:', data)
      console.warn('created at:', createdAt.format('YYYY.MM.DD HH:mm:ss'))
    }
  }

  const notificationQueue = new AsyncQueue(handleNotification)

  const updateNotifications = async () => {
    try {
      const currentAccount = store.getters['accounts/current']

      if (currentAccount !== null) {
        const { tokenType, accessToken } = currentAccount.auth
        const response = await $axios.$get('/user/notifications', { progress: false }, {
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
          },
        })
        
        notificationQueue.push(...(response.map(
          ({
            type,
            data,
            created_at,
          }) => ({
            type,
            data,
            createdAt: moment(created_at),
          })
        )))
      }
    } catch (e) {
      // console.error(e)
    }
  }
  
  interval(updateNotifications, 1000)
}
