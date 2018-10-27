export const state = () => ({
  appName: null,

  title: {
    common: '',
    short: '',
  },

  currentRole: 'Меню',
  currentPage: '',
})

export const mutations = {
  setAppName: (state, name) => {
    state.appName = name
  },

  setTitle: (state, title) => {
    if (typeof title === 'string') {
      state.title = {
        common: title,
        short: title,
      }
    } else {
      state.title = title
    }
  },

  switchRole(state, newRole) {
    state.currentRole = newRole
  },

  switchPage(state, newPage) {
    state.currentPage = newPage
  },
}
