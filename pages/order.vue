<template>
  <v-card height="100%">
    <v-layout fill-height column>
      <v-form ref="form" v-model="valid" lazy-validation class="mx-2">
        <v-text-field
          v-model="name"
          :rules="nameRules"
          prepend-icon="person"
          label="Ім'я"
          autofocus
          required
        />

        <v-text-field
          v-model="phone"
          :rules="phoneRules"
          :counter="12"
          prepend-icon="local_phone"
          label="Телефон"
          mask="+38 (###) ### - ####"
          required
        />
        
        <v-text-field
          v-model="formattedPrice"
          prepend-icon="credit_card"
          label="До сплати"
          disabled
        />

        <v-text-field
          v-model="targetPoint"
          prepend-icon="location_on"
          label="Точка призначення"
          disabled
        />

        <v-textarea
          v-model="targetNotes"
          prepend-icon="notes"
          label="Примітки щодо місця призначення"
        />
      </v-form>

      <v-spacer />

      <v-footer class="subheading px-2 py-4">
        <v-btn to="cart">
          <v-icon>keyboard_arrow_left</v-icon>&nbsp;Назад
        </v-btn>

        <v-spacer />

        <v-btn :disabled="!valid" color="primary" @click="submit">
          Підтвердити замовлення&nbsp;<v-icon>keyboard_arrow_right</v-icon>
        </v-btn>
      </v-footer>
    </v-layout>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

const PHONE_REGEX = /^\+?38\d{10}$/im

export default {
  data: () => ({
    valid: true,

    name: '',
    nameRules: [
      v => !!v || 'Ім&#39;я обов&#39;язкове',
    ],
    
    phone: '+380',
    phoneRules: [
      v => !!v || 'Номер телефону обов&#39;язковий',
      v => !!v.toString().match(PHONE_REGEX) || 'Неправильний формат номера',
    ],

    targetNotes: '',
  }),

  computed: {
    ...mapState({
      target: state => state.order.target,
    }),

    ...mapGetters({
      price: 'menu/totalPrice',
    }),

    formattedPrice() {
      return `${this.price / 100}₴`
    },

    targetPoint() {
      return this.target.address || 'Точка на карті'
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Замовлення')
  },

  methods: {
    async submit() {
      if (!this.$refs.form.validate()) {
        return false
      }

      this.$store.commit('order/setInfo', {
        name: this.name,
        phone: this.phone.toString(),
        notes: this.targetNotes,
      })

      const cartData = this.$store.getters['menu/cartData']
      this.$store.commit('order/setCart', cartData)

      // TODO: loader
      const result = await this.$store.dispatch('order/order')
      if (result.status) {
        // TODO: Take token and put it somewhere
        this.$router.push({
          name: 'watch-id-token',
          params: {
            id: result.order,
            token: result.token,
          },
        })
      } else {
        // TODO:
      }

      return false
    },
  },
}
</script>

