<template>
  <v-card height="100%" flat>
    <v-container fluid grid-list-lg fill-height>
      <v-layout v-if="coursesLoading" row wrap justify-center align-center>
        <v-progress-circular color="primary" indeterminate />
      </v-layout>
      <v-layout v-else row wrap justify-center>
        <course v-for="(course, i) in courses" :course="course" :key="i">
          <template slot="actions">
            <span class="title ml-2 grey--text">{{ course.price | currency }}</span>

            <v-spacer />

            <v-btn color="primary" dark @click="editCourse(course)">
              <v-icon left>edit</v-icon>Редагувати
            </v-btn>
            <v-btn color="red" dark @click="deleteCourse(course)">
              <v-icon left>delete</v-icon>Видалити
            </v-btn>
          </template>
        </course>

        <v-btn
          color="primary"
          fab
          fixed
          bottom
          right
          @click="newCourse"
        ><v-icon>add</v-icon></v-btn>

        <v-btn fab style="visibility: hidden;" />
      </v-layout>
    </v-container>

    <v-dialog v-model="dialogCourse" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Страва</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formCourse" v-model="validCourse" lazy-validation>
            <v-text-field
              v-model="editedCourse.title"
              :rules="[
                v => !!v || 'Назва обов\'язкова',
              ]"
              label="Назва"
              required
            />

            <v-textarea
              v-model="editedCourse.description"
              :rules="[
                v => !!v || 'Опис обов\'язковий',
              ]"
              label="Опис"
              counter="500"
              required
            />

            <v-btn @click="editIngredients"><v-icon left>bubble_chart</v-icon>Інгредієнти</v-btn>

            <v-text-field
              v-model="selfQuantity"
              suffix="₴"
              readonly
              label="Собівартість інгредієнтів"
            />

            <v-text-field
              v-model="editedCourse.price"
              :rules="[
                v => v !== void 0 || 'Вартість обов\'язкова',
                v => (typeof v !== 'string') || !isNaN(parseFloat(v.replace(',', '.'))) || 'Вартість повинна бути числом',
              ]"
              suffix="₴"
              label="Вартість"
              required
            />

            <v-checkbox
              v-model="editedCourse.visible"
              label="Показувати в меню"
            />

            <photo-wall
              :images="editedCourseImages"
              accept="image/*"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn flat @click="cancelCourse">
            <v-icon left>close</v-icon>Скасувати
          </v-btn>
          
          <v-btn color="primary" @click="saveCourse">
            <v-icon left>save</v-icon>Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogIngredients" persistent>
      <v-card>
        <v-card-title>
          <span class="headline">Інгредієнти</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formIngredients" v-model="validIngredients" lazy-validation>
            <v-text-field
              v-for="(ingredient, i) in ingredients"
              :key="i"
              v-model="editedIngredients[ingredient.id]"
              :rules="[ validateNumber[ingredient.floating ? 'floating' : 'integer'] ]"
              :label="ingredient.title"
              :suffix="ingredient.unit"
              :messages="editedIngredients[ingredient.id]
                ? $currency(editedIngredients[ingredient.id] * ingredient.price)
                : []
              "
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />

          <v-btn flat @click="cancelIngredients">
            <v-icon left>close</v-icon>Скасувати
          </v-btn>

          <v-btn color="primary" @click="saveIngredients">
            <v-icon left>save</v-icon>Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogRemove" persistent max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Видалення страви</span>
        </v-card-title>

        <v-card-text>
          Дійсьно бажаєте видалити страву "{{ courseRemove.title }}"
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          
          <v-btn flat @click="dialogRemove = false">
            <v-icon left>close</v-icon>Скасувати
          </v-btn>

          <v-btn color="red" dark @click="doDeleteCourse">
            <v-icon left>delete</v-icon>Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import _ from 'lodash'
import { mapState, mapMutations, mapGetters } from 'vuex'
import Course from '~/components/course'
import PhotoWall from '~/components/photo-wall'

export default {
  components: {
    Course,
    PhotoWall,
  },

  data: () => ({
    validCourse: true,
    dialogCourse: false,
    // dialogCourse: true,
    editedIndex: 0,
    editedCourse: {
      title: '',
      description: '',
      price: 0,
      visible: true,
      images: [],
      ingredients: {},
    },
    editedCourseImages: [],

    validIngredients: true,
    dialogIngredients: false,
    editedIngredients: {},

    dialogRemove: false,
    courseRemove: {},

    validateNumber: {
      'integer': v => {
        if (v === void 0) {
          return true
        }

        const n = Number(v)
        if (isNaN(n) || !Number.isInteger(n)) {
          return 'Значення повинно бути цілим числом'
        }

        return true
      },
      'floating': v => {
        if (v === void 0) {
          return true
        }

        const n = typeof v === 'number' ? v : Number(v.replace(',', '.'))
        if (isNaN(n) || !Number.isFinite(n)) {
          return 'Значення повинно бути числом'
        }

        return true
      },
    },
  }),

  computed: {
    ...mapState({
      courses: state => state.operator.courses,
      coursesLoading: state => state.operator.coursesLoading,

      ingredients: state => state.operator.ingredients,
    }),

    ...mapGetters({
      coursesById: 'operator/coursesById',
      ingredientsById: 'operator/ingredientsById',
    }),

    selfQuantity() {
      const ingredients = this.ingredientsById

      return _(this.editedCourse.ingredients)
        .entries()
        .map(([key, value]) => ingredients[key].price * value)
        .sum() / 100
    },
  },

  async fetch ({ store, params }) {
    await store.dispatch('operator/init')
  },

  mounted() {
    this.$store.commit('setTitle', 'Страви')
  },

  methods: {
    newCourse() {
      this.editedCourse = {
        title: '',
        description: '',
        price: 0,
        visible: true,
        images: [],
        ingredients: {},
      }
      this.editedCourseImages = []
      this.dialogCourse = true
    },

    editCourse(course) {
      this.editedCourse = {
        ...course,
        price: course.price / 100,
        images: void 0,
      }
      this.editedCourseImages = _.map(course.images, image => ({
        name: image,
        file: null,
        src: image,
      }))
      this.dialogCourse = true
    },

    cancelCourse() {
      this.dialogCourse = false
    },

    async saveCourse() {
      if (!this.$refs.formCourse.validate()) {
        return false
      }

      const request = {
        ...this.editedCourse,
        price: this.editedCourse.price * 100,

        images: _(this.editedCourseImages)
          .map(image => image.file === null ? image.src : null),
      }

      const data = new FormData()
      data.append('data', JSON.stringify(request))

      const files = _(this.editedCourseImages)
        .filter(image => image.file !== null)
        .map(image => image.file)
        .forEach(file => data.append('files[]', file, file.name))

      try {
        this.$toast.show('Збереження...')

        const result = await this.$axios.$post('/operator/courses', data)
        if (result.status !== 'ok') {
          throw new Error('Status is not ok')
        }

        this.dialogCourse = false
        this.$toast.success('Збережено')

        this.$store.dispatch('operator/updateCourses')
      } catch (e) {
        console.error(e)

        this.$toast.error('Помилка під час збереження')
      }
    },

    editIngredients() {
      this.editedIngredients = { ...this.editedCourse.ingredients }
      this.dialogIngredients = true
    },

    cancelIngredients() {
      this.dialogIngredients = false
    },

    saveIngredients() {
      if (!this.$refs.formIngredients.validate()) {
        return false
      }

      this.editedCourse.ingredients = _.pickBy(
        this.editedIngredients,
        value => value !== ''
      )
      this.dialogIngredients = false
    },


    deleteCourse(course) {
      this.dialogRemove = true
      this.courseRemove = course
    },

    async doDeleteCourse() {
      if (this.courseRemove) {
        try {
          this.$toast.show('Видалення...')

          const result = await this.$axios.$post('/operator/courses/remove', {
            id: this.courseRemove.id,
          })
          if (result.status !== 'ok') {
            throw new Error('Status is not ok')
          }

          this.dialogRemove = false
          this.$toast.success('Видалено')

          this.$store.dispatch('operator/updateCourses')
        } catch (e) {
          this.$toast.error('Помилка під час видалення')
        }
      }
    },
  },
}
</script>
