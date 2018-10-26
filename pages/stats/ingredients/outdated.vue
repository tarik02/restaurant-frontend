<template>
  <v-card height="100%" flat style="margin-bottom: 24px;">
    <v-card-title>
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
              <td>{{ item.ingredient }}</td>
              <td v-for="(date, key) in dates" :key="key">{{ item[key] || '-' }}</td>
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
          <bar-chart
            v-if="chartDialog"
            id="chart"
            :data="chartData"
            :ykeys="chartIngredients"
            :labels="chartLabels"
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
import { DATETIME_PLAIN_DAY } from '~/common/format'

export default {
  data: () => ({
    data: {},

    since: null,
    until: null,

    tableDialog: false,
    chartDialog: false,
  }),

  computed: {
    dates() {
      const range = {}
      let i = 0
      for (let date = moment(this.since); date.diff(this.until, 'days') <= 0; date.add(1, 'day')) {
        range[date.format('YYYY-MM-DD')] = date.clone()
      }
      return range
    },

    ingredients() {
      return _(this.data)
        .keys()
        .map(it => it)
        .value()
    },

    headers() {
      return [
        {
          text: '',
          sortable: false,
        },
        ..._.map(this.dates, it => ({
          text: it.format(DATETIME_PLAIN_DAY),
          sortable: false,
        })),
      ]
    },

    items() {
      return _(this.data)
        .map((dates, ingredientId) => ({
          ingredient: ingredientId,
          ..._.mapValues(dates, ({ count, unit }) => count === 0 ? '-' : `${count} ${unit}`.trim()),
        }))
        .value()
    },

    chartIngredients() {
      return this.ingredients
    },

    chartLabels() {
      return this.chartIngredients
    },

    chartData() {
      const entries = {}
      for (const [ingredient, dates] of _.toPairs(this.data)) {
        for (const [key, date] of _.toPairs(this.dates)) {
          let entry = entries[key]
          if (!entry) {
            entry = entries[key] = {
              day: date.format(DATETIME_PLAIN_DAY),
            }
          }

          const {
            count = 0,
            unit = null,
          } = dates[key] || {} 
          
          entry[ingredient] = count
        }
      }

      return _.values(entries)
    },
  },

  watch: {
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

  created() {
    this.since = moment().startOf('day').add(-10, 'day')
    this.until = moment().startOf('day')

    const { since, until } = this.$route.query
    if (since) {
      this.since = moment(since).startOf('day')
    }
    if (until) {
      this.until = moment(until).startOf('day')
    }
  },

  mounted() {
    this.$store.commit('setTitle', 'Статистика термінів придатності')

    this.updateData()
  },

  methods: {
    async updateData() {
      this.$router.replace({
        name: 'stats-ingredients-outdated',
        query: {
          since: this.since.format('YYYY-MM-DD'),
          until: this.until.format('YYYY-MM-DD'),
        },
      })

      this.data = {}
      await this.loadData()
    },

    loadData: _.debounce(async function () {
      this.data = await this.$axios.$get('/stats/ingredients/outdated', {
        params: {
          since: this.since.format(),
          until: this.until.format(),
        },
      })
    }, 500),
  },
}
</script>
