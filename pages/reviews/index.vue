<template>
  <v-card height="100%" flat>
    <v-card-title>
      <v-layout column>
        <v-select
          v-model="filter.rating"
          :items="[{value: null}, {value: 1}, {value: 2}, {value: 3}, {value: 4}, {value:5}]"
          :item-value="({ value }) => value"
          :item-text="({ value }) => (value || 'Без рейтингу')"
          label="Рейтинг"
          single-line
          multiple
          chips
          hide-details
        >
          <template slot="item" slot-scope="{ item: { value }, tile }">
            <v-checkbox
              v-model="tile.props.value"
              readonly
              color="#1867c0"
              style="flex: 0; margin-bottom: -5px; margin-right: 2px;"
            />
            <template v-if="value === null">
              <div class="ml-2">Без рейтингу</div>
            </template>
            <v-rating
              v-else
              v-model="value"
              readonly
            />
          </template>
        </v-select>

        <v-select
          v-model="filter.source_type"
          :items="Resources"
          :item-value="it => it.name"
          :item-text="it => it.label"
          label="Джерело"
          single-line
          multiple
          chips
          hide-details
        />

        <v-select
          v-model="filter.target_type"
          :items="Resources"
          :item-value="it => it.name"
          :item-text="it => it.label"
          label="Призначення"
          single-line
          multiple
          chips
          hide-details
        />
      </v-layout>
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
        <td><router-link :to="item.source.link">{{ item.source.title }}</router-link></td>
        <td><router-link :to="item.target.link">{{ item.target.title }}</router-link></td>
        <td>{{ (item.user && item.user.username) || 'Анонім' }}</td>
        <td>
          <div
            v-if="item.text"
            class="text-link"
            @click="openText(item)"
          >
            {{ item.text | html_substring(40, { breakWords: false, suffix: '...' }) }}
          </div>
          <template v-else>-</template>
        </td>
        <td>
          <v-tooltip bottom nudge-top="50" class="rating-tooltip">
            <template slot="activator" tag="a">
              {{ item.rating }}/5
            </template>
            <v-rating
              v-model="item.rating"
              readonly
              small
              background-color="white"
              color="white"
            />
          </v-tooltip>
        </td>
        <td>{{ item.created_at | moment(Format.DATETIME_MOMENT) }}</td>
      </template>
    </v-data-table>

    <v-dialog v-model="textDialog.open">
      <v-card>
        <v-card-title class="headline">Текст відгуку</v-card-title>
        <v-card-text>{{ textDialog.text }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="textDialog.open = false"
          >Закрити</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import { resource } from '~/common/resources'

export default {
  data: () => ({
    items: [],
    loading: true,

    totalItems: 0,
    pagination: {
      sortBy: 'created_at',
      descending: true,
    },
    filter: {
      source_type: [],
      target_type: [],
      rating: [],
    },

    textDialog: {
      open: false,
      text: '',
    },
  }),

  computed: {
    headers() {
      return _.filter([
        { text: 'Джерело', sortable: false, value: 'source' },
        { text: 'Призначення', sortable: false, value: 'targeet' },
        { text: 'Користувач', sortable: false, value: 'user' },
        { text: 'Текст', sortable: false, value: 'text' },
        { text: 'Оцінка', sortable: true, value: 'rating' },
        { text: 'Створено', sortable: true, value: 'created_at' },
      ])
    },
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
    this.$store.commit('setTitle', 'Відгуки')
  },

  methods: {
    async updateItems() {
      this.loading = true

      const data = new FormData()

      const { sortBy, descending, page, rowsPerPage } = this.pagination
      const filter = _.omitBy(this.filter, value => value === null)

      try {
        const { data, meta: { totalCount } } = await this.$axios.$get(
          '/reviews',
          {
            params: {
              page,
              perPage: rowsPerPage,

              sortBy,
              descending,

              filter,
            },
          }
        )

        this.items = _.map(data, ({
          source,
          target,
          created_at,

          ...batch
        }) => ({
          ...batch,

          source: resource(source),
          target: resource(target),
          created_at: moment(created_at),
        }))

        this.totalItems = totalCount
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка отримання даних')
      }

      this.loading = false
    },

    openText(item) {
      this.textDialog.open = true
      this.textDialog.text = item.text
    },
  },
}
</script>

<style lang="stylus" scoped>
.rating-tooltip
  display block
  height 100%

  >>>span
    display flex
    height 100%
    align-items center
    justify-content center

.text-link
  cursor pointer
  color #1976d2
  text-decoration underline

</style>
