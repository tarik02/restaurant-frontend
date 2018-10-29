<template>
  <v-app>
    <draggable-navigation-drawer
      ref="navigationDrawer"
      v-model="drawer"
      mini-variant.sync="miniVariant"
      app
      fixed
      touchless
    >
      <v-img :aspect-ratio="16/9" src="https://cdn.vuetifyjs.com/images/parallax/material.jpg">
        <v-layout column fill-height class="lightbox white--text">
          <v-flex shrink mx-3 mt-3>
            <v-layout row>
              <v-avatar
                v-if="account"
                size="56"
                color="red"
              >
                <v-img
                  v-if="account.data.avatar"
                  :src="account.data.avatar | uploaded"
                  :alt="account.data.username"
                />
                <span
                  v-else
                  class="white--text headline"
                >{{ account.data.username[0] }}</span>
              </v-avatar>

              <v-spacer />

              <v-tooltip
                v-for="(account, id, index) in secondaryAccounts"
                :key="id"
                bottom
              >
                <v-btn
                  slot="activator"
                  :class="{ 'ma-0': true, 'ml-1': index !== 0 }"
                  round
                  icon
                >
                  <v-avatar
                    size="32"
                    color="red"
                    @click="setAccount(id)"
                  >
                    <v-img
                      v-if="account.data.avatar"
                      :src="account.data.avatar | uploaded"
                      :alt="account.data.username"
                    />
                    <span
                      v-else
                      class="white--text headline"
                    >{{ account.data.username[0] }}</span>
                  </v-avatar>
                </v-btn>

                <span>{{ account.data.username }}</span>
              </v-tooltip>
            </v-layout>
          </v-flex>

          <v-spacer />

          <v-flex
            pl-3
            pb-2
            shrink
            style="cursor: pointer; user-select: none;"
            @click="switchAccountMenu"
          >
            <v-layout row>
              <v-flex v-if="account" shrink>
                <div class="subheading">{{ account.data.username }}</div>
                <div class="body-1">{{ account.data.email }}</div>
              </v-flex>

              <v-spacer />

              <v-flex shrink>
                <v-btn
                  icon
                  dark
                >
                  <v-icon>{{ accountMenu ? 'arrow_drop_up' : 'arrow_drop_down' }}</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-img>

      <v-list
        dense
        class="pt-0"
      >
        <v-divider />

        <template v-if="accountMenu">
          <v-list-tile
            v-for="(account, id, index) in secondaryAccounts"
            :key="index"
            @click="setAccount(id)"
          >
            <v-list-tile-avatar
              size="32"
              color="red"
            >
              <v-img
                v-if="account.data.avatar"
                :src="account.data.avatar | uploaded"
                :alt="account.data.username"
              />
              <span
                v-else
                class="white--text headline"
              >{{ account.data.username[0] }}</span>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ account.data.username }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile :to="{ name: 'account-login' }" nuxt @click="accountMenu = false">
            <v-list-tile-action><v-icon>add</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Додати обліковий запис</v-list-tile-title></v-list-tile-content>
          </v-list-tile>

          <!-- <v-list-tile :to="{ name: 'account-manage' }" nuxt @click="accountMenu = false">
            <v-list-tile-action><v-icon>settings</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Керувати обліковими записами</v-list-tile-title></v-list-tile-content>
          </v-list-tile> -->
        </template>
        <template v-else>
          <v-list-tile :to="{ name: 'menu' }" nuxt>
            <v-list-tile-action><v-icon>restaurant_menu</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Меню</v-list-tile-title></v-list-tile-content>
          </v-list-tile>

          <v-list-tile :to="{ name: 'cart' }" nuxt>
            <v-list-tile-action><v-icon>shopping_cart</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Корзина</v-list-tile-title></v-list-tile-content>
          </v-list-tile>

          <v-list-group
            :disabled="ordersEmpty"
            :value="!ordersEmpty"
            prepend-icon="view_list"
          >
            <v-list-tile slot="activator">
              <v-list-tile-title>Замовлення</v-list-tile-title>
            </v-list-tile>

            <v-list-tile
              v-for="(token, id) in orders"
              :key="id"
              :to="{ name: 'watch-id-token', params: { id, token } }"
              nuxt
            >
              <v-list-tile-action><v-icon>bookmark_border</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Замовлення №{{ id }}</v-list-tile-title></v-list-tile-content>
            </v-list-tile>            
          </v-list-group>

          <v-list-tile :to="{ name: 'about' }" nuxt>
            <v-list-tile-action><v-icon>account_box</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Про нас</v-list-tile-title></v-list-tile-content>
          </v-list-tile>

          <v-list-tile :to="{ name: 'help' }" nuxt>
            <v-list-tile-action><v-icon>help</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Допомога</v-list-tile-title></v-list-tile-content>
          </v-list-tile>

          <template v-if="account && account.data.roles.includes('cook')">
            <v-divider />

            <v-subheader>Кухар</v-subheader>
            <v-list-tile :to="{ name: 'cook-dashboard' }">
              <v-list-tile-action><v-icon>kitchen</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Кухня</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-if="account && account.data.roles.includes('driver')">
            <v-divider />

            <v-subheader>Водій</v-subheader>
            <v-list-tile :to="{ name: 'driver-dashboard' }">
              <v-list-tile-action><v-icon>reorder</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Замовлення</v-list-tile-title></v-list-tile-content>
            </v-list-tile>

            <v-list-tile @click="toggleDriverWork()">
              <v-list-tile-action><v-icon>work</v-icon></v-list-tile-action>
              <v-layout
                tag="v-list-tile-content"
                row
                style="overflow: visible; width: 100%; align-items: center;"
              >
                <v-list-tile-title style="flex-grow: 1;">На роботі</v-list-tile-title>
                <v-switch
                  v-model="driverWorkSwitch"
                  style="flex-grow: 0; margin-bottom: -6px;"
                  @click.stop="toggleDriverWork()"
                />
              </v-layout>
            </v-list-tile>
          </template>

          <template v-if="account && account.data.roles.includes('storage')">
            <v-divider />

            <v-subheader>Кафе</v-subheader>
            <v-list-tile :to="{ name: 'storage' }">
              <v-list-tile-action><v-icon>local_cafe</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Кафе</v-list-tile-title></v-list-tile-content>
            </v-list-tile>

            <v-list-tile :to="{ name: 'storage-id', params: { id: 'old' } }">
              <v-list-tile-action><v-icon>restore_from_trash</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Старі товари</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-if="account && account.data.roles.includes('operator')">
            <v-divider />

            <v-subheader>Оператор</v-subheader>
            <v-list-tile :to="{ name: 'operator-orders' }">
              <v-list-tile-action><v-icon>reorder</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Замовлення</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'operator-courses' }">
              <v-list-tile-action><v-icon>pie_chart</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Страви</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'operator-ingredients' }">
              <v-list-tile-action><v-icon>restaurant_menu</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Інгредієнти</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'operator-users' }">
              <v-list-tile-action><v-icon>supervisor_account</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Користувачі</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-if="account && account.data.roles.includes('reviews')">
            <v-divider />

            <v-list-tile :to="{ name: 'reviews' }">
              <v-list-tile-action><v-icon>rate_review</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Відгуки</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
          </template>

          <template v-if="account && account.data.roles.includes('stats')">
            <v-divider />

            <v-subheader>Статистика</v-subheader>
            <v-list-tile :to="{ name: 'stats-courses' }">
              <v-list-tile-action><v-icon>reorder</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Страви</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'stats-income' }">
              <v-list-tile-action><v-icon>attach_money</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Дохід</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'stats-ingredients-used' }">
              <v-list-tile-action><v-icon>code</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Використані інгредієнти</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'stats-ingredients-outdated' }">
              <v-list-tile-action><v-icon>access_time</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Терміни придатності</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'stats-orders' }">
              <v-list-tile-action><v-icon>all_inbox</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Замовлення</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
          </template>
        </template>
      </v-list>
    </draggable-navigation-drawer>

    <v-toolbar app>
      <v-toolbar-side-icon @click.native="drawer = !drawer" />
      
      <span class="title ml-3 mr-5">
        {{ shortTitle }}&nbsp;<span class="font-weight-light">{{ currentPage }}</span>
      </span>
      
      <v-spacer />

      <v-btn :to="{ name: 'cart' }" icon>
        <v-badge
          v-model="cartSize"
          top
          right
          overlap
          color="orange"
        >
          <span
            v-show="cartSize"
            slot="badge"
          >{{ cartSize }}</span>

          <v-icon>shopping_cart</v-icon>
        </v-badge>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container fill-height d-block pa-0>
        <v-layout justify-center>
          <v-flex
            xs12
            sm12
            md12
            lg12
            xl10
          >
            <nuxt />
          </v-flex>
        </v-layout>

        <v-dialog
          :value="driverWorkDialog"
          max-width="360"
          @input="$store.commit($event ? 'driver/showWorkDialog' : 'driver/hideWorkDialog')"
        >
          <v-card>
            <v-card-title class="headline">Водій</v-card-title>

            <v-card-text>
              <!-- Увімкнути трекер, який буде відправляти ваше місцезнаходження для розрахування приблизного часу прибуття. Клієнт буде бачити ваше місцезнаходження. -->
              Якщо ви увімкнете цей перемикач, це означає, що ви готові приймати замовлення. Ваше місцезнаходження буде відправлятися на сервер і клієнт, якого ви обслуговуєте, буде бачити ваше поточне місцезнаходження.
            </v-card-text>

            <v-card-actions>
              <v-spacer />

              <v-btn
                color="green darken-1"
                flat
                @click="$store.commit('driver/hideWorkDialog')"
              >
                Відмінити
              </v-btn>

              <v-btn
                v-if="accessToken"
                color="green darken-1"
                flat
                @click="enableDriverWork"
              >
                Увімкнути
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import DraggableNavigationDrawer from '~/components/draggable-navigation-drawer'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  components: {
    DraggableNavigationDrawer,
  },

  data: () => ({
    drawer: null,
    accountMenu: false,
  }),

  head() {
    const state = this.$store.state
    return {
      title: _.filter([state.title.common, state.appName]).join(' | '),
    }
  },

  computed: {
    ...mapState({
      shortTitle: state => state.title.short,
      currentPage: state => state.currentPage,

      driverWorkDialog: state => state.driver.workDialog,
      driverWorkSwitch: state => state.driver.workEnabled,

      orders: state => state.orders.orders,
    }),

    ...mapGetters({
      account: 'accounts/current',
      secondaryAccounts: 'accounts/secondaries',

      cartSize: 'cart/size',

      ordersEmpty: 'orders/empty',
      ordersCount: 'orders/count',
    }),

    accessToken() {
      return this.account && this.account.auth.accessToken
    },
  },

  methods: {
    setAccount(id) {
      this.drawer = null
      this.accountMenu = false

      this.$store.commit('accounts/setCurrent', id)

      this.$router.push({
        name: 'index',
      })
    },

    switchAccountMenu() {
      this.accountMenu = !this.accountMenu
    },

    toggleDriverWork() {
      const newSwitch = !this.driverWorkSwitch

      if (newSwitch) {
        // this.drawer = false
        this.$store.commit('driver/showWorkDialog')
      } else {
        this.disableDriverWork()
      }
    },

    async enableDriverWork() {
      this.$store.commit('driver/hideWorkDialog')

      await this.$axios.post('/driver/on')
      this.$store.commit('driver/enableWork')

      this.$router.push(`/driver/tracker/${this.accessToken}`)
    },

    disableDriverWork() {
      this.$store.commit('driver/disableWork')
      this.$driverTracker.stop()
    },
  },
}
</script>

<style lang="stylus" scoped>
.lightbox
  box-shadow 0 0 20px inset rgba(0, 0, 0, 0.2)
  background-image linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 72px)

</style>
