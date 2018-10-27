<template>
  <v-card height="100%" flat class="px-2 pt-2">
    <div class="subheading">Готуються</div>
    <div>
      <v-card
        v-for="course in cookingQueue"
        :key="course.id"
        class="mb-3"
      >
        <v-layout row align-center>
          <div class="ma-2">
            Замовлення: #{{ course.order_id }}
            <br />
            Страва: {{ coursesById[course.course_id].title }}
          </div>

          <v-spacer />

          <v-btn
            color="error"
            @click="cancelCooking(course)"
          >
            Відмінити
          </v-btn>

          <v-btn
            color="primary"
            @click="doneCooking(course)"
          >
            Готово
          </v-btn>
        </v-layout>
      </v-card>
    </div>

    <v-divider class="mt-4 mb-2" />

    <div class="subheading">Очікують</div>
    <div>
      <v-card
        v-for="course in cookQueue"
        :key="course.id"
        class="mb-3"
      >
        <v-layout row align-center>
          <div class="ma-2">
            Замовлення: #{{ course.order_id }}
            <br />
            Страва: {{ coursesById[course.course_id].title }}
            <br />
            Кількість: {{ course.remaining }}
            <!-- Очікують/готуються/готові: {{ course.remaining }}/{{ course.count - course.remaining - course.done }}/{{ course.done }} -->
          </div>

          <v-spacer />

          <v-btn
            color="primary"
            @click="startCooking(course)"
          >
            Готувати
          </v-btn>
        </v-layout>
      </v-card>
    </div>
  </v-card>
</template>

<script>
import delay from 'await-delay'
import { interval } from '~/common/interval-promise'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  data: () => ({
    lastUpdated: null,
    cookingQueue: [],
    cookQueue: [],
  }),

  computed: {
    ...mapGetters({
      coursesById: 'menu/coursesById',
    }),
  },

  async fetch ({ store, params }) {
    await store.dispatch('menu/initCourses')
  },

  mounted() {
    this.$store.commit('setTitle', 'Кухар')

    this.interval = interval(async (iteration, stop) => {
      if (this.interval === null) {
        stop()
        return
      }

      try {
        await this.updateInfo()
      } catch (e) {
        console.error(e)
      }
    }, 1000)
  },

  beforeDestroy() {
    this.interval = null
  },

  methods: {
    async updateInfo() {
      const response = await this.$axios.$get('/cook/dashboard', {
        progress: false,
      })
      
      if (response.status !== 'ok') {
        return
      }

      this.lastUpdated = Date.now()
      this.cookingQueue = response.cookingQueue
      this.cookQueue = response.cookQueue
    },

    async startCooking(course) {
      const countToStart = course.remaining

      const updated = this.lastUpdated
      const response = await this.$axios.$post(`/cook/start-cooking/${course.order_id}/${course.course_id}?count=${countToStart}`)
      if (updated !== this.lastUpdated) {
        return
      }
      if (response.status !== 'ok') {
        return
      }

      // TODO: Update siliently
      // this.cookingQueue.push(_.)
    },

    async cancelCooking(course) {
      await this.$axios.$post(`/cook/cancel-cooking/${course.id}`)
    },

    async doneCooking(course) {
      await this.$axios.$post(`/cook/done-cooking/${course.id}`)
    },
  },
}
</script>
