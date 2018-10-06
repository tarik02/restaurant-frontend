import createPersistedState from 'vuex-persistedstate'
import createMutationsSharer from 'vuex-shared-mutations'

export default ({store}) => {
  createPersistedState({
    key: 'accounts',
    paths: [
			'accounts',
			'cart',
			'driver',
		],
	})(store)
	
	createMutationsSharer({
		predicate: [
			'accounts/addAccount',
			'accounts/setCurrent',

			'cart/add',
			'cart/remove',
			'cart/clear',

			'driver/enablingTracker',
			'driver/enableTracker',
			'driver/disableTracker',
		],
	})(store)

	store.dispatch('accounts/init')
}
