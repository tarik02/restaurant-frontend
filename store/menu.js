import _ from 'lodash'

export const state = () => ({
  courses: [],
})

export const getters = {
  cartCourses: ({ courses }, {}, {}, { 'cart/countOf': countOf }) =>
    courses.filter(({ id }) => countOf(id) > 0),
}

export const mutations = {
  setCourses: (state, courses) => {
    state.courses = courses.map(course => ({ ...course }))
  },
}

export const actions = {
  async initCourses({ state, commit }) {
    if (state.courses.length === 0) {
      const { data } = await this.$axios.$get('/courses')
      commit('setCourses', data)
    }
  },
}
