<template>
  <v-card height="100%" flat>
    <v-card-title>
      <v-layout column>
        <v-select
          v-model="filter.roles"
          :items="lodash.map(roles, (label, value) => ({ label, value }))"
          :item-value="({ value }) => value"
          :item-text="({ label }) => label"
          label="Ролі"
          single-line
          multiple
          chips
          hide-details
        />
      </v-layout>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      :rows-per-page-items="[25, 100]"
      must-sort
      class="elevation-1"
    >
      <template slot="items" slot-scope="{ item }">
        <td>{{ item.id }}</td>
        <td>{{ item.username }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.phone }}</td>
        <td>
          <div
            class="text-link"
            @click="openRolesEdit(item)"
          >
            {{ rolesOf(item) }}
          </div>
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="rolesDialog.open">
      <v-card v-if="rolesDialog.item">
        <v-card-title class="headline">Користувач {{ rolesDialog.item.username }}</v-card-title>
        <v-card-text class="checkbox-container">
          <div
            class="mb-3"
            style="font-size: 20px;"
          >Ролі</div>

          <v-form>
            <v-layout
              v-for="(label, value) in roles"
              :key="value"
              row
            >
              <v-checkbox
                v-model="rolesDialog.roles[value]"
                :label="label"
                style="flex-grow: 0; width: 200px;"
              />

              <v-select
                v-if="value === 'cook'"
                v-model="additonal.storageId"
                :disabled="!rolesDialog.roles[value]"
                :items="storages"
                :item-value="({ id }) => id"
                :item-text="({ name }) => name"
                label="Кафе"
                single-line
                hide-details
                style="flex-grow: 0;"
                required="rolesDialog.roles[value]"
              />
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            flat
            @click="rolesDialog.open = false"
          >Закрити</v-btn>

          <v-btn
            color="primary"
            @click="rolesDialog.open = false, saveRoles()"
          >Зберегти</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import { resource } from '~/common/resources'

const ADDITONAL_DEFAULT = {
  storageId: null,
}

export default {
  data: () => ({
    roles: {},
    storages: [],

    items: [],
    loading: true,

    totalItems: 0,
    pagination: {
    },
    filter: {
      roles: [],
    },

    additonal: {
      ...ADDITONAL_DEFAULT,
    },

    rolesDialog: {
      open: false,

      item: null,
      roles: null,
    },
  }),

  computed: {
    headers() {
      return _.filter([
        { text: '#', sortable: false, value: 'id' },
        { text: 'Ім\'я', sortable: false, value: 'username' },
        { text: 'Емейл', sortable: false, value: 'email' },
        { text: 'Телефон', sortable: false, value: 'phone' },
        { text: 'Ролі', sortable: false, value: 'roles' },
      ])
    },

    rolesOf() {
      return ({ roles }) => {
        const rolesWithNames = roles.map(role => this.roles[role]).filter(it => it)
        return rolesWithNames.length === 0
          ? 'Без ролей'
          : rolesWithNames.join(', ')
      }
    },
  },
  
  watch: {
    pagination: {
      async handler() {
        await this.updateItems()
      },
      deep: true,
    },

    filter: {
      async handler() {
        await this.updateItems()
      },
      deep: true,
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Користувачі')
  },

  methods: {
    async updateItems() {
      this.loading = true

      const data = new FormData()

      const { page, rowsPerPage } = this.pagination

      try {
        const { roles, storages, data, meta: { totalCount } } = await this.$axios.$get(
          '/operator/users',
          {
            params: {
              page,
              perPage: rowsPerPage,

              roles: this.filter.roles,
            },
          }
        )

        this.storages = storages
        this.roles = roles

        this.items = _.map(data, ({
          source,
          target,
          created_at,

          ...batch
        }) => ({
          ...batch,

          source: resource(source),
          target: resource(target),
          created_at: moment(created_at),
        }))

        this.totalItems = totalCount
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка отримання даних')
      }

      this.loading = false
    },

    openRolesEdit(item) {
      this.rolesDialog.open = true
      this.rolesDialog.item = item
      const roles = this.rolesDialog.roles = _(this.roles)
        .map((label, role) => [role, item.roles.indexOf(role) !== -1])
        .fromPairs()
        .value()
      this.additonal = {
        ...ADDITONAL_DEFAULT,
      }
      if (roles['cook']) {
        this.additonal.storageId = item.additonal['storage_id']
      }
    },

    async saveRoles() {
      const roles = _(this.rolesDialog.roles)
        .map((value, key) => value ? key : null)
        .filter()
        .value()
        
      try {
        this.$toast.show('Збереження...')

        const request = {
          roles,
        }
        if (roles.indexOf('cook') !== -1) {
          request['storage_id'] = this.additonal.storageId
        }
        const result = await this.$axios.$post(`/operator/users/${this.rolesDialog.item.id}/roles`, request)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.editDialog = false
        this.$toast.success('Збережено')

        this.updateItems()
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка під час збереження')
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.text-link
  cursor pointer
  color #1976d2
  text-decoration underline

.checkbox-container>*
  padding 0
  margin 0
</style>
