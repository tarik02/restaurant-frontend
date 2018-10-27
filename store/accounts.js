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

  deleteAccount: (state, id) => {
    if (state.currentId === id) {
      state.currentId = null
    }

    Vue.delete(state.accounts, id)
  },

  setAccountData: (state, data) => {
    const {id} = data

    Vue.set(state.accounts, id, {
      ...state.accounts[id],
      data,
      updating: false,
      lastDataUpdate: moment().unix(),
    })
  },

  setUpdating: (state, id) => {
    if (state.accounts[id]) {
      state.accounts[id].updating = true
    }
  },

  setCurrent: (state, id) => {
    state.currentId = id
  },
}

export const actions = {
  async init({ commit, state }) {
    _(state.accounts)
      .map((account, id) => {
        if (!account.auth) {
          commit('deleteAccount', id)
          return null
        }

        if (account.lastDataUpdate) {
          const diff = moment.duration(
            moment().diff(moment.unix(account.lastDataUpdate))
          ).asSeconds()

          if (!(
             account.updating && diff > 2 * 60 ||
            !account.updating && diff > 1 * 60
          )) {
            return null
          }
        }

        commit('setUpdating', account.data.id)

        const { tokenType, accessToken } = account.auth

        return [account, `${tokenType} ${accessToken}`]
      })
      .forEach(async ([account, auth]) => {
        let response
        try {
          response = await this.$axios.$get('/user', {
            headers: {
              'Authorization': auth,
            },
          })
        } catch (e) {
          console.error(e)
          if (e.response && parseInt(e.response.status) === 401) {
            commit('deleteAccount', account.data.id)
          }

          return
        }

        if (response === null) {
          return
        }

        commit('setAccountData', response)
      })
  },

  async register({ commit, state }, { username, email, phone, password }) {
    const request = {
      username,
      email: nullifyString(email),
      phone: nullifyString(phone),
      password,
    }

    const response = await this.$axios.$post('/auth/register', request, {
      headers: {
        'Authorization': null,
      },
    })
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

    if (!account.data) {
      return
    }

    commit('addAccount', account)
    commit('setCurrent', account.data.id)
  },
}
