<template>
  <v-app>
    <v-toolbar app>
      <v-icon>settings</v-icon>
      
      <span class="title ml-3 mr-5">
        {{ shortTitle }}&nbsp;<span class="font-weight-light">{{ currentPage }}</span>
      </span>
    </v-toolbar>

    <v-content>
      <v-container fill-height d-block pa-0>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  head() {
    return {
      title: this.$store.state.title.common,
    }
  },

  computed: {
    ...mapState({
      shortTitle: state => state.title.short,
      currentPage: state => state.currentPage,
    }),
  },
}
</script>
