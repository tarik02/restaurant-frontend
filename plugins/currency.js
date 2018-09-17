import Vue from 'vue'

const CURRENCY_SYMBOL = '₴'

const currency = value => `${isNaN(value) ? '' : (value / 100)}${CURRENCY_SYMBOL}`
currency.__toString = () => CURRENCY_SYMBOL

Vue.mixin({
	filters: {
		currency,
	},

	methods: {
		$currency: currency,
	},
})
