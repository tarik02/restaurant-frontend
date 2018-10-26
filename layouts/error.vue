<template>
  <div class="container">
    <h1 v-if="error.statusCode === 404">Дана сторінка не існує</h1>
    <h1 v-else>Виникла помилка</h1>
    <nuxt-link to="/">Головна сторінка</nuxt-link>
  </div>
</template>

<script>
export default {
  layout: 'menuless',
  props: {
    error: { type: null, required: true },
  },

  created() {
    const { error } = this

    if (!error || !error.response) {
      return
    }

    if (
      parseInt(error.response.status) === 307 &&
      error.response.statusText === 'not-installed'
    ) {
      if (this.$route.name !== 'install') {
        this.$router.replace({ name: 'install' })
      }
    }
  },
}
</script>
