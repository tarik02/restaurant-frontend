export const state = () => ({
  title: {
    common: '',
    short: '',
  },

  currentRole: 'Меню',
  currentPage: '',
})

export const mutations = {
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
