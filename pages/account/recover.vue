<template>
  <v-card height="100%" flat>
    Recover
  </v-card>
</template>

<script>
export default {
  data: () => ({
  }),

  mounted() {
    this.$store.commit('setTitle', 'Відновлення облікового запису')
  },

  methods: {
  },
}
</script>
