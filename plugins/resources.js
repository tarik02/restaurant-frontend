import Vue from 'vue'
import { Resources, ResourcesByName } from '~/common/resources'

Vue.mixin({
	data: () => ({
		Resources,
		ResourcesByName,
	}),
})
