export const state = () => ({
  courses: [],
})

export const getters = {
  cartCourses: state => state.courses.filter(course => course.cartCount > 0),
  
  totalPrice: (state, getters) => getters.cartCourses
    .map(course => course.price * course.cartCount)
    .reduce((a, b) => a + b, 0),

  cartSize: (state, getters) => getters.cartCourses
    .map(course => course.cartCount)
    .reduce((a, b) => a + b, 0),

  cartData: (state, getters) => getters.cartCourses
    .reduce((obj, { id, cartCount }) => ({ ...obj, [id]: cartCount }), {}),
}

export const mutations = {
  setCourses: (state, courses) => {
    state.courses = courses.map(course => ({
      ...course,
      cartCount: 0,
    }))
  },

  addCart: (state, { course, count }) => {
    if (!count) {
      count = 1
    }

    course.cartCount += count
  },

  removeCart: (state, { course, count, all }) => {
    if (!count) {
      count = 1
    }

    if (count >= course.cartCount || all) {
      course.cartCount = 0
    } else {
      course.cartCount -= count
    }
  },

  clearCart: state => {
    state.courses = state.courses.map(course => {
      course.cartCount = 0

      return course
    })
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
