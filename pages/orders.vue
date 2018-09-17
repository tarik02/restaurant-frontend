<template>
  <v-card>
    <v-container
      fluid
      grid-list-lg
    >
      <v-layout
        row
        wrap
      >
        <template
          v-for="i in [1, 2, 3]"
        >
          <v-flex
            :key="i"
            xs12
          >
            <v-card>
              <v-card-title primary-title>
                <div class="title">Замовлення</div>
              </v-card-title>

              <v-card-text>
                <span class="subheading">Страви:</span>
                <br /><span>Смажена картопля</span>
                <br /><span>Кава</span>
              </v-card-text>
              
              <v-divider />
              
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" flat nuxt to="/inspire">Відхилити</v-btn>
                <v-btn color="primary" nuxt to="/inspire">Прийняти</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </template>

      </v-layout>
    </v-container>
  </v-card>
</template>