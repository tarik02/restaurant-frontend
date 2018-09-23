import _ from 'lodash'
import Vue from 'vue'

export const state = () => ({
	cart: {},
})

export const getters = {
  countOf: ({ cart }) => id => cart[id] || 0,

  totalPrice: (state, { countOf }, { menu: { courses } }) => _(courses)
    .map(({id, price}) => price * countOf(id))
    .sum(),

  size: ({ cart }) => _(cart).values().sum(),

  data: ({ cart }) => cart,
}

export const mutations = {
	add: ({ cart }, { id, count }) => {
    if (!count) {
      count = 1
    }

    Vue.set(cart, id, (cart[id] || 0) + count)
  },

  remove: ({ cart }, { id, count, all }) => {
    if (!count) {
      count = 1
    }

    const current = cart[id] || 0
    if (count >= current || all) {
      Vue.delete(cart, id)
    } else {
      Vue.set(cart, id, current - count)
    }
  },

  clear: state => {
    state.cart = {}
  },
}
