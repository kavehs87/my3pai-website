<template>
  <div v-if="visible" class="map-picker-overlay" @click.self="handleCancel">
    <div class="map-picker-modal">
      <div class="map-picker-header">
        <div>
          <h3>Pick location on map</h3>
          <p>Click on the map to select coordinates</p>
        </div>
        <button class="close-button" @click="handleCancel" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="map-picker-body">
        <div ref="mapEl" class="map-picker-map"></div>
        <div v-if="selectedPosition" class="coordinates-display">
          <div class="coordinate-item">
            <span class="coordinate-label">Latitude:</span>
            <span class="coordinate-value">{{ selectedPosition.lat.toFixed(6) }}</span>
          </div>
          <div class="coordinate-item">
            <span class="coordinate-label">Longitude:</span>
            <span class="coordinate-value">{{ selectedPosition.lng.toFixed(6) }}</span>
          </div>
        </div>
        <div v-if="loadError" class="map-error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Map failed to load. Please check your configuration.</span>
        </div>
      </div>

      <div class="map-picker-footer">
        <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
        <button 
          class="btn btn-primary" 
          @click="handleConfirm"
          :disabled="!selectedPosition"
        >
          Use these coordinates
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapPickerModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialLatitude: {
      type: [Number, String],
      default: null
    },
    initialLongitude: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['close', 'confirm'],
  data() {
    return {
      map: null,
      marker: null,
      selectedPosition: null,
      loadError: false,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initMap()
        })
      } else {
        this.cleanup()
      }
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    initMap() {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        this.createMap()
        return
      }

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        this.loadError = true
        return
      }

      // Load Google Maps script with callback
      const callbackName = 'initMapPicker_' + Date.now()
      window[callbackName] = () => {
        this.createMap()
        delete window[callbackName]
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker&callback=${callbackName}&loading=async`
      script.async = true
      script.defer = true
      script.onerror = () => {
        this.loadError = true
        if (window[callbackName]) {
          delete window[callbackName]
        }
      }
      document.head.appendChild(script)
    },

    createMap() {
      try {
        // Determine initial center
        let center = { lat: 48.8566, lng: 2.3522 } // Default: Paris
        
        // Use provided coordinates if available
        if (this.initialLatitude && this.initialLongitude) {
          const lat = Number(this.initialLatitude)
          const lng = Number(this.initialLongitude)
          if (!isNaN(lat) && !isNaN(lng) && 
              lat >= -90 && lat <= 90 && 
              lng >= -180 && lng <= 180) {
            center = { lat, lng }
            this.selectedPosition = { lat, lng }
          }
        }

        const options = {
          center,
          zoom: this.selectedPosition ? 15 : 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        }

        // Add map ID if available
        if (this.mapId) {
          options.mapId = this.mapId
        }

        // Create map instance
        this.map = new window.google.maps.Map(this.$refs.mapEl, options)

        // Add click listener to map
        this.map.addListener('click', (event) => {
          const position = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }
          this.selectedPosition = position
          this.updateMarker(position)
        })

        // Wait for map to be ready
        window.google.maps.event.addListenerOnce(this.map, 'idle', () => {
          // Create initial marker if we have a position
          if (this.selectedPosition) {
            this.updateMarker(this.selectedPosition)
          }
          
          // Trigger resize to ensure map fills container
          this.$nextTick(() => {
            if (this.map) {
              window.google.maps.event.trigger(this.map, 'resize')
            }
          })
        })
      } catch (error) {
        console.error('[MapPickerModal] Error creating map:', error)
        this.loadError = true
      }
    },

    updateMarker(position) {
      if (!this.map || !window.google) return

      // Remove existing marker
      if (this.marker) {
        this.marker.setMap(null)
      }

      // Create new marker
      // Try to use AdvancedMarkerElement if available
      const AdvancedMarkerElement = window.google?.maps?.marker?.AdvancedMarkerElement
      
      if (AdvancedMarkerElement && this.mapId) {
        // Use Advanced Marker
        const content = document.createElement('div')
        content.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ef4444;
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        `
        content.innerHTML = '<i class="fas fa-map-marker-alt"></i>'
        
        try {
          this.marker = new AdvancedMarkerElement({
            map: this.map,
            position: position,
            content: content
          })
        } catch (error) {
          console.warn('[MapPickerModal] AdvancedMarkerElement failed, using regular marker:', error)
          this.createRegularMarker(position)
        }
      } else {
        // Use regular marker
        this.createRegularMarker(position)
      }
    },

    createRegularMarker(position) {
      this.marker = new window.google.maps.Marker({
        map: this.map,
        position: position,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      })

      // Update position when marker is dragged
      this.marker.addListener('dragend', (event) => {
        this.selectedPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
      })
    },

    handleCancel() {
      this.$emit('close')
    },

    handleConfirm() {
      if (this.selectedPosition) {
        this.$emit('confirm', {
          latitude: this.selectedPosition.lat.toFixed(6),
          longitude: this.selectedPosition.lng.toFixed(6)
        })
      }
    },

    cleanup() {
      if (this.marker) {
        this.marker.setMap(null)
        this.marker = null
      }
      if (this.map) {
        this.map = null
      }
      this.selectedPosition = null
    }
  }
}
</script>

<style scoped>
.map-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  z-index: 10002; /* Above POIAccordion (10001) */
}

.map-picker-modal {
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
}

.map-picker-header h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.map-picker-header p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.map-picker-body {
  flex: 1;
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.map-picker-map {
  flex: 1;
  width: 100%;
  min-height: 400px;
}

.coordinates-display {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.coordinate-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.coordinate-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.coordinate-value {
  font-size: var(--font-size-sm);
  font-family: monospace;
  color: var(--text-primary);
  background: var(--bg-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-align: center;
}

.map-error i {
  font-size: 24px;
  color: var(--error-color, #ef4444);
}

.map-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .map-picker-overlay {
    padding: var(--spacing-md);
  }

  .map-picker-modal {
    max-height: 100vh;
    border-radius: var(--radius-lg);
  }

  .map-picker-header,
  .map-picker-footer {
    padding: var(--spacing-md);
  }

  .coordinates-display {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>

