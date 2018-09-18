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
        <td>{{ item.title }}</td>
        <td>{{ item.price | currency }}</td>
        <td>{{ item.unit || '-' }}</td>
        <td>{{ item.floating ? 'Ні' : 'Так' }}</td>
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
          <span class="headline">Інгредієнт</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editValid" lazy-validation>
            <v-text-field
              v-model="editItem.title"
              :rules="[
                v => !!v || 'Назва обов\'язкова',
              ]"
              label="Назва"
              required
            />

            <v-text-field
              v-model="editItem.price"
              :rules="[
                v => v !== void 0 || 'Ціна обов\'язкова',
                v => (typeof v !== 'string') || !isNaN(parseFloat(v.replace(',', '.'))) || 'Ціна повинна бути числом',
              ]"
              suffix="₴"
              label="Ціна за одиницю"
              required
            />

            <v-text-field
              v-model="editItem.unit"
              label="Одиниця вимірювання"
              required
            />

            <v-checkbox
              v-model="editItemInteger"
              label="Ціле значення кількості"
            />
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
          <span class="headline">Видалення інгредієнту</span>
        </v-card-title>

        <v-card-text>
          Дійсьно бажаєте видалити інгредієнт "{{ editItem.title }}"
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
const INITIAL_ITEM = {
  id: null,
  title: '',
  price: 0,
  unit: '',
  floating: true,
}

export default {
  data: () => ({
    headers: [
      { text: 'Назва', sortable: true, value: 'title' },
      { text: 'Ціна/одиницю', sortable: true, value: 'price' },
      { text: 'Одиниця', sortable: true, value: 'unit' },
      { text: 'Ціле значення', sortable: false, value: 'floating' },
      { text: 'Дії', sortable: false, value: 'title' },
    ],

    items: [],
    totalItems: 0,
    pagination: {},
    loading: true,

    editDialog: false,
    deleteDialog: false,
    editItem: { ...INITIAL_ITEM },
    editValid: true,
  }),

  computed: {
    editItemInteger: {
      get() {
        return !this.editItem.floating
      },

      set(value) {
        this.editItem.floating = !value
      },
    },
  },

  watch: {
    pagination: {
      async handler() {
        await this.updateItems()
      },
      deep: true,
    },
  },

  mounted() {
    this.$store.commit('setTitle', 'Інгредієнти')
  },

  methods: {
    async updateItems() {
      this.loading = true

      const { sortBy, descending, page, rowsPerPage } = this.pagination

      try {
        const { data, pagination: { totalCount } } = await this.$axios.$get('/operator/ingredients', {
          params: {
            sortBy,
            descending,

            page,
            perPage: rowsPerPage,
          },
        })

        this.items = data
        this.totalItems = totalCount
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка отримання інгредієнтів')
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
        price: item.price / 100,
      }
      this.editDialog = true
    },

    deleteOpen(item) {
      this.editItem = {
        ...item,
        price: item.price / 100,
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
        price: this.editItem.price * 100,
      }

      try {
        this.$toast.show('Збереження...')

        const result = await this.$axios.$put('/operator/ingredients', request)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.editDialog = false
        this.$toast.success('Збережено')

        this.updateItems()
        this.$store.dispatch('operator/updateIngredients')
      } catch (e) {
        this.$toast.error('Помилка під час збереження')
      }
    },


    async deleteConfirm() {
      const id = this.editItem.id

      try {
        this.$toast.show('Видалення...')

        const result = await this.$axios.$delete('/operator/ingredients', {
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
        this.$store.dispatch('operator/updateIngredients')
      } catch (e) {
        this.$toast.error('Помилка під час видалення')
      }
    },
  },
}
</script>

