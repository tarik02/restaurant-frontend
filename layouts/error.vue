<template>
  <div v-if="showError" class="container">
    <h1 v-if="error.statusCode === 404">Дана сторінка не існує</h1>
    <h1 v-else>Виникла помилка</h1>
    <nuxt-link to="/">Головна сторінка</nuxt-link>
  </div>
  <div v-else />
</template>

<script>
export default {
  layout: 'menuless',

  props: {
    error: { type: null, required: true },
  },

  data: () => ({
    showError: true,
  }),

  created() {
    const { error } = this

    if (!error || !error.response) {
      return
    }

    this.showError = false

    if (
      parseInt(error.response.status) === 307 &&
      error.response.statusText === 'not-installed'
    ) {
      if (this.$route.name !== 'install') {
        this.$router.replace({ name: 'install' })
        return
      }
    }

    this.showError = true
  },
}
</script>
