<template>
  <div />
</template>


<script>
export default {
  fetch({ params, redirect }) {
    redirect(301, '/menu')
  },

  mounted() {
    this.$store.commit('setTitle', 'Головна')
  },
}
</script>
