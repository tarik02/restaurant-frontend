<template>
  <v-card height="100%" flat style="margin-bottom: 24px;">
    <v-card-title>
      <v-checkbox
        v-model="dayOfWeek"
        label="День тижня"
      />

      <v-layout row style="justify-content: stretch;">
        <date-picker
          v-model="since"
          label="Від"
          style="flex: 1;"
        />

        <div style="width: 30px; flex: 0 1 auto;" />

        <date-picker
          v-model="until"
          label="До"
          style="flex: 1;"
        />
      </v-layout>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="false"
      :rows-per-page-items="[-1]"
      class="elevation-1"
    >
      <template slot="items" slot-scope="{ item }">
        <td>{{ item.day }}</td>
        <td>{{ item.income }}{{ CURRENCY_SYMBOL }}</td>
      </template>
    </v-data-table>

    <bar-chart
      id="chart2"
      :post-units="CURRENCY_SYMBOL"
      :data="items"
      :labels="['Дохід']"
      :ykeys="['income']"
      xkey="day"
      grid
      grid-text-weight="bold"
      resize
    />
  </v-card>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { DAYS_OF_WEEK } from '~/common/consts'
import { DATETIME_PLAIN_DAY } from '~/common/format'

export default {
  data: () => ({
    data: {},

    dayOfWeek: true,
    since: null,
    until: null,
  }),

  computed: {
    ...mapGetters({
      coursesById: 'menu/coursesById',
    }),

    dates() {
      if (this.dayOfWeek) {
        return _.range(1, 8)
      }

      const range = []
      for (let date = moment(this.since); date.diff(this.until, 'days') <= 0; date.add(1, 'day')) {
        range.push(date.clone())
      }
      return range
    },

    headers() {
      return [
        {
          text: 'День',
          sortable: false,
        },
        {
          text: 'Дохід',
          sortable: false,
        },
      ]
    },

    items() {
      return _.map(this.dates,
        this.dayOfWeek
        ? (key => ({
          day: DAYS_OF_WEEK[key - 1],
          income: (this.data[key] || 0) / 100,
        }))
        : (key => ({
          day: key.format(DATETIME_PLAIN_DAY),
          income: (this.data[key.format('YYYY-MM-DD')] || 0) / 100,
        }))
      )
    },
  },

  watch: {
    dayOfWeek: {
      async handler() {
        await this.updateData()
      },
    },
    since: {
      async handler() {
        await this.updateData()
      },
    },
    until: {
      async handler() {
        await this.updateData()
      },
    },
  },

  async fetch({ store, params }) {
    await store.dispatch('menu/initCourses')
  },

  created() {
    this.since = moment().startOf('day').add(-10, 'day')
    this.until = moment().startOf('day')
  },

  mounted() {
    this.$store.commit('setTitle', 'Статистика по доходу')

    this.updateData()
  },

  methods: {
    async updateData() {
      this.data = {}
      await this.loadData()
    },

    loadData: _.debounce(async function () {
      this.data = await this.$axios.$get('/stats/income', {
        params: {
          dayOfWeek: this.dayOfWeek,
          since: this.since.format(),
          until: this.until.format(),
        },
      })
    }, 500),
  },
}
</script>
