<template>
  <div class="pa-4">
    <div>
      <v-img
        :src="$icon(512)"
        width="64"
        style="float: left;"
      />

      <div class="ml-2" style="float: left">
        <span class="mt-1">
          YoungRestaurant Copyright (C) 2018 @ Tarik02 (Тарас Фомін)
        </span>
        
        <p class="mt-1">
          Вихідний код:

          <v-btn href="https://github.com/Tarik02/restaurant-frontend">Фронтенд</v-btn>
          <v-btn href="https://github.com/Tarik02/restaurant-backend">Бекенд</v-btn>
          <v-btn href="https://github.com/Tarik02/restaurant-emulator">Емулятор</v-btn>
        </p>
      </div>
    </div>

    <br style="clear: both" />
  </div>
</template>

<script>
export default {
  mounted() {
    this.$store.commit('setTitle', 'Про нас')
  },
}
</script>

