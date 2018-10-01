<script>
import _ from 'lodash'
import VNavigationDrawer from 'vuetify/es5/components/VNavigationDrawer/VNavigationDrawer'

export default {
  name: 'draggable-navigation-drawer',
  
  extends: VNavigationDrawer,

  props: {
    instantThreshold: {
      type: Number,
      default: 400,
    },

    openThreshold: {
      type: Number,
      default: 0.5,
    },

    closeThreshold: {
      type: Number,
      default: 0.5,
    },
  },

  data: () => ({
    dragX: null,
  }),

  computed: {
    classes() {
      return {
        ...VNavigationDrawer.computed.classes.call(this, null),
        'draggable-navigation-drawer': true,
      }
    },

    styles() {
      const styles = VNavigationDrawer.computed.styles.call(this, null)

      delete styles['transform']

      return styles
    },
  },

  watch: {
    isActive(active) {
      this.updateTransform()
      this.updateOverlay()
    },

    calculatedWidth(width) {
      this.updateTransform(width)
    },
    
    isMobile(value) {
      if (!value) {
        this.isActive = true
      }

      this.updateTransform()
      this.updateOverlay()
    },
  },

  mounted() {
    this.touchData = {
      touched: false,
      startX: 0,
      startTranslate: 0,
      time: null,
    }

    const drawerOverlay = this.drawerOverlay = document.createElement('div')
    drawerOverlay.className = 'draggable-navigation-drawer-overlay'
    document.body.appendChild(drawerOverlay)

    const drawerHandle = this.drawerHandle = document.createElement('div')
    drawerHandle.className = 'draggable-navigation-drawer-handle'
    document.body.appendChild(drawerHandle)

    const touchStart = e => {
      if (!this.isMobile) {
        return
      }

      const translate = parseFloat(this.$el.style.transform.match(/translateX\((-?\d+)px\)/)[1])

      this.touchData.touched = true
      this.touchData.startX = e.touches[0].pageX
      this.touchData.startTranslate = translate
      this.touchData.time = Date.now()
    }
    const touchMove = e => {
      if (!this.touchData.touched) {
        return
      }

      const x = e.touches[0].pageX
      const diff = x - this.touchData.startX
      
      this.dragX = this.calculatedWidth + this.touchData.startTranslate + diff
      this.updateTransform()
      this.updateOverlay()
    }
    const touchUp = e => {
      if (!this.touchData.touched) {
        return
      }

      this.touchData.touched = false
      this.resetTransform()
      this.updateOverlay()

      return false
    }

    drawerOverlay.addEventListener('click', () => {
      this.isActive = false
    })

    drawerHandle.addEventListener('touchstart', touchStart)
    drawerOverlay.addEventListener('touchstart', touchStart)

    document.addEventListener('touchmove', touchMove)
    document.addEventListener('touchend', touchUp)
    document.addEventListener('touchcancel', touchUp)

    this.updateTransform()
    this.updateOverlay()
  },

  destroyed() {
    document.body.removeChild(this.drawerOverlay)
    document.body.removeChild(this.drawerHandle)
  },

  methods: {
    updateTransform(width = this.calculatedWidth) {
      if (!this.$el) {
        return
      }

      let transition, translateX
      if (this.dragX !== null) {
        transition = false
        translateX = -width + this.dragX
      } else {
        transition = true
        translateX = this.isActive ? 0 : -width
      }
      translateX = _.clamp(translateX, -width, 0)

      this.$el.style.transition = transition ? null : '0s'
      this.$el.style.transform = `translateX(${translateX}px)`
    },

    resetTransform() {
      const diff = Date.now() - this.touchData.time
      const instant = diff < this.instantThreshold
      const openThreshold = instant ? -Infinity : this.openThreshold
      const closeThreshold = instant ? Infinity : this.closeThreshold

      const progress = this.dragX / this.calculatedWidth

      if (!this.isActive && progress > openThreshold) {
        this.isActive = true
      } else if (this.isActive && progress < closeThreshold) {
        this.isActive = false
      }
      this.dragX = null

      this.updateTransform()
    },

    updateOverlay() {
      this.drawerOverlay.style.transition = this.dragX !== null ? '0s' : null

      if (this.isMobile && (this.dragX !== null || this.isActive)) {
        this.hideScroll()
        this.drawerOverlay.style.display = 'block'
      } else {
        this.showScroll()
        setTimeout(() => {
          this.drawerOverlay.style.display = 'none'
        }, 500)
      }

      if (this.dragX !== null) {
        this.drawerOverlay.style.opacity = _.clamp(this.dragX / this.calculatedWidth, 0, 1) / 2
      } else if (this.isActive) {
        this.drawerOverlay.style.opacity = .5
      } else {
        this.drawerOverlay.style.opacity = 0
      }
    },

    genOverlay() {},
    removeOverlay() {},
  },
}
</script>

<style lang="stylus">
.draggable-navigation-drawer
  z-index 190

.draggable-navigation-drawer-handle
  width 20px
  position fixed
  left 0
  top 0
  bottom 0
  z-index 195

.draggable-navigation-drawer-overlay
  display none
  opacity 0
  transition opacity .2s cubic-bezier(0.4, 0, 0.2, 1)
  position fixed
  left 0
  right 0
  top 0
  bottom 0
  background black
  z-index 185
</style>
