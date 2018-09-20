<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      mini-variant.sync="miniVariant"
      app
      fixed>
      <v-toolbar flat class="transparent">
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
      </v-toolbar>

      <v-list
        dense
        class="pt-0"
      >
        <v-divider />

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
  }),

  computed: {
    ...mapState({
      shortTitle: state => state.title.short,
      currentPage: state => state.currentPage,
    }),

    ...mapGetters({
      cartSize: 'menu/cartSize',
    }),
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
</style>

