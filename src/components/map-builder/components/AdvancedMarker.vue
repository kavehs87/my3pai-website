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
        if (!value) return false
        // Support both plain objects { lat: number, lng: number }
        // and Google Maps LatLng objects where lat/lng are functions
        const latVal = typeof value.lat === 'function' ? value.lat() : value.lat
        const lngVal = typeof value.lng === 'function' ? value.lng() : value.lng
        return typeof latVal === 'number' && typeof lngVal === 'number'
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
        // AdvancedMarkerElement doesn't support visible property
        // Instead, control visibility by setting map to null (hidden) or map instance (visible)
        if (newVal) {
          this.marker.map = this.map
        } else {
          this.marker.map = null
        }
      } else if (newVal && this.AdvancedMarkerElement && this.map && this.position) {
        // Create marker if it doesn't exist and should be visible
        this.createMarker()
      }
    },
    map(newMap) {
      if (this.marker) {
        // Only update map if marker should be visible
        if (this.visible && newMap) {
          console.log('[AdvancedMarker] Updating marker map:', newMap)
        this.marker.map = newMap
        } else if (!this.visible) {
          this.marker.map = null
        }
      } else if (this.visible && newMap && this.AdvancedMarkerElement && this.position) {
        // Create marker if it doesn't exist and should be visible
        this.createMarker()
      }
    },
    AdvancedMarkerElement(newElement) {
      // When AdvancedMarkerElement becomes available, create marker if conditions are met
      if (newElement && !this.marker) {
        console.log('[AdvancedMarker] AdvancedMarkerElement became available, checking conditions:', {
          hasMap: !!this.map,
          hasPosition: !!this.position,
          visible: this.visible
        })
        // Wait a bit to ensure all props are set
        this.$nextTick(() => {
          if (!this.marker && this.visible && this.map && this.position) {
            console.log('[AdvancedMarker] All conditions met, creating marker')
            this.createMarker()
          } else {
            console.log('[AdvancedMarker] Conditions not met yet, will retry when ready')
            // Retry after a short delay in case props are still being set
            setTimeout(() => {
              if (!this.marker && this.visible && this.map && this.position) {
                console.log('[AdvancedMarker] Retry: creating marker')
                this.createMarker()
              }
            }, 200) // Short retry delay
          }
        })
      }
    },
    visible(newVisible) {
      // When visible becomes true and we have all requirements, create marker
      if (newVisible && !this.marker && this.map && this.AdvancedMarkerElement && this.position) {
        console.log('[AdvancedMarker] Visible changed to true, creating marker')
        this.createMarker()
      } else if (!newVisible && this.marker) {
        // Hide marker when visible becomes false
        if (this.marker) {
          this.marker.map = null
        }
      }
    }
  },
  created() {
    console.log('[AdvancedMarker] created - component instantiated', {
      hasMap: !!this.map,
      hasAdvancedMarkerElement: !!this.AdvancedMarkerElement,
      hasPosition: !!this.position,
      position: this.position,
      visible: this.visible,
      hasContent: !!this.content
    })
  },
  mounted() {
    console.log('[AdvancedMarker] mounted - props:', {
      hasMap: !!this.map,
      hasAdvancedMarkerElement: !!this.AdvancedMarkerElement,
      hasPosition: !!this.position,
      position: this.position,
      visible: this.visible,
      hasContent: !!this.content
    })
    
    // Always try to create marker - don't wait for visible prop
    // The createMarker method will check conditions internally
    if (this.map && this.AdvancedMarkerElement && this.position) {
      console.log('[AdvancedMarker] All conditions met, creating marker immediately')
    this.createMarker()
    } else {
      console.log('[AdvancedMarker] Waiting for conditions - will create when ready', {
        map: !!this.map,
        AdvancedMarkerElement: !!this.AdvancedMarkerElement,
        position: !!this.position
      })
      // Wait for conditions via watchers instead of delays
    }
  },
  beforeUnmount() {
    this.destroyMarker()
  },
  methods: {
    createMarker() {
      // Don't create if marker already exists
      if (this.marker) {
        return
      }

      if (!this.map || !this.position) {
        console.warn('[AdvancedMarker] Missing required props (map or position)')
        return
      }

      if (!this.AdvancedMarkerElement) {
        console.log('[AdvancedMarker] AdvancedMarkerElement not available yet, will create when available')
        return
      }

      try {
        // Note: We removed the visible check here because AdvancedMarkerElement doesn't support visible property
        // Instead, we control visibility by setting marker.map = null to hide, marker.map = this.map to show

        console.log('[AdvancedMarker] Creating marker at:', this.position, 'with map:', !!this.map, 'AdvancedMarkerElement:', !!this.AdvancedMarkerElement)

        const markerOptions = {
          map: this.map,
          position: this.position,
          title: this.title
        }

        // zIndex might not be supported, only add if it's a valid number
        if (typeof this.zIndex === 'number' && !isNaN(this.zIndex)) {
          markerOptions.zIndex = this.zIndex
        }

        // If content is provided, use it (can be HTML string or DOM element)
        if (this.content) {
          if (typeof this.content === 'string') {
            // Create a DOM element from string
            const div = document.createElement('div')
            div.innerHTML = this.content
            markerOptions.content = div.firstElementChild || div
          } else if (this.content instanceof HTMLElement || this.content instanceof Element) {
            // It's already a DOM element - use it directly
            markerOptions.content = this.content
          } else if (this.content && this.content.element) {
            // PinElement wrapper - extract the element
            markerOptions.content = this.content.element
          } else {
            // Fallback: try to use as-is
            markerOptions.content = this.content
          }
          console.log('[AdvancedMarker] Setting marker content:', markerOptions.content, 'type:', typeof markerOptions.content, 'isElement:', markerOptions.content instanceof HTMLElement)
        } else {
          console.warn('[AdvancedMarker] No content provided for marker - marker will be invisible!')
        }

        // Create marker EXACTLY like MapPanel does (line 432-438) - this works there
        // MapPanel passes: map, position, title, content, zIndex
        this.marker = new this.AdvancedMarkerElement(markerOptions)
        
        console.log('[AdvancedMarker] Marker created successfully:', this.marker)
        console.log('[AdvancedMarker] Marker map:', this.marker.map, 'expected map:', this.map)
        console.log('[AdvancedMarker] Marker position:', this.marker.position)
        console.log('[AdvancedMarker] Marker content:', this.marker.content)
        console.log('[AdvancedMarker] MarkerOptions used:', {
          hasMap: !!markerOptions.map,
          hasPosition: !!markerOptions.position,
          hasContent: !!markerOptions.content,
          hasTitle: !!markerOptions.title,
          zIndex: markerOptions.zIndex
        })
        
        // Verify marker is properly attached
        if (this.marker.map !== this.map && this.map) {
          console.warn('[AdvancedMarker] Marker map mismatch! Re-setting map.')
          this.marker.map = this.map
        }
        
        // Force map to refresh - trigger resize event which sometimes helps markers appear
        this.$nextTick(() => {
          if (this.map && window.google && window.google.maps) {
            window.google.maps.event.trigger(this.map, 'resize')
            console.log('[AdvancedMarker] Triggered map resize event')
          }
        })
        
        // AdvancedMarkerElement markers are in shadow DOM, so they won't show in querySelector
        // But they should be visible on the map. Verify by checking marker properties
        setTimeout(() => {
          if (this.marker) {
            console.log('[AdvancedMarker] Marker verification after delay:', {
              hasMap: !!this.marker.map,
              mapMatches: this.marker.map === this.map,
              hasContent: !!this.marker.content,
              position: this.marker.position,
              // Try to get the actual DOM element if possible
              markerElement: this.marker
            })
            
            // Try to access the marker's internal structure (for debugging)
            if (this.marker.content) {
              console.log('[AdvancedMarker] Content element details:', {
                tagName: this.marker.content.tagName,
                textContent: this.marker.content.textContent,
                style: this.marker.content.style?.cssText,
                parentElement: this.marker.content.parentElement,
                isConnected: this.marker.content.isConnected
              })
            }
          }
        }, 500)
        
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

