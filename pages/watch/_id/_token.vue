<template>
  <v-card height="100%" flat>
    <template v-if="info !== null">
      <template v-if="info.status === 'waiting'">
        <v-layout fill-height>
          <v-layout row wrap align-center>
            <v-flex class="text-xs-center body-1">
              <div class="mb-5">Ваше замовлення знаходиться на кухні</div>
              <br />
              <v-progress-circular indeterminate color="primary" />
            </v-flex>
          </v-layout>
        </v-layout>
      </template>
      <template v-else-if="info.status === 'cooking'">
        <v-layout fill-height>
          <v-layout row wrap align-center>
            <v-flex class="text-xs-center body-1">
              <div class="mb-5">Ваше замовлення знаходиться на кухні</div>
              <br />
              <v-progress-circular indeterminate color="primary" />
            </v-flex>
          </v-layout>
        </v-layout>
      </template>
      <template v-else-if="info.status === 'inroad'">
        <v-layout fill-height column>
          <v-progress-linear
            :indeterminate="info.totalDistance === null"
            :value="100 * (1 - lastDistance / info.totalDistance)"
            class="mt-0"
            color="primary"
            height="3"
          />

          <div class="mb-2">
            <v-icon style="margin-bottom: -4px;" class="ml-2 mr-1">time_to_leave</v-icon>
            <template
              v-if="
                estimatedDepartureTime === null ||
                  estimatedDepartureTime < 0 ||
                  estimatedDepartureTime > 3600
              "
            >
              Розрахунок очікуваного часу доставки...
            </template>
            <template v-else>
              Очікуваний час доставки: {{ formattedEstimatedTime }}
            </template>
          </div>

          <googlemaps-map
            ref="map"
            :center.sync="center"
            :zoom.sync="zoom"
            :options="gmapsOptions"
            style="flex: 100% 1 1;"
          >
            <googlemaps-marker
              ref="markerDriver"
              :position="info.driver"
              label="Водій"
            />

            <googlemaps-marker
              ref="markerTarget"
              :position="info.target"
              label="Точка призначення"
            />
          </googlemaps-map>
        </v-layout>
      </template>
      <template v-else-if="info.status === 'done'">
        <v-layout fill-height>
          <v-layout row wrap align-center>
            <v-flex class="text-xs-center body-1">
              <v-icon style="margin-bottom: -3px;">done</v-icon> Замовлення доставлено
              <br />
              <v-btn :to="{ name: 'menu' }" class="mt-3"><v-icon>restaurant_menu</v-icon>&nbsp;Меню</v-btn>
            </v-flex>
          </v-layout>
          
          <v-dialog v-model="rateDialog" max-width="500">
            <v-card>
              <v-card-title class="headline">Відгук</v-card-title>

              <v-card-text>
                Залиште відгук. Ваші відгуки дозволяють нам покращувати наш сервіс.

                <div class="text-xs-center mt-4">
                  <v-textarea
                    v-model="rateText"
                    solo
                    auto-grow
                    counter="300"
                    label="Текст відгуку"
                  />

                  <v-rating
                    v-model="rateValue"
                    hover
                  />
                </div>
              </v-card-text>

              <v-divider />

              <v-card-actions>
                <v-spacer />

                <v-btn
                  flat
                  @click="dontRate"
                >
                  Ні, дякую
                </v-btn>

                <v-btn
                  color="primary"
                  @click="sendRating"
                >
                  Відправити
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </template>
      <template v-else-if="info.status === 'cancelled'">
        <v-layout fill-height>
          <v-layout row wrap align-center>
            <v-flex class="text-xs-center body-1">
              <div class="mb-5">Ваше замовлення було відмінено</div>
            </v-flex>
          </v-layout>
        </v-layout>
      </template>
    </template>
    <v-layout v-else fill-height>
      <v-layout row wrap align-center>
        <v-flex class="text-xs-center body-1">
          <v-progress-circular indeterminate color="primary" />
        </v-flex>
      </v-layout>
    </v-layout>
  </v-card>
</template>

<script>
import { LOCATION_DEFAULT } from '~/common/consts'
import { OrderStatus, getOrderStatusName } from '~/common/order-status'
import { measureAverageSpeed } from '~/common/average-speed'
import { distanceBetweenTwoPoints } from '~/common/geo-distance'

export default {
  data: () => ({
    id: null,
    token: null,

    info: null,

    center: { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude },
    zoom: 14,
    target: null,

    lastDistance: null,
    lastSpeed: 0,
    averageSpeed: 0,
    estimatedDepartureTime: null,

    gmapsOptions: {
      disableDefaultUI: true,
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      gestureHandling: 'none',
    },

    rateDialog: false,
    rateText: '',
    rateValue: null,
  }),

  computed: {
    formattedEstimatedTime() {
      const secs = Math.round(this.estimatedDepartureTime)

      if (secs < 60) {
        return `${secs} секунд`
      }

      const min = Math.round(secs / 60)

      return `${min} хвилин`
    },
  },
  
  validate({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id) && /^[a-zA-Z0-9]+$/.test(params.token)
  },

  mounted() {
    this.$store.commit('setTitle', 'Доставка')

    const { id, token } = this.$route.params
    this.id = id
    this.token = token

    this.interval = setInterval(() => this.updateInfo(), 1000)
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    async updateInfo() {
      try {
        const newInfo = await this.$axios.$get(`/order/${this.id}/${this.token}`, { progress: false })
        if (this.info === null || this.info.status !== newInfo.status) {
          this.$store.commit('setTitle', getOrderStatusName(newInfo.status))

          if (newInfo.status === OrderStatus.DONE) {
            this.rateDialog = newInfo.needsReview
          }
        }

        this.info = newInfo

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
          if (this.lastDistance === null) {
            this.lastDistance = distance
          }

          this.lastSpeed = this.lastDistance - distance
          this.averageSpeed = measureAverageSpeed(this.averageSpeed, this.lastSpeed)
          this.lastDistance = distance

          this.estimatedDepartureTime = this.averageSpeed === 0 ? null : (distance / this.averageSpeed)
        })
      } catch (e) {
        console.error(e)
      }
    },

    async dontRate() {
      this.rateDialog = false

      await this.$axios.$post(`/order/dont-rate/${this.id}/${this.token}`)
    },

    async sendRating() {
      try {
        const response = await this.$axios.$post(`/order/rate/${this.id}/${this.token}`, {
          text: this.rateText,
          rating: this.rateValue,
        })

        if (response.status !== 'ok') {
          throw new Error(response.reason)
        }

        this.rateDialog = false
        this.$toast.success('Дякуємо за ваш відгук!')
      } catch (e) {
        console.error(e)
        this.$toast.error('Помилка відправлення відгуку')
      }
    },
  },
}
</script>

