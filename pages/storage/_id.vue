<template>
  <v-card height="100%" flat>
    <v-card-title>
      <v-select
        v-model="filter.ingredient_id"
        :items="ingredients"
        item-text="title"
        item-value="id"
        label="Інгредієнт"
        single-line
        multiple
        chips
        hide-details
      />
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
        <td>{{ item.ingredient.title }}</td>
        <td>{{ item.best_by | moment(Format.DATETIME_MOMENT) }}</td>
        <td>{{ item.remaining }}/{{ item.count }} {{ item.ingredient.unit }}</td>
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
          <span class="headline">Товар складу</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editValid" lazy-validation>
            <v-combobox
              v-model="editItem.ingredient"
              :rules="[
                v => !!v || 'Інгредієнт обов\'язковий',
              ]"
              :items="ingredients"
              :item-text="({ title }) => title"
              label="Інгредієнт"
              required
            />

            <v-datetime-picker
              v-model="editItem.best_by"
              :rules="[
                v => !!v || 'Термін придатності обов\'язковий',
              ]"
              label="Придатний до"
              required
            />

            <v-text-field
              v-model="editItem.count"
              :rules="[
                v => !!v || 'Кількість обов\'язкова',
                editItem.ingredient ? Validate[editItem.ingredient.floating ? 'float' : 'integer'] : Validate.nop,
              ]"
              :suffix="editItem.ingredient && editItem.ingredient.unit || ''"
              type="number"
              label="Кількість"
              required
            />

            <v-text-field
              v-model="editItem.remaining"
              :placeholder="`${editItem.count}`"
              :rules="[
                editItem.ingredient ? Validate[editItem.ingredient.floating ? 'float' : 'integer'] : Validate.nop,
              ]"
              :suffix="editItem.ingredient && editItem.ingredient.unit || ''"
              type="number"
              label="Залишок"
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
          <span class="headline">Видалення товару зі складу</span>
        </v-card-title>

        <v-card-text>
          Дійсьно бажаєте видалити товар "{{ editItem.ingredient && editItem.ingredient.title }}" зі складу "{{ storage.name }}"
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
import moment from 'moment'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'

const INITIAL_ITEM = {
  id: null,
  ingredient: null,
  count: 0,
  remaining: null,
  best_by: null,
}

export default {
  data: () => ({
    headers: [
      { text: 'Інгредієнт', sortable: false, value: 'ingredient_id' },
      { text: 'Придатний до', sortable: true, value: 'best_by' },
      { text: 'Залишилося/кількість', sortable: true, value: 'remaining' },
      { text: 'Дії', sortable: false, value: 'name' },
    ],

    // storage: null,

    items: [],
    loading: true,

    totalItems: 0,
    pagination: {
      sortBy: 'best_by',
      descending: false,
    },
    filter: {
      ingredient_id: null,
    },

    editDialog: false,
    deleteDialog: false,
    editItem: { ...INITIAL_ITEM },
    editValid: true,
  }),

  async asyncData({ $axios, params }) {
    const { data: storage } = await $axios.$get(`/storage/${params.id}`)

    return {
      storage,
    }
  },

  async fetch ({ store }) {
    await store.dispatch('operator/init')
  },

  computed: {
    id() {
      return parseInt(this.$route.params.id)
    },

    ...mapState({
      ingredients: state => state.operator.ingredients,
    }),

    ...mapGetters({
      ingredientsById: 'operator/ingredientsById',
    }),
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
    this.$store.commit('setTitle', `Склад '${this.storage.name}'`)
  },

  methods: {
    async updateItems() {
      this.loading = true

      const data = new FormData()

      const { sortBy, descending, page, rowsPerPage } = this.pagination
      const filter = _.omitBy(this.filter, value => value === null)

      try {
        const { data, meta: { totalCount } } = await this.$axios.$get(`/storage/${this.id}/batches`, {
          params: {
            page,
            perPage: rowsPerPage,

            sortBy,
            descending,

            filter,
          },
        })

        this.items = _.map(data, ({
          ingredient_id,
          best_by,
          ...batch
        }) => ({
          ...batch,
          ingredient: this.ingredientsById[ingredient_id],
          best_by: moment(best_by),
        }))

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

      const request = (({
        id,

        ingredient,
        count,
        remaining,
        best_by,

        ...batch
      }) => ({
        ...batch,

        ingredient_id: ingredient.id,
        count: parseFloat(count),
        remaining: remaining ? parseFloat(remaining) : parseFloat(count),
        best_by: moment(best_by).toISOString(),
      }))(this.editItem)

      try {
        this.$toast.show('Збереження...')

        const result = await this.$axios.$put(_.trimEnd(`/storage/${this.id}/batches/${this.editItem.id || ''}`, '/'), request)
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


    async deleteConfirm() {
      const id = this.editItem.id

      try {
        this.$toast.show('Видалення...')

        const result = await this.$axios.$delete(`/storage/${this.id}/batches/${id}`)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.deleteDialog = false
        this.$toast.success('Видалено')

        this.updateItems()
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка під час видалення')
      }
    },
  },
}
</script>
