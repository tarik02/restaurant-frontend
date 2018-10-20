<template>
  <p class="pa-4">
    Copyright 2018 @ Tarik02 (Тарас Фомін) @ Всі права захищено

    <br />
    <v-btn href="https://github.com/Tarik02/restaurant-frontend">Фронтенд</v-btn>

    <br />
    <v-btn href="https://github.com/Tarik02/restaurant-backend">Бекенд</v-btn>

    <br />
    <v-btn href="https://github.com/Tarik02/restaurant-emulator">Емулятор</v-btn>
  </p>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('setTitle', 'Про нас')
  },
}
</script>

