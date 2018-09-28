<template>
  <v-card height="100%" flat>
    <v-card-title>
      <v-select
        v-model="filter.status"
        :items="['На кухні', 'У дорозі', 'Доставлено']"
        label="Статус"
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
      class="elevation-1"

    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.id }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.phone }}</td>
        <td>{{ props.item.price | currency }}</td>
        <td>{{ props.item.status | orderStatus }}</td>
        <td>{{ props.item.createdAt | moment(Format.DATETIME_MOMENT) }}</td>
        <!-- <td class="justify-center layout px-0">
          <v-btn icon small color="primary" class="mr-2" @click="alert()">
            <v-icon small>edit</v-icon>
          </v-btn>
        </td> -->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import moment from 'moment'

export default {
  data: () => ({
    headers: [
      { text: '#', align: 'left', sortable: false, value: 'id' },
      { text: 'Ім\'я', sortable: false, value: 'name' },
      { text: 'Телефон', sortable: false, value: 'phone' },
      { text: 'Вартість', sortable: false, value: 'phone' },
      { text: 'Статус', sortable: false, value: 'status' },
      { text: 'Час замовлення', sortable: false, value: 'createdAt' }, 
      // { text: 'Дії', sortable: false, value: 'name' }, 
    ],

    items: [],
    totalItems: 0,
    pagination: {},
    loading: true,

    filter: {
      status: null,
    },
  }),

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
    this.$store.commit('setTitle', 'Замовлення')
  },

  methods: {
    async updateItems() {
      const statusFilter = this.filter.status
        
        ?
        this.filter.status.map(it => ({
          'На кухні': ['waiting', 'cooking'],
          'У дорозі': ['inroad'],
          'Доставлено': ['done'],
        }[it]))
        .reduce((prev, cur) => [...prev, ...cur], [])
        
        : null

      this.loading = true

      const { sortBy, descending, page, rowsPerPage } = this.pagination
      const result = await this.$axios.$post('/operator/orders', {
        page,
        perPage: rowsPerPage,

        filter: {
          status: statusFilter,
        },
      })

      this.loading = false
      this.items = result.data.map(order => ({
        ...order,
        createdAt: moment(order.created_at),
      }))
      this.totalItems = result.total
    },
  },
}
</script>

