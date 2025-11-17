<template>
  <!-- Advanced markers are rendered directly on the map, no template needed -->
</template>

<script>
export default {
  name: 'AdvancedMarker',
  props: {
    position: {
      type: Object,
      required: true,
      validator: (value) => {
        return typeof value.lat === 'number' && typeof value.lng === 'number'
      }
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: [String, Object],
      default: null
    },
    map: {
      type: Object,
      default: null
    },
    AdvancedMarkerElement: {
      type: Function,
      default: null
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      marker: null
    }
  },
  watch: {
    position: {
      handler(newPos) {
        if (this.marker && newPos) {
          this.marker.position = newPos
        }
      },
      deep: true
    },
    visible(newVal) {
      if (this.marker) {
        this.marker.visible = newVal
      }
    },
    map(newMap) {
      if (this.marker && newMap) {
        this.marker.map = newMap
      }
    }
  },
  mounted() {
    this.createMarker()
  },
  beforeUnmount() {
    this.destroyMarker()
  },
  methods: {
    createMarker() {
      if (!this.AdvancedMarkerElement || !this.map || !this.position) {
        console.warn('AdvancedMarker: Missing required props (AdvancedMarkerElement, map, or position)')
        return
      }

      try {
        const markerOptions = {
          map: this.map,
          position: this.position,
          title: this.title,
          zIndex: this.zIndex,
          visible: this.visible
        }

        // If content is provided, use it (can be HTML string or DOM element)
        if (this.content) {
          if (typeof this.content === 'string') {
            // Create a DOM element from string
            const div = document.createElement('div')
            div.innerHTML = this.content
            markerOptions.content = div.firstElementChild || div
          } else {
            // Assume it's already a DOM element
            markerOptions.content = this.content
          }
        }

        this.marker = new this.AdvancedMarkerElement(markerOptions)
        
        // Emit created event
        this.$emit('created', this.marker)
      } catch (error) {
        console.error('AdvancedMarker: Failed to create marker', error)
        this.$emit('error', error)
      }
    },

    destroyMarker() {
      if (this.marker) {
        try {
          this.marker.map = null
          this.marker = null
          this.$emit('destroyed')
        } catch (error) {
          console.error('AdvancedMarker: Error destroying marker', error)
        }
      }
    },

    // Public method to get the marker instance
    getMarker() {
      return this.marker
    }
  }
}
</script>

<style scoped>
/* Advanced markers are rendered on the map canvas, no scoped styles needed */
</style>

