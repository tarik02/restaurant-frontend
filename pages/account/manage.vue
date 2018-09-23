<template>
  <v-card height="100%" flat>
    Manage
  </v-card>
</template>

<script>
export default {
  data: () => ({
  }),

  mounted() {
    this.$store.commit('setTitle', 'Керування обліковими записами')
  },

  methods: {
  },
}
</script>
