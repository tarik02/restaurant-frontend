<template>
  <v-card height="100%" flat class="px-2">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card-text>
        <v-text-field
          v-model="username"
          :rules="[
            v => !!v || 'Імя обов\'язкове',
          ]"
          label="Ім'я"
          required
        />

        <v-text-field
          v-model="email"
          :rules="[
            v => !v || /.+@.+/.test(v) || 'Емейл повинен бути правильним',
          ]"
          label="Емейл"
          required
        />

        <v-text-field
          v-model="phone"
          label="Номер телефону"
          required
        />

        <v-text-field
          v-model="password"
          :rules="[
            v => !!v || 'Пароль обов\'язковий',
            v => v.length >= 6 || 'Мінімальна довжина пароля - 6 символів',
          ]"
          type="password"
          label="Пароль"
          required
          loading
        >
          <v-progress-linear
            slot="progress"
            :value="passwordProgress"
            :color="passwordColor"
            height="7"
          />
        </v-text-field>

        <v-text-field
          v-model="passwordConfirm"
          :rules="[
            v => password === v || 'Паролі не співпадають',
          ]"
          type="password"
          label="Підтвердження пароля"
          required
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          :to="{ name: 'account-login' }"
          nuxt
          flat
        >Вхід</v-btn>

        <v-btn
          :disabled="!valid"
          color="primary"
          @click="submit"
        >Зареєструватись</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    valid: true,

    username: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  }),

  computed: {
    passwordProgress() {
      return Math.min(100, this.password.length * 10)
    },

    passwordColor() {
      return ['error', 'warning', 'success'][Math.floor(this.passwordProgress / 40)]
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Реєстрація')
  },

  methods: {
    async submit() {
      if (!this.$refs.form.validate()) {
        return
      }

      this.$toast.show('Реєстрація...')
      
      try {
        await this.$store.dispatch('accounts/register', {
          username: this.username,
          email: this.email,
          phone: this.phone,
          password: this.password,
        })
        await this.$store.dispatch('accounts/login', {
          username: this.username,
          password: this.password,
        })

        this.$router.push({
          name: 'index',
        })

        this.$toast.success('Обліковий запис створено')
      } catch (e) {
        console.error(e)

        if (e.message === 'already_exists') {
          this.$toast.error('Користувач з таким іменем вже існує')
        } else {
          this.$toast.error('Помилка реєстрації')
        }
      }
    },
  },
}
</script>
