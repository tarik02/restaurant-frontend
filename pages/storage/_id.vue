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
        <td>{{ item.ingredient }}</td>
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
  </v-card>
</template>

<script>
const INITIAL_ITEM = {
  id: null,
  name: '',
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

  computed: {
    id() {
      return this.$route.params.id
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
    this.$store.commit('setTitle', 'Склад...') // TODO: Load storage name
  },

  methods: {
    async updateItems() {
      this.loading = true

      const { sortBy, descending, page, rowsPerPage } = this.pagination

      try {
        const { data, meta: { totalCount } } = await this.$axios.$get('/storage/batches', {
          params: {
            id: this.id,
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
  },
}
</script>
