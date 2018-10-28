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

    <template v-else-if="status === 'off'">
      <v-container
        fill-height
        align-center
        justify-center
      >
        <v-btn
          color="primary"
          @click="$store.commit('driver/showWorkDialog')"
        >Почати роботу</v-btn>
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
        <v-progress-linear
          :indeterminate="lastDistance === null"
          :value="100 * (1 - lastDistance / order.total_distance)"
          class="my-0"
          color="primary"
          height="3"
        />

        <v-layout fill-height column class="content">
          <v-fade-transition>
            <div v-show="drivingTab === 0" class="content">
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

              <v-btn
                :href="mapNavigationLink"
                class="get-route-button"
                color="primary"
              >
                Прокласти маршрут
              </v-btn>
            </div>
          </v-fade-transition>

          <v-fade-transition>
            <v-card v-show="drivingTab === 1" class="mx-2" flat>
              <v-card-text class="pa-0">
                <v-text-field
                  v-model="order.contact_name"
                  prepend-icon="person"
                  label="Ім'я"
                  readonly
                />

                <v-layout row>
                  <v-text-field
                    v-model="order.phone"
                    prepend-icon="local_phone"
                    label="Телефон"
                    readonly
                  />

                  <v-btn
                    :href="`tel:${encodeURIComponent(order.phone)}`"
                    flat
                    fab
                    small
                  ><v-icon>call</v-icon></v-btn>
                </v-layout>

                <v-text-field
                  :value="(order.price / 100).toString()"
                  prepend-icon="credit_card"
                  label="До сплати"
                  suffix="₴"
                  readonly
                />

                <v-text-field
                  v-model="order.target.address"
                  prepend-icon="location_on"
                  label="Точка призначення"
                  readonly
                />

                <v-textarea
                  v-model="order.notes"
                  prepend-icon="notes"
                  label="Примітки щодо місця призначення"
                  readonly
                />
              </v-card-text>

              <v-card-actions class="pa-0">
                <v-spacer />

                <v-btn
                  color="error"
                  @click="cancelOrder"
                >Скасувати</v-btn>

                <v-btn
                  color="primary"
                  @click="endOrder"
                >Позначити виконаним</v-btn>
              </v-card-actions>
            </v-card>
          </v-fade-transition>
        </v-layout>

        <v-bottom-nav
          :active.sync="drivingTab"
          style="margin-top: auto; transform: initial;"
          color="transparent"
        >
          <v-btn flat color="primary">
            <span>Карта</span>
            <v-icon>place</v-icon>
          </v-btn>

          <v-btn flat color="primary">
            <span>Інформація</span>
            <v-icon>notes</v-icon>
          </v-btn>
        </v-bottom-nav>
      </v-layout>
    </template>

    <template v-else-if="status === 'idle'">
      <v-container
        fill-height
        align-center
        justify-center
        style="flex-direction: column;"
      >
        <div>
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <div style="height: 10px;" />

        <div>
          Очікуйте замовлення
        </div>
      </v-container>
    </template>
  </v-card>
</template>

<script>
import delay from 'await-delay'
import { interval } from '~/common/interval-promise'
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
    lastDistance: null,
    drivingTab: 0,

    status: 'loading',

    items: [],
  }),

  computed: {
    mapNavigationLink() {
      const { latitude, longitude } = this.order.target
      return `google.navigation:mode=d&q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`
    },
  },

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

          await delay(10000)
        } catch (e) {
          console.error(e)
          this.$toast.error('Не вдалося отримати ваше місцезнаходження')

          await delay(5000)
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
        // case DriverStatus.READY:
        //   this.items = response.orders
        //   break
        case DriverStatus.OFF:
          if (this.$store.state.driver.workEnabled) {
            this.$store.commit('driver/disableWork')
            this.$driverTracker.stop()
          }
          break
        case DriverStatus.DRIVING:
          if (!this.$store.state.driver.workEnabled) {
            this.$store.commit('driver/enableWork')
          }

          this.driver = response.driver
          this.order = response.order
          break
        case DriverStatus.IDLE:
          if (!this.$store.state.driver.workEnabled) {
            this.$store.commit('driver/enableWork')
          }
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

        const distance = distanceBetweenTwoPoints(driverP, targetP)
        this.lastDistance = distance
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

    async cancelOrder() {
      const response = await this.$axios.$post('/driver/cancel-order')

      if (response.status === 'ok') {
        this.$toast.success('Замовлення скасовано')
      } else {
        this.$toast.error('Помилка скасування')
      }
    },

    async endOrder() {
      const response = await this.$axios.$post('/driver/end-order')

      if (response.status === 'ok') {
        this.$toast.success('Замовлення виконано')
      } else {
        this.$toast.error('Помилка виконання')        
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.content
  position relative
  
  >*
    position absolute
    left 0
    top 0
    right 0
    bottom 0
  
  .get-route-button
    top initial
    left 50%
    right initial
    bottom 16px
    transform translateX(-50%)
</style>
