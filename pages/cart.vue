<template>
  <v-card height="100%" flat style="margin-bottom: 24px;">
    <template v-if="courses.length > 0">
      <v-container
        fluid
        grid-list-lg
      >
        <v-layout row wrap>
          <course v-for="(course) in courses" :course="course" :key="course.id" />
        </v-layout>
      </v-container>

      <v-footer fixed class="subheading px-2 py-4">
        <v-icon>credit_card</v-icon>&nbsp;До сплати: {{ price | currency }}

        <v-spacer />

        <v-btn
          :to="{ name: 'location' }"
          dark
          color="primary"
        >Замовити&nbsp;<v-icon>arrow_forward</v-icon></v-btn>
      </v-footer>
    </template>
    <v-layout v-else fill-height>
      <v-layout row wrap align-center>
        <v-flex class="text-xs-center body-1">
          Корзина порожня.
          <br />
          <v-btn :to="{ name: 'menu' }" class="mt-3"><v-icon>restaurant_menu</v-icon>&nbsp;Меню</v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-card>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
import Course from '~/components/course'

export default {
  components: {
    Course,
  },

  computed: {
    ...mapGetters({
      courses: 'menu/cartCourses',
      price: 'cart/totalPrice',
    }),
  },

  mounted() {
    this.$store.commit('setTitle', 'Корзина')
  },
}
</script>
