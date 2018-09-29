import Vue from 'vue'

import * as Validate from '~/common/validate'

Vue.mixin({
	data: () => ({
		Validate,
	}),
})
