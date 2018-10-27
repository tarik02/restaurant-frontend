import createPersistedState from 'vuex-persistedstate'
import createMutationsSharer from 'vuex-shared-mutations'

export default ({store}) => {
  createPersistedState({
    key: 'accounts',
    paths: [
			'accounts',
		],
	})(store)

	createPersistedState({
    key: 'cart',
    paths: [
			'cart',
		],
	})(store)

	createPersistedState({
    key: 'driver',
    paths: [
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
