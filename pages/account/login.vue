<template>
  <v-card height="100%" flat class="px-2">
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit">
      <v-card-text>
        <v-text-field
          v-model="login"
          label="Логін"
          required
        />

        <v-text-field
          v-model="password"
          type="password"
          label="Пароль"
          required
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          :to="{ name: 'account-register' }"
          nuxt
          flat
        >Реєстрація</v-btn>

        <v-btn
          :to="{ name: 'account-recover' }"
          nuxt
          flat
        >Забули пароль?</v-btn>

        <v-btn
          :disabled="!valid"
          type="submit"
          color="primary"
        >Увійти</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    valid: true,

    login: '',
    password: '',
  }),

  mounted() {
    this.$store.commit('setTitle', 'Додавання облікового запису')
  },

  methods: {
    async submit() {
      if (!this.$refs.form.validate()) {
        return
      }

      this.$toast.show('Вхід...')
      
      try {
        await this.$store.dispatch('accounts/login', {
          username: this.login,
          password: this.password,
        })

        this.$router.push({
          name: 'index',
        })

        this.$toast.success('Обліковий запис додано')
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка входу')
      }
    },
  },
}
</script>
