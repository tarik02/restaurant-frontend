<template>
  <v-card height="100%" flat>
    <v-container
      fluid
      grid-list-lg
    >
      <v-layout row wrap justify-center>
        <course v-for="(course) in courses" :course="course" :key="course.id" />
      </v-layout>
    </v-container>

    <v-fab-transition>
      <v-btn
        v-if="!cartEmpty"
        :to="{ name: 'cart' }"
        color="primary"
        fab
        fixed
        right
        bottom
      ><v-icon>shopping_cart</v-icon></v-btn>
    </v-fab-transition>

    <v-btn
      fab
      style="visibility: hidden;"
    />
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Course from '~/components/course'

export default {
  components: {
    Course,
  },

  computed: {
    ...mapState({
      courses: state => state.menu.courses,
    }),

    ...mapGetters({
      cartEmpty: 'cart/empty',
    }),
  },

  async fetch ({ store, params }) {
    await store.dispatch('menu/initCourses')
  },

  mounted() {
    this.$store.commit('setTitle', 'Меню')
  },
}
</script>

