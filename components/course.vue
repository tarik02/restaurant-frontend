<template>
  <v-flex xs12>
    <v-card>
      <v-carousel
        :hide-controls="course.images.length === 1"
        hide-delimiters
      >
        <v-carousel-item
          v-for="(image, i) in course.images"
          :key="i"
          :src="image | uploaded"
        >
          <v-container fill-height fluid>
            <v-layout fill-height>
              <v-flex xs12 align-end flexbox>
                <span class="headline grey--text text--lighten-5">{{ course.title }}</span>
              </v-flex>
            </v-layout>
          </v-container>
        </v-carousel-item>
      </v-carousel>

      <v-card-title>
        <div>
          <span>{{ course.description }}</span>
        </div>
      </v-card-title>

      <v-card-actions>
        <slot name="actions">
          <span class="title ml-2 grey--text">{{ course.price / 100 }}₴</span>

          <v-spacer />

          <transition name="fade" mode="out-in">
            <div v-if="cartCountOf(course.id) === 0" key="a">
              <v-btn color="primary" @click="addToCart(course)">Додати до корзини</v-btn>
            </div>
            <div v-else key="b">
              <span class="title ml-2 grey--text mr-2">
                {{ (cartCountOf(course.id) * course.price) | currency }}
              </span>

              <v-btn icon @click="removeFromCart(course)"><v-icon>remove</v-icon></v-btn>
              <v-btn icon flat disabled>{{ cartCountOf(course.id) }}</v-btn>
              <v-btn icon @click="addToCart(course)"><v-icon>add</v-icon></v-btn>
            </div>
          </transition>
        </slot>
      </v-card-actions>
    </v-card>
  </v-flex>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  props: {
    course: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters({
      cartCountOf: 'cart/countOf',
    }),
  },
  
  methods: {
    ...mapMutations({
      mutationRemoveCart: 'cart/remove',
      mutationAddCart: 'cart/add',
    }),

    removeFromCart(course) {
      this.mutationRemoveCart({ id: course.id })

      this.$toast.success('Видалено з корзини', {
        duration: 1500,
      })
    },

    addToCart(course) {
      this.mutationAddCart({ id: course.id })

      this.$toast.success('Додано у корзину', {
        duration: 1500,
      })
    },
  },
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition opacity 0.1s

.fade-enter, .fade-leave-to
  opacity 0
</style>
