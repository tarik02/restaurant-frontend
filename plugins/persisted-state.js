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

  createPersistedState({
    key: 'order',
    paths: [
      'order',
    ],
  })(store)

  createPersistedState({
    key: 'orders',
    paths: [
      'orders',
    ],
  })(store)


  createMutationsSharer({
    predicate: [
      'accounts/addAccount',
      'accounts/deleteeAccount',
      'accounts/setAccountData',
      'accounts/setUpdating',
      'accounts/setCurrent',

      'cart/add',
      'cart/remove',
      'cart/clear',

      'driver/enableWork',
      'driver/disableWork',
      'driver/enableTracker',
      'driver/disableTracker',

      'orders/add',
      'orders/remove',
    ],
  })(store)

  store.dispatch('accounts/init')
}
