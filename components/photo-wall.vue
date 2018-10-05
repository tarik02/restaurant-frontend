<template>
  <v-card class="image-wall">
    <template
      v-for="image in images"
    >
      <v-hover :key="image.id || image.src">
        <v-card
          slot-scope="{ hover }"
          :key="'test'"
          :width="imageWidth"
          :height="imageHeight"
          class="image-card"
          hover
        >
          <v-img v-if="image.src !== null" :src="image.src | uploaded" aspect-ratio="1">
            <v-fade-transition>
              <div
                v-show="hover"
                class="actions-overlay"
              >
                <v-btn dark icon @click="zoomImage(image)"><v-icon>zoom_in</v-icon></v-btn>
                <v-btn dark icon @click="deleteImage(image)"><v-icon>delete</v-icon></v-btn>
              </div>
            </v-fade-transition>
          </v-img>
          <v-layout v-else fill-height align-center justify-center>
            <v-progress-circular indeterminate />
          </v-layout>
        </v-card>
      </v-hover>
    </template>

    <v-card
      :width="imageWidth"
      :height="imageHeight"
      class="image-card add"
      ripple
      hover
      @click.native="openSelectDialog"
    >
      <v-icon class="add-icon">add</v-icon>
    </v-card>

    <v-dialog
      v-model="showZoomedImage"
    >
      <v-card>
        <v-card-text>
          <v-img v-if="zoomedImage" :src="zoomedImage.src | uploaded" alt="" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showZoomedImage = false">Закрити</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import _ from 'lodash'

export default {
  props: {
    images: {
      type: Array,
      required: true,
    },

    imageWidth: {
      type: Number,
      default: 150,
    },

    imageHeight: {
      type: Number,
      default: 150,
    },

    accept: {
      type: [Array, String, null],
      default: null,
    },

    filter: {
      type: Function,
      default: null,
    },
  },

  data: () => ({
    zoomedImage: null,
    showZoomedImage: false,

    counter: 0,
  }),

  mounted() {
    this._fileChangedBinded = this._fileChanged.bind(this)
  },

  methods: {
    openSelectDialog() {
      const { accept } = this
      const input = document.createElement('input')

      input.type = 'file'
      input.style.display = 'none'
      input.multiple = true
      input.accept = accept ? (accept instanceof Array ? accept.join(',') : accept) : null
      input.onchange = this._fileChangedBinded
      input.click()

      document.body.appendChild(input)
    },

    zoomImage(image) {
      const index = this.images.indexOf(image)
      if (index === -1) {
        return false
      }

      this.zoomedImage = image
      this.showZoomedImage = true

      return true
    },

    deleteImage(image) {
      const index = this.images.indexOf(image)
      if (index === -1) {
        return false
      }

      this.images.splice(index, 1)

      return true
    },

    _fileChanged({ target: input }) {
      _.map(input.files, file => {
        const image = {
          id: ++this.counter,
          name: file.name,
          src: null,
          file,
        }
        this.images.push(image)

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = event => {
          if (this.filter) {
            if (this.filter(file) === false) {
              return
            }
          }

          image.src = reader.result
        }

        reader.onerror = () => {
          this.deleteImage(image)
        }
      })
    },
  },
}
</script>

<style lang="stylus" scoped>
.image-wall
  padding 5px
  display flex
  flex-flow row wrap

.image-card
  margin 5px

  &.add
    display flex
    justify-content center
    align-items center
    user-select none
    cursor pointer

.actions-overlay
  height 100%
  display flex
  justify-content center
  align-items center
  background rgba(0, 0, 0, .8)
  cursor default
</style>

