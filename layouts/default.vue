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

            <v-list-tile @click="toggleGeoSwitch()">
              <v-list-tile-action><v-icon>not_listed_location</v-icon></v-list-tile-action>
              <v-layout
                tag="v-list-tile-content"
                row
                style="overflow: visible; width: 100%; align-items: center;"
              >
                <v-list-tile-title style="flex-grow: 1;">Гео-трекер</v-list-tile-title>
                <v-switch
                  v-model="geoTrackerSwitch"
                  style="flex-grow: 0; margin-bottom: -6px;"
                  @click.stop="toggleGeoSwitch()"
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
        <v-fade-transition>
          <div v-show="cartSize" class="cart-button-counter">{{ cartSize }}</div>
        </v-fade-transition>

        <v-icon>shopping_cart</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container fill-height d-block pa-0>
        <nuxt />

        <v-dialog v-model="geoTrackerDialog" max-width="290">
          <v-card>
            <v-card-title class="headline">Трекер</v-card-title>

            <v-card-text>
              Увімкнути трекер, який буде відправляти ваше місцезнаходження для розрахування приблизного часу прибуття. Клієнт буде бачити ваше місцезнаходження.
            </v-card-text>

            <v-card-actions>
              <v-spacer />

              <v-btn
                color="green darken-1"
                flat="flat"
                @click="geoTrackerDialog = false"
              >
                Відмінити
              </v-btn>

              <v-btn
                color="green darken-1"
                flat="flat"
                @click="enableTracker"
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

    geoTrackerDialog: false,
  }),

  head() {
    return {
      title: this.$store.state.title.common,
    }
  },

  computed: {
    ...mapState({
      shortTitle: state => state.title.short,
      currentPage: state => state.currentPage,

      geoTrackerSwitch: state => state.driver.trackerEnabled,
    }),

    ...mapGetters({
      account: 'accounts/current',
      secondaryAccounts: 'accounts/secondaries',

      cartSize: 'cart/size',
    }),
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

    toggleGeoSwitch() {
      const newSwitch = !this.geoTrackerSwitch

      if (newSwitch) {
        this.drawer = false
        this.geoTrackerDialog = true
      } else {
        this.disableTracker()
      }
    },

    enableTracker() {
      this.geoTrackerDialog = false

      this.$driverTracker.start()
    },

    disableTracker() {
      this.$driverTracker.stop()
    },
  },
}
</script>

<style lang="stylus" scoped>
.cart-button-counter
  font-size 11px
  color white
  height 20px
  width 20px
  border-radius 100%
  line-height 1.65
  text-align center
  position absolute
  background-color orange
  padding 2px
  top -8px
  right 1px
  pointer-events none

.lightbox
  box-shadow 0 0 20px inset rgba(0, 0, 0, 0.2)
  background-image linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 72px)

</style>
