<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      mini-variant.sync="miniVariant"
      app
      fixed>
      <!-- <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img src="https://randomuser.me/api/portraits/men/85.jpg" />
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>John Leider</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar> -->
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

          <v-list-tile :to="{ name: 'account-manage' }" nuxt @click="accountMenu = false">
            <v-list-tile-action><v-icon>settings</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Керувати обліковими записами</v-list-tile-title></v-list-tile-content>
          </v-list-tile>
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

          <!-- <v-subheader>Водій</v-subheader>
          <v-list-tile @click="alert('hello')">
            <v-list-tile-action><v-icon>reorder</v-icon></v-list-tile-action>
            <v-list-tile-content><v-list-tile-title>Замовлення</v-list-tile-title></v-list-tile-content>
          </v-list-tile> -->

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
            <!-- <v-list-tile :to="{ name: 'operator-drivers' }">
              <v-list-tile-action><v-icon>directions_car</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Водії</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'operator-storage' }">
              <v-list-tile-action><v-icon>store</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Склад</v-list-tile-title></v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{ name: 'operator-statistic' }">
              <v-list-tile-action><v-icon>table_chart</v-icon></v-list-tile-action>
              <v-list-tile-content><v-list-tile-title>Статистика</v-list-tile-title></v-list-tile-content>
            </v-list-tile> -->
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>

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
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data: () => ({
    drawer: null,
    accountMenu: false,
  }),

  computed: {
    ...mapState({
      shortTitle: state => state.title.short,
      currentPage: state => state.currentPage,
    }),

    ...mapGetters({
      account: 'accounts/current',
      secondaryAccounts: 'accounts/secondaries',

      cartSize: 'menu/cartSize',
    }),
  },

  methods: {
    setAccount(id) {
      this.drawer = null
      this.accountMenu = false

      this.$store.commit('accounts/setCurrent', id)
    },

    switchAccountMenu() {
      this.accountMenu = !this.accountMenu
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

