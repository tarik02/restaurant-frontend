import createPersistedState from 'vuex-persistedstate'
import createMutationsSharer from 'vuex-shared-mutations'

export default ({store}) => {
  createPersistedState({
    key: 'accounts',
    paths: ['accounts'],
	})(store)
	
	createMutationsSharer({
		predicate: [
			'accounts/addAccount',
			'accounts/setCurrent',
		],
	})(store)

	store.dispatch('accounts/init')
}
