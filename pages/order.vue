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
import nullifyString from '~/common/nullify-string'

const PHONE_REGEX = /^\+?[\d ]+$/im

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
      price: 'cart/totalPrice',
    }),

    ...mapGetters({
      account: 'accounts/current',
    }),

    formattedPrice() {
      return `${this.price / 100}₴`
    },

    targetPoint() {
      return this.target.address || 'Точка на карті'
    },
  },

  watch: {
    account: {
      immediate: true,

      handler(account) {
        if (account === null) {
          return
        }
        
        if (nullifyString(this.name) === null) {
          this.name = account.data.username
        }

        if (nullifyString(
          this.phone && this.phone.replace(/^\+?3?8?0?/, '')
        ) === null && account.data.phone) {
          this.phone = account.data.phone
        }
      },
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
        price: this.price,
      })

      const cartData = this.$store.getters['cart/data']
      this.$store.commit('order/setCart', cartData)

      this.$toast.show('Замовлення...')
      const result = await this.$store.dispatch('order/order')
      if (result.status) {
        this.$router.push({
          name: 'watch-id-token',
          params: {
            id: result.order,
            token: result.token,
          },
        })

        this.$store.commit('cart/clear')
        this.$toast.success('Замовлення відправлено на опрацювання')
      } else if (result.reason === 'change_count') {
        this.$toast.error('Вибачте, але деякі товари з вашої корзини більше не продаються')

        this.$router.push({ name: 'cart' })
      } else if (result.reason === 'change_price') {
        this.$toast.error('Вибачте, але деякі товари з вашої корзини змінили свою ціну')

        this.$router.push({ name: 'cart' })
      } else {
        this.$toast.error('Помилка відправлення')
      }

      return false
    },
  },
}
</script>

