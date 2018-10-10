<template>
  <v-card height="100%" flat>
    <template v-if="status === 'loading'">
      <v-container
        fill-height
        align-center
        justify-center
      >
        <v-progress-circular
          indeterminate
          color="primary"
        />
      </v-container>
    </template>

    <template v-else-if="status === 'ready'">
      <v-container
        fluid
        grid-list-lg
      >
        <template v-for="item in items">
          <v-layout :key="item.id" row wrap justify-center>
            <v-flex xs12>
              <v-card>
                <v-card-title>
                  <div>
                    <span class="headline">Замовлення</span>
                  </div>
                </v-card-title>

                <v-card-text>
                  <p>
                    Адреса: {{ item.target.address || 'Точка на карті' }}
                  </p>

                  <p>
                    Відстань напряму:
                    <template v-if="currentLocation">
                      {{ distanceLabel(item) }}
                    </template>
                    <template v-else>
                      визначається...
                    </template>
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-spacer />

                  <v-btn
                    color="primary"
                    @click="doOrder(item)"
                  >
                    Виконати
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </template>
      </v-container>
    </template>

    <template v-else-if="status === 'driving'">
      <v-layout fill-height column>
        <googlemaps-map
          ref="map"
          :center.sync="center"
          :zoom.sync="zoom"
          :options="gmapsOptions"
          style="flex: 100% 1 1;"
        >
          <googlemaps-marker
            ref="markerDriver"
            :position="{ lat: driver.latitude, lng: driver.longitude }"
            label="Водій"
          />

          <googlemaps-marker
            ref="markerTarget"
            :position="{ lat: order.target.latitude, lng: order.target.longitude }"
            label="Точка призначення"
          />
        </googlemaps-map>
      </v-layout>
    </template>

    <template v-else>ABC</template>
  </v-card>
</template>

<script>
import delay from 'await-delay'
import interval from 'interval-promise'
import { DriverStatus } from '~/common/driver-status'
import { getCurrentPosition } from '~/common/position-promise'
import { distanceBetweenTwoPoints } from '~/common/geo-distance'
import { LOCATION_DEFAULT } from '~/common/consts'

export default {
  data: () => ({
    gmapsOptions: {
      disableDefaultUI: true,
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      gestureHandling: 'none',
    },

    center: { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude },
    zoom: 14,

    driver: null,
    order: null,

    status: 'loading',

    items: [],
  }),

  mounted() {
    this.$store.commit('setTitle', 'Водій')

    this.interval = interval(async (iteration, stop) => {
      if (this.interval === null) {
        stop()
        return
      }

      try {
        await this.updateInfo()
      } catch (e) {
        console.error(e)
      }
    }, 1000)


    this.currentLocation = null

    ;(async () => {
      while (this.interval) {
        try {
          const { coords: { latitude, longitude } } = await getCurrentPosition({
            timeout: 5000,
          })
          this.currentLocation = { lat: latitude, lng: longitude }

          delay(10000)
        } catch (e) {
          console.error(e)
          this.$toast.error('Не вдалося отримати ваше місцезнаходження')

          delay(5000)
        }
      }
    })()
  },

  beforeDestroy() {
    this.interval = null
  },

  methods: {
    async updateInfo() {
      const response = await this.$axios.$get('/driver/dashboard', {
        progress: false,
      })

      switch (response.status) {
        case DriverStatus.READY:
          this.items = response.orders
          break
        case DriverStatus.DRIVING:
          this.driver = response.driver
          this.order = response.order
          break
      }

      this.status = response.status

      this.$nextTick(() => {
        const { markerDriver, markerTarget } = this.$refs
        if (
          !markerDriver ||
          !markerDriver.$_marker ||
          !markerTarget ||
          !markerTarget.$_marker
        ) {
          return
        }

        const driverP = markerDriver.$_marker.getPosition()
        const targetP = markerTarget.$_marker.getPosition()

        const bounds = new google.maps.LatLngBounds()
        bounds.extend(driverP)
        bounds.extend(targetP)
        this.$refs.map.$_map.fitBounds(bounds)
      })
    },

    distanceLabel({ target: { latitude, longitude } }) {
      const dist = distanceBetweenTwoPoints(
        this.currentLocation,
        { lat: latitude, lng: longitude }
      )

      if (dist > 1000) {
        const distKm = Math.round(dist / 100) / 10
        return `${distKm}км`
      }

      const distM = Math.round(dist / 10) * 10
      return `${distM}м`
    },

    async doOrder(item) {
      const response = await this.$axios.$post(`/driver/do-order/${item.id}`)
      switch (response.status) {
      case 'ok':
        console.log('ok')
        break

      case 'error':
        switch (response.reason) {
        case 'no-location':
          this.$toast.error('Спочатку увімкніть трекер')
          break
        case 'not-for-driver':
          this.$toast.error('Це замовлення вже виконується іншим водієм')

          const index = this.items.indexOf(item)
          if (index !== -1) {
            this.items.splice(index, 1)
          }
          break
        default:
          this.$toast.error('Помилка замовлення')
        }
        break

      default:
        this.$toast.error('Помилка замовлення')
      }
    },
  },
}
</script>
