<template>
  <v-flex
    xs12
    sm12
    md4
    lg4
    xl4
  >
    <v-card style="display: flex; flex-direction: column; height: 100%;">
      <v-carousel
        :hide-controls="course.images.length === 1"
        :cycle="false"
        hide-delimiters
        style="height: 200px;"
      >
        <v-carousel-item
          v-for="(image, i) in course.images"
          :key="i"
          :src="image | uploaded"
        />
      </v-carousel>

      <v-card-title style="display: block;">
        <div
          class="headline mb-1"
          style="color: black;"
        >{{ course.title }}</div>
        
        <div>
          <span>{{ course.description }}</span>
        </div>
      </v-card-title>

      <v-spacer />

      <v-card-actions>
        <slot name="actions">
          <span class="title ml-2 grey--text">{{ course.price | currency }}</span>

          <v-spacer />

          <transition name="fade" mode="out-in">
            <slot name="buttons">
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
            </slot>
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
