export const state = () => ({
	target: null,
	info: null,
	cart: null,
})

export const getters = {
}

export const mutations = {
	setTarget: (state, { address, coordinates }) => {
		state.target = { address, coordinates }
	},

	setInfo: (state, { name, phone, notes }) => {
		state.info = { name, phone, notes }
	},

	setCart: (state, cart) => {
		state.cart = cart
	},
}

export const actions = {
  async order({ state: { target, info, cart }, commit }) {
    const request = { target, info, cart }

    try {
      const data = await this.$axios.$post('/order', request)

      if (data.status === 'ok') {
        return {
          status: true,
          order: data['order_id'],
          token: data['token'],
        }
      }
      
      return {
        status: false,
        reason: data.status,
      }
    } catch (e) {
      return {
        status: false,
        reason: 'error',
      }
    }
	},
}
