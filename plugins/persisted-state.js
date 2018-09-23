import createPersistedState from 'vuex-persistedstate'
import createMutationsSharer from 'vuex-shared-mutations'

export default ({store}) => {
  createPersistedState({
    key: 'accounts',
    paths: [
			'accounts',
			'cart',
		],
	})(store)
	
	createMutationsSharer({
		predicate: [
			'accounts/addAccount',
			'accounts/setCurrent',

			'cart/add',
			'cart/remove',
			'cart/clear',
		],
	})(store)

	store.dispatch('accounts/init')
}
