import _ from 'lodash'
import { uploaded } from '~/common/uploaded'

export const state = () => ({
  courses: [],
  ingredients: [],

  coursesLoading: true,
  ingredientsLoading: true,

  initialized: false,
})

export const getters = {
  coursesById: state => _.mapKeys(state.courses, 'id'),
  ingredientsById: state => _.mapKeys(state.ingredients, 'id'),
}

export const mutations = {
  setInitialized: state => state.initialized = true,

  setCourses: (state, { courses } = {}) => {
    state.coursesLoading = !courses
    state.courses = courses || []
  },
  
  setIngredients: (state, { ingredients } = {}) => {
    state.ingredientsLoading = !ingredients
    state.ingredients = ingredients || []
  },
}

export const actions = {
  async updateCourses({ commit }) {
    commit('setCourses')

    const { data: courses } = await this.$axios.$get('/operator/courses')
    commit('setCourses', { courses })
  },

  async updateIngredients({ commit }) {
    commit('setIngredients')

    const { data: ingredients } = await this.$axios.$get('/operator/ingredients')
    commit('setIngredients', { ingredients })
  },

  async init({ state, commit, dispatch }) {
    if (state.initialized) {
      return
    }

    commit('setInitialized')
    await Promise.all([
      dispatch('updateCourses'),
      dispatch('updateIngredients'),
    ])
  },
}
