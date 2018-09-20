<template>
  <v-card height="100%" flat>
    <v-card
      v-for="j in [0, 1, 2]"
      :key="j"
    >
      <v-card-title>
        <span class="headline">Новинки:</span>
      </v-card-title>

      <v-card-text>
        <v-carousel
          hide-delimiters
        >
          <v-carousel-item
            v-for="i in [0, 1, 2]"
            :key="i"
          >
            <course>у</course>
          </v-carousel-item>
        </v-carousel>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script>
import logoImage from '~/assets/images/logo.png'

export default {
  data: () => ({
    logoImage,
  }),

  mounted() {
    this.$store.commit('setTitle', 'Головна')
  },
}
</script>
