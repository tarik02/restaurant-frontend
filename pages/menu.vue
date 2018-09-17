<template>
  <v-card height="100%" flat>
    <v-container
      fluid
      grid-list-lg
    >
      <v-layout row wrap justify-center>
        <course v-for="(course, i) in courses" :course="course" :key="i" />
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Course from '~/components/course'

export default {
  components: {
    Course,
  },

  computed: {
    ...mapState({
      courses: state => state.menu.courses,
    }),

    cartEmpty() {
      return this.courses.every(course => course.cartCount === 0)
    },
  },

  async fetch ({ store, params }) {
    await store.dispatch('menu/initCourses')
  },

  mounted() {
    this.$store.commit('setTitle', 'Меню')
  },
}
</script>

