<template>
  <v-layout justify-center>
    <v-flex
      xs12
      sm12
      md8
      lg8
      xl8
    >
      <v-card height="100%">
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">Дані сайту</v-stepper-step>

            <v-divider />

            <v-stepper-step :complete="step > 2" step="2">База даних</v-stepper-step>

            <v-divider />

            <v-stepper-step step="3">Оператор</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-form
                ref="form0"
                v-model="valid[0]"
                lazy-validation
                @submit.prevent="validate(0) && (step = 2)"
              >
                <v-text-field
                  v-model="site.title"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                  ]"
                  label="Назва сайту"
                  required
                />

                <v-text-field
                  v-model="site.address"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                  ]"
                  label="Адреса сайту"
                  required
                />

                <v-btn
                  color="primary"
                  type="submit"
                >
                  Продовжити
                </v-btn>
              </v-form>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-form
                ref="form1"
                v-model="valid[1]"
                lazy-validation
                @submit.prevent="validate(1) && (step = 3)"
              >
                <v-select
                  v-model="db.connection"
                  :items="connectionTypes"
                  :item-value="({ key }) => key"
                  :item-text="({ name }) => name"
                  label="Тип БД"
                  single-line
                  hide-details
                />

                <div style="height: 20px;" />

                <template v-if="db.connection === 'mysql'">
                  <v-text-field
                    v-model="db.mysql.host"
                    :rules="[
                      v => !!v || 'Це поле обов\'язкове для заповнення',
                    ]"
                    label="Адреса сервера БД"
                    required
                  />

                  <v-text-field
                    v-model="db.mysql.port"
                    :rules="[
                      v => !!v || 'Це поле обов\'язкове для заповнення',
                    ]"
                    label="Порт сервера БД"
                    type="tel"
                    required
                  />

                  <v-text-field
                    v-model="db.mysql.user"
                    :rules="[
                      v => !!v || 'Це поле обов\'язкове для заповнення',
                    ]"
                    label="Ім'я користувача"
                    required
                  />

                  <v-text-field
                    v-model="db.mysql.password"
                    label="Пароль"
                    type="password"
                    required
                  />

                  <v-text-field
                    v-model="db.mysql.database"
                    :rules="[
                      v => !!v || 'Це поле обов\'язкове для заповнення',
                    ]"
                    label="Назва БД"
                    required
                  />
                </template>

                <v-checkbox
                  v-model="db.autofill"
                  label="Заповнити БД тестовими даними"
                />

                <v-btn
                  color="primary"
                  type="submit"
                >
                  Продовжити
                </v-btn>

                <v-btn
                  flat
                  @click="step = 1"
                >Назад</v-btn>
              </v-form>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-form
                ref="form2"
                v-model="valid[2]"
                lazy-validation
                @submit.prevent="validate(2) && done()"
              >
                <v-text-field
                  v-model="operator.username"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                  ]"
                  label="Ім'я"
                  required
                />

                <v-text-field
                  v-model="operator.email"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                  ]"
                  label="Емейл"
                  required
                />

                <v-text-field
                  v-model="operator.phone"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                    v => !!v.toString().match(PHONE_REGEX) || 'Неправильний формат номера',
                  ]"
                  :counter="18"
                  label="Номер телефону"
                  mask="+38 (0##) ###-####"
                  return-masked-value
                  type="tel"
                  required
                />

                <v-text-field
                  v-model="operator.password"
                  :rules="[
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                  ]"
                  label="Пароль"
                  type="password"
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
                    v => !!v || 'Це поле обов\'язкове для заповнення',
                    v => operator.password === v || 'Паролі не співпадають',
                  ]"
                  type="password"
                  label="Підтвердження пароля"
                  required
                />

                <v-btn
                  color="primary"
                  type="submit"
                >
                  Продовжити
                </v-btn>

                <v-btn
                  flat
                  @click="step = 2"
                >Назад</v-btn>
              </v-form>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { PHONE_REGEX } from '~/common/consts'

export default {
  layout: 'menuless',

  data: () => ({
    PHONE_REGEX,

    connectionTypes: [
      { key: 'mysql', name: 'MySQL' },
    ],
    valid: [true, true, true],

    step: 1,

    site: {
      title: null,
      address: null,
    },

    db: {
      connection: 'mysql',
      mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'restaurant',
      },
      autofill: true,
    },

    operator: {
      username: '',
      email: '',
      phone: '+380',
      password: '',
    },

    passwordConfirm: '',
  }),

  computed: {
    passwordProgress() {
      return Math.min(100, this.operator.password.length * 10)
    },

    passwordColor() {
      return ['error', 'warning', 'success'][Math.floor(this.passwordProgress / 40)]
    },
  },

  async fetch({ redirect, $axios }) {
    try {
      await $axios.$get('/courses')
      redirect(301, '/')
    } catch (e) {
      console.log(e)
    }
  },

  mounted() {
    this.$store.commit('setTitle', 'Інсталяція')
  },

  methods: {
    validate(index) {
      return this.$refs[`form${index}`].validate()
    },
    
    async done() {
      const request = {
        site: this.site,
        db: this.db,
        operator: {
          ...this.operator,
          phone: (this.operator.phone || '').replace(/[ \-\(\)]/g, ''),
        },
      }

      try {
        const response = await this.$axios.$post('/install', request)

        this.$toast.show('Інсталяція...')
        if (response.status === 'ok') {
          await this.$store.dispatch('accounts/login', {
            username: this.operator.username,
            password: this.operator.password,
          })

          this.$router.push({ name: 'menu' })

          this.$toast.success('Інсталяція виконана успішно!')
        } else {
          switch (response.reason) {
          case 'installed':
            this.$toast.show('Інсталяція уже була виконана')

            this.$router.push({ name: 'menu' })
            break
          case 'wrong-db-connection':
            this.$toast.error('Невідомий тип БД')
            break
          case 'wrong-db-credentials':
            this.$toast.error('Неправильні реквізити доступу до БД')
            break
          case 'user-exists':
            this.$toast.error('Користувач з таким даними вже існує')
            break
          case 'exception':
          default:
            throw new Error(response.reason)
          }
        }
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка інсталяції')
      }
    },
  },
}
</script>
