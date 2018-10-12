<template>
  <div style="flex: 100% 1 1;" class="gmaps-container">
    <googlemaps-map
      ref="map"
      :center.sync="center"
      :zoom.sync="zoom"
      :options="gmapsOptions"
      @idle="idle"
      @click="setMarker"
    >
      <googlemaps-marker
        :position.sync="targetPrivate"
        :title="markerLabel"
        draggable
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
        :placeholder="autocompletePlaceholder"
        classname="mx-2 form-control"
        hide-details
        prepend-icon="search"
        single-line
        @placechanged="getAddressData"
      />

      <v-btn
        :disabled="locating"
        icon
        @click="centerInCurrentLocation"
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
</template>

<script>
import { LOCATION_DEFAULT } from '~/common/consts'
import { getCurrentPosition } from '~/common/position-promise'
import AddressAutocomplete from '~/components/AddressAutocomplete'
import _ from 'lodash'

const ADDRESS_UNKNOWN = 'Невідома адреса'

const convertTarget = ({lat, lng}) => ({
  lat: typeof lat === 'function' ? lat() : lat,
  lng: typeof lng === 'function' ? lng() : lng,
})

export default {
  components: {
    AddressAutocomplete,
  },

  props: {
    markerLabel: { type: String, default: 'Точка призначення' },
    autocompletePlaceholder: { type: String, default: 'Адреса призначення' },

    target: { type: Object, default: null },
    address: { type: String, default: '' },
  },

  data: () => ({
    gmapsOptions: {
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,

      clickableIcons: false,
      disableDoubleClickZoom: true,
    },

    center: { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude },
    zoom: 14,
    targetPrivate: null,

    locating: false,
    idleFirst: true,
    movingMarker: false,
  }),

  watch: {
    targetPrivate(newTarget) {
      this.$emit('update:target', convertTarget(newTarget))

      this.movingMarker = true
      this.updateMarkerPosition(newTarget)
    },
  },

  mounted() {
    this.geocoder = new google.maps.Geocoder()
  },

  methods: {
    async centerInCurrentLocation() {
      this.locating = true

      let position, zoom

      try {
        const { coords } = await getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 5 * 60 * 1000,
          timeout: 10 * 1000, // 10 seconds
        })

        position = { lat: coords.latitude, lng: coords.longitude }
        zoom = 19
      } catch (e) {
        console.error(e)

        position = { lat: LOCATION_DEFAULT.latitude, lng: LOCATION_DEFAULT.longitude }
        zoom = 14
      }
      
      this.targetPrivate = position
      this.$refs.map.panTo(position)
      this.locating = false
    },

    idle() {
      if (!this.idleFirst) {
        return
      }
      
      this.idleFirst = false
      this.centerInCurrentLocation()
    },

    setMarker(e) {
      this.targetPrivate = e.latLng
      this.$refs.map.panTo(e.latLng)
      if (this.zoom !== 19) {
        this.zoom = 19
      }
    },

    updateMarkerPosition: _.debounce(function(newTarget) {
      // idk wtf is this...
      const { lat, lng } = convertTarget(newTarget)

      this.geocoder.geocode({
        location: { lat, lng },
      }, (results, status) => {
        let address
        if (status === 'OK' || status == 'ZERO_RESULTS') {
          if (results.length === 0) {
            address = null
          } else {
            const [ result ] = results
            address = result.formatted_address
          }
        } else {
          address = null
        }
        this.$refs.autocomplete.update(address || ADDRESS_UNKNOWN)
        this.$emit('update:address', address)

        this.movingMarker = false
      })
    }, 500),

    getAddressData(addressData, placeResultData, id) {
      const pos = { lat: addressData.latitude, lng: addressData.longitude }

      this.targetPrivate = pos
      this.$refs.map.panTo(pos)
      this.zoom = 19
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
