<template>
  <v-card height="100%" flat>
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
        <td>{{ item.name }}</td>
        <td class="px-0">
          <v-btn
            icon
            small
            @click="editOpen(item)"
          ><v-icon small>edit</v-icon></v-btn>

          <v-btn
            icon
            small
            @click="deleteOpen(item)"
          ><v-icon small>delete</v-icon></v-btn>
        </td>
      </template>
    </v-data-table>

    <v-btn
      color="primary"
      fab
      fixed
      bottom
      right
      @click="newOpen"
    ><v-icon>add</v-icon></v-btn>

    <v-btn fab style="visibility: hidden;" />

    <v-dialog
      v-model="editDialog"
      persistent
    >
      <v-card>
        <v-card-title>
          <span class="headline">Склад</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editValid" lazy-validation>
            <v-text-field
              v-model="editItem.name"
              :rules="[
                v => !!v || 'Назва обов\'язкова',
              ]"
              label="Назва"
              required
            />

            <!-- TODO: location -->
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn flat @click="editCancel">
            Скасувати
          </v-btn>
          
          <v-btn color="primary" @click="editSave">
            Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Видалення складу</span>
        </v-card-title>

        <v-card-text>
          Дійсьно бажаєте видалити склад "{{ editItem.name }}"
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          
          <v-btn flat @click="deleteDialog = false">
            Скасувати
          </v-btn>

          <v-btn color="red" dark @click="deleteConfirm">
            Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { LOCATION_DEFAULT } from '~/common/consts'

const INITIAL_ITEM = {
  id: null,
  name: '',
  location: LOCATION_DEFAULT,
}

export default {
	data: () => ({
    headers: [
      { text: 'Назва', sortable: false, value: 'name' },
      { text: 'Дії', sortable: false, value: 'name' },
    ],

    items: [],
    loading: true,

    totalItems: 0,
    pagination: {},

    editDialog: false,
    deleteDialog: false,
    editItem: { ...INITIAL_ITEM },
    editValid: true,
	}),

  watch: {
    pagination: {
      async handler() {
        await this.updateItems()
      },
      deep: true,
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Склади')
  },

  methods: {
    async updateItems() {
      this.loading = true

      const { sortBy, descending, page, rowsPerPage } = this.pagination

      try {
        const { data, meta: { totalCount } } = await this.$axios.$get('/storage', {
          params: {
            page,
            perPage: rowsPerPage,
          },
        })

        this.items = data
        this.totalItems = totalCount
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка отримання даних')
      }

      this.loading = false
    },

    newOpen() {
      this.editItem = { ...INITIAL_ITEM }
      this.editDialog = true
    },

    editOpen(item) {
      this.editItem = {
        ...item,
      }
      this.editDialog = true
    },

    deleteOpen(item) {
      this.editItem = {
        ...item,
      }
      this.deleteDialog = true
    },


    editCancel() {
      this.editDialog = false
    },

    async editSave() {
      if (!this.$refs.editForm.validate()) {
        return false
      }

      const request = {
        ...this.editItem,
      }

      try {
        this.$toast.show('Збереження...')

        const result = await this.$axios.$put('/storage', request)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.editDialog = false
        this.$toast.success('Збережено')

        this.updateItems()
        // this.$store.dispatch('operator/updateIngredients')
      } catch (e) {
        this.$toast.error('Помилка під час збереження')
      }
    },


    async deleteConfirm() {
      const id = this.editItem.id

      try {
        this.$toast.show('Видалення...')

        const result = await this.$axios.$delete('/storage', {
          params: {
            id,
          },
        })
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.deleteDialog = false
        this.$toast.success('Видалено')

        this.updateItems()
        // this.$store.dispatch('operator/updateIngredients')
      } catch (e) {
        this.$toast.error('Помилка під час видалення')
      }
    },
  },
}
</script>

