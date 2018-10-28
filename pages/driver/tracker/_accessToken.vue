<template>
  <div />  
</template>

<script>
export default {
  mounted() {
    this.$store.commit('setTitle', 'Трекер')

    this.$driverTracker.start()
    this.$router.replace({ name: 'driver-dashboard' })
  },
}
</script>

