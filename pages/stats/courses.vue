<template>
  <v-card height="100%" flat style="margin-bottom: 24px;">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="false"
      :rows-per-page-items="[-1]"
      class="elevation-1"
    >
      <template slot="items" slot-scope="{ item }">
        <td>{{ item.course.title }}</td>
        <td v-for="date in dates" :key="date">{{ item[date] || '' }}</td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { DATETIME_DAY } from '~/common/format'

export default {
  data: () => ({
    data: null,
  }),

  computed: {
    ...mapGetters({
      coursesById: 'menu/coursesById',
    }),

    dates() {
      return _(this.data)
        .values()
        .map(it => _.keys(it))
        .flatten()
        .uniq()
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
        ...this.dates.map(it => ({
          text: moment(it).format(DATETIME_DAY),
          sortable: false,
        })),
      ]
    },

    items() {
      // return _.keys(this.courses).map(it => this.data[it])
      return _(this.data)
        .map((dates, courseId) => ({
          course: this.coursesById[courseId],
          ...dates,
        }))
        .value()
    },
  },

  async fetch({ store, params }) {
    await store.dispatch('menu/initCourses')
  },

  mounted() {
    this.$store.commit('setTitle', 'Статистика по стравах')

    this.updateData()
  },

  methods: {
    async updateData() {
      this.data = await this.$axios.$get('/stats/courses')
    },
  },
}
</script>

