<template>
  <v-card height="100%" flat>
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

    <v-card-actions>
      <v-spacer />

      <v-btn color="primary" @click="tableDialog = true">Таблиця</v-btn>
      <v-btn color="primary" @click="chartDialog = true">Графік</v-btn>
    </v-card-actions>

    <v-dialog v-model="tableDialog" :fullscreen="$vuetify.breakpoint.mdAndDown">
      <v-card>
        <v-toolbar dark color="primary">
          <v-icon>table_chart</v-icon>
          <v-toolbar-title>Таблиця</v-toolbar-title>

          <v-spacer />

          <v-toolbar-items>
            <v-btn dark flat @click="tableDialog = false">Закрити</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <v-data-table
            v-if="tableDialog"
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
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="chartDialog" :fullscreen="$vuetify.breakpoint.mdAndDown">
      <v-card>
        <v-toolbar dark color="primary">
          <v-icon>bar_chart</v-icon>
          <v-toolbar-title>Графік</v-toolbar-title>

          <v-spacer />

          <v-toolbar-items>
            <v-btn dark flat @click="chartDialog = false">Закрити</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text>
          <component
            v-if="chartDialog"
            id="chart"
            :is="dayOfWeek ? 'bar-chart' : 'line-chart'"
            :post-units="CURRENCY_SYMBOL"
            :data="items"
            :labels="['Дохід']"
            :ykeys="['income']"
            xkey="day"
            grid
            grid-text-weight="bold"
            resize
          />
        </v-card-text>
      </v-card>
    </v-dialog>
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

    dayOfWeek: false,
    since: null,
    until: null,

    tableDialog: false,
    chartDialog: false,
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

    const { 'day-of-week': dayOfWeek, since, until } = this.$route.query
    if (dayOfWeek === 'true') {
      this.dayOfWeek = true
    }
    if (since) {
      this.since = moment(since).startOf('day')
    }
    if (until) {
      this.until = moment(until).startOf('day')
    }
  },

  mounted() {
    this.$store.commit('setTitle', 'Статистика доходу')

    this.updateData()
  },

  methods: {
    async updateData() {
      this.$router.replace({
        name: 'stats-income',
        query: {
          'day-of-week': this.dayOfWeek,
          since: this.since.format('YYYY-MM-DD'),
          until: this.until.format('YYYY-MM-DD'),
        },
      })

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
