import _ from 'lodash'
import Vue from 'vue'

export const state = () => ({
	orders: {},
})

export const getters = {
  count: ({ orders }) => _.values(orders).length,
  empty: (state, { count }) => count === 0,
}

export const mutations = {
  add: (state, { id, token }) => {
    Vue.set(state.orders, id, token)
  },

  remove: (state, id) => {
    Vue.delete(state.orders, id)
  },
}
