import _ from 'lodash'
import Vue from 'vue'
import moment from 'moment'
import nullifyString from '~/common/nullify-string'

export const state = () => ({
  currentId: null,

  accounts: {},
})

export const getters = {
  current: state => state.currentId === null
    ? null
    : state.accounts[state.currentId],

  secondaries: state => _.omit(state.accounts, state.currentId),
}

export const mutations = {
  addAccount: (state, account) => {
    Vue.set(state.accounts, account.data.id, account)
  },

  setAccountData: (state, data) => {
    const {id} = data

    Vue.set(state.accounts, id, {
      ...state.accounts[id],
      data,
    })
  },

  setCurrent: (state, id) => {
    state.currentId = id
  },
}

export const actions = {
  async init({ commit, state }) {
    _(state.accounts)
      .map(async (account, id) => {
        const {tokenType, accessToken} = account.auth

        return this.$axios.$get('/user', {
          headers: {
            'Authorization': `${tokenType} ${accessToken}`,
          },
        })
      })
      .forEach(async (response, id) => {
        commit('setAccountData', await response)
      })
  },

  async register({ commit, state }, { username, email, phone, password }) {
    const request = {
      username,
      email: nullifyString(email),
      phone: nullifyString(phone),
      password,
    }

    const response = await this.$axios.$post('/auth/register', request)
    if (response.status !== 'ok') {
      throw new Error(response.reason)
    }

    return response.id
  },

  async login({ commit, state }, { username, password }) {
    const request = {
      client_id: process.env.API_CLIENT_ID,
      client_secret: process.env.API_CLIENT_SECRET,
      grant_type: 'password',
      username,
      password,
    }

    const response = await this.$axios.$post('/auth/token', request, {
      headers: {
        'Authorization': null,
      },
    })

    const tokenType = response.token_type
    const accessToken = response.access_token
    const refreshToken = response.refresh_token
    const expiresAt = moment().add(response.expires_in, 'second')

    const account = {
      data: await this.$axios.$get('/user', {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
        },
      }),
      
      auth: {
        tokenType,
        accessToken,
        refreshToken,
        expiresAt,
      },
    }

    commit('addAccount', account)
    commit('setCurrent', account.data.id)
  },
}
