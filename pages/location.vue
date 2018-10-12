<template>
  <v-card height="100%">
    <v-layout fill-height column>
      <location-select-dialog
        :target.sync="target"
        :address.sync="address"
      />
    
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
import LocationSelectDialog from '~/components/location-select-dialog'
import debounce from 'lodash.debounce'

const ADDRESS_UNKNOWN = 'Невідома адреса'

export default {
  components: {
    LocationSelectDialog,
  },

  data: () => ({
    address: null,
    target: null,
  }),

  mounted() {
    this.$store.commit('setTitle', 'Карта')
  },

  methods: {
    setOrderTarget() {
      if (!this.target || !this.target.lat || !this.target.lng) {
        return false
      }

      this.$store.commit('order/setTarget', {
        address: this.address || ADDRESS_UNKNOWN,
        coordinates: this.target,
      })
    },
  },
}
</script>
