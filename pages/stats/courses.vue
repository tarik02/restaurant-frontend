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
        <td>{{ item.course.title }}</td>
        <td v-for="(date, key) in dates" :key="key">{{ item[key] || '0' }}</td>
      </template>
    </v-data-table>

    <bar-chart
      id="chart"
      :data="chartData"
      :ykeys="chartCourses"
      :labels="chartLabels"
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
import { DATETIME_PLAIN_DAY } from '~/common/format'

export default {
  data: () => ({
    data: {},

    dayOfWeek: false,
    since: null,
    until: null,
  }),

  computed: {
    ...mapGetters({
      coursesById: 'menu/coursesById',
    }),

    dates() {
      if (this.dayOfWeek) {
        return {
          1: 'Понеділок',
          2: 'Вівторок',
          3: 'Середа',
          4: 'Четвер',
          5: 'П\'ятниця',
          6: 'Субота',
          7: 'Неділя',
        }
      }

      return _(this.data)
        .values()
        .map(it => _.keys(it))
        .flatten()
        .uniq()
        .map(it => [it, it])
        .fromPairs()
        .value()
    },

    courses() {
      return _(this.data)
        .keys()
        .map(it => parseInt(it))
        .map(it => [it, this.coursesById[it]])
        .fromPairs()
        .value()
    },

    headers() {
      return [
        {
          text: '',
          sortable: false,
        },
        ..._.map(this.dates, it => ({
          text: this.dayOfWeek ? it : moment(it).format(DATETIME_PLAIN_DAY),
          sortable: false,
        })),
      ]
    },

    items() {
      return _(this.data)
        .map((dates, courseId) => ({
          course: this.coursesById[courseId],
          ...dates,
        }))
        .value()
    },

    chartCourses() {
      return _.keys(this.courses)
    },

    chartLabels() {
      return _.map(this.courses, course => course.title)
    },

    chartData() {
      const entries = {}
      for (const [course, dates] of _.toPairs(this.data)) {
        for (const [key, date] of _.toPairs(this.dates)) {
          let entry = entries[key]
          if (!entry) {
            entry = entries[key] = {
              day: date,
            }
          }
          
          entry[course] = dates[key] || 0
        }
      }

      return _.values(entries)
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
    this.$store.commit('setTitle', 'Статистика по стравах')

    this.updateData()
  },

  methods: {
    updateData: _.debounce(async function () {
      this.data = await this.$axios.$get('/stats/courses', {
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

