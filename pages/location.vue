<template>
  <v-card height="100%">
    <v-layout fill-height column>
      <div style="flex: 100% 1 1;" class="gmaps-container">
        <googlemaps-map
          ref="map"
          :center.sync="center"
          :zoom.sync="zoom"
          :options="mapOptions"
          @idle="idle"
          @click="setMarker"
        >
          <googlemaps-user-position
            @update:position="setUserPosition"
          />

          <googlemaps-marker
            :position.sync="target"
            draggable
            title="Точка призначення"
          />
        </googlemaps-map>

        <v-toolbar
          class="toolbar"
          dense
          floating
        >
          <address-autocomplete
            id="map"
            ref="autocomplete"
            :disabled="locating"
            :loading="movingMarker"
            :country="['ua']"
            classname="mx-2 form-control"
            placeholder="Адреса призначення"
            hide-details
            prepend-icon="search"
            single-line
            @placechanged="getAddressData"
          />

          <v-btn
            :disabled="locating"
            icon
            @click="myLocation"
          ><v-icon>my_location</v-icon></v-btn>
        </v-toolbar>

        <v-fade-transition>
          <v-layout
            v-show="locating"
            fill-height
            align-center
            justify-center
            ma-0
            class="gmaps-overlay"
          >
            <v-progress-circular indeterminate color="grey lighten-5" />
          </v-layout>
        </v-fade-transition>
      </div>
    
      <v-card-actions>
        <v-btn to="cart">
          <v-icon>keyboard_arrow_left</v-icon>&nbsp;Назад
        </v-btn>

        <v-spacer />

        <v-btn
          :disabled="!target || !target.lat || !target.lng"
          color="primary"
          to="order"
          @click="setOrderTarget"
        >
          Далі&nbsp;<v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-layout>
  </v-card>
</template>

<script>
import { LOCATION_DEFAULT } from '~/common/consts'
import AddressAutocomplete from '~/components/AddressAutocomplete'
import debounce from 'lodash.debounce'

const ADDRESS_UNKNOWN = 'Невідома адреса'

export default {
  components: {
    AddressAutocomplete,
  },

  data: () => ({
    mapOptions: {
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,

      clickableIcons: false,
    },

    center: { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude },
    target: null,
    zoom: 14,

    locating: false,
    idleFirst: true,
    movingMarker: false,
  }),

  watch: {
    target(newTarget) {
      this.movingMarker = true

      this.updateMarkerPosition(newTarget)
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Карта')

    this.geocoder = new google.maps.Geocoder()
  },

  methods: {
    myLocation() {
      this.centerInCurrentLocation()
    },

    async centerInCurrentLocation() {
      this.locating = true

      if (navigator.geolocation) {
        return await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(async(position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude }
            
            this.target = pos
            this.$refs.map.panTo(pos)
            this.zoom = 19

            this.locating = false
            resolve(true)
          }, (error) => {
            const pos = { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude }

            this.target = pos
            this.$refs.map.panTo(pos)
            this.zoom = 14

            this.locating = false
            reject(error)
          }, {
            enableHighAccuracy: true,
            maximumAge: 5 * 60 * 1000,
            timeout: 10 * 1000, // 10 seconds
          })
        })
      } else {
        this.locating = false
        return false
      }
    },

    idle() {
      if (!this.idleFirst) {
        return
      }
      
      this.idleFirst = false
      this.centerInCurrentLocation()
    },

    setMarker(e) {
      this.target = e.latLng
      this.$refs.map.panTo(this.target)
      this.zoom = 19
    },

    convertTarget: ({lat, lng}) => ({
      lat: typeof lat === 'function' ? lat() : lat,
      lng: typeof lng === 'function' ? lng() : lng,
    }),

    updateMarkerPosition: debounce(function(newTarget) {
      // idk wtf is this...
      const { lat, lng } = this.convertTarget(newTarget)

      this.geocoder.geocode({
        location: { lat, lng },
      }, (results, status) => {
        if (status === 'OK' || status == 'ZERO_RESULTS') {
          if (results.length === 0) {
            this.$refs.autocomplete.update(ADDRESS_UNKNOWN)
          } else {
            const [ result ] = results
            this.$refs.autocomplete.update(result.formatted_address)
          }
        } else {
          this.$refs.autocomplete.update(ADDRESS_UNKNOWN)
        }

        this.movingMarker = false
      })
    }, 500),

    setUserPosition() {

    },
    
    getAddressData(addressData, placeResultData, id) {
      const pos = { lat: addressData.latitude, lng: addressData.longitude }

      this.target = pos
      this.$refs.map.panTo(pos)
      this.zoom = 19
    },

    setOrderTarget() {
      if (!this.target || !this.target.lat || !this.target.lng) {
        return false
      }

      const address = this.$refs.autocomplete.$data.autocompleteText

      this.$store.commit('order/setTarget', {
        address: address === ADDRESS_UNKNOWN ? null : address,
        coordinates: this.convertTarget(this.target),
      })
    },
  },
}
</script>

<style lang="stylus" scoped>
.gmaps-container
  position relative

  &>*
    position absolute
    left 0
    top 0
    right 0
    bottom 0

  .toolbar
    left 16px
    top 16px
    right auto
    bottom auto

  .gmaps-overlay
    background alpha(black, .5)
</style>
