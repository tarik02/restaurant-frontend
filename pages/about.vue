<template>
  <div class="pa-4">
    <p class="pb-4">
      YoungRestaurant Copyright (C) 2018 @ Tarik02 (Тарас Фомін)
    </p>

    <p>
      Вихідний код:

      <br />
      <v-btn href="https://github.com/Tarik02/restaurant-frontend">Фронтенд</v-btn>

      <br />
      <v-btn href="https://github.com/Tarik02/restaurant-backend">Бекенд</v-btn>

      <br />
      <v-btn href="https://github.com/Tarik02/restaurant-emulator">Емулятор</v-btn>
    </p>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('setTitle', 'Про нас')
  },
}
</script>

