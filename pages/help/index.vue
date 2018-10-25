<template>
  <div class="pa-3">Тут буде допомога :)</div>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('setTitle', 'Допомога')
  },
}
</script>

