<template>
  <div class="map-container-wrapper">
    <div class="map-header" @click="toggleMap">
      <div class="map-header-left">
        <i class="fas fa-map map-icon"></i>
        <span class="map-title">Map View</span>
        <span class="map-subtitle" v-if="poisCount > 0">
          {{ poisCount }} location{{ poisCount !== 1 ? 's' : '' }}
        </span>
      </div>
      <button class="toggle-btn" :class="{ expanded: isExpanded }">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    
    <div class="map-content" v-show="isExpanded">
      <div v-if="loadError" class="map-fallback">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Google Maps failed to load. Please check your API key configuration.</span>
      </div>
      <div ref="mapEl" class="gmap" v-else></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapContainer',
  props: {
    poisCount: {
      type: Number,
      default: 0
    },
    isExpanded: {
      type: Boolean,
      default: false
    },
    pois: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      map: null,
      loadError: false,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null,
      useAdvanced: import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true',
      mapInitialized: false
    }
  },
  watch: {
    isExpanded(newVal) {
      if (newVal && !this.mapInitialized) {
        this.$nextTick(() => {
          this.initGoogleMaps()
        })
      } else if (newVal && this.map) {
        // Resize map when expanded
        this.$nextTick(() => {
          if (this.map && window.google && window.google.maps) {
            window.google.maps.event.trigger(this.map, 'resize')
            this.fitMapToPOIs()
          }
        })
      }
    },
    pois: {
      handler() {
        if (this.map && this.isExpanded) {
          this.$nextTick(() => {
            this.updateMapMarkers()
          })
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.isExpanded) {
      this.initGoogleMaps()
    }
  },
  beforeUnmount() {
    if (this.map) {
      // Clean up map instance
      this.map = null
    }
  },
  methods: {
    toggleMap() {
      this.$emit('toggle-map')
    },
    initGoogleMaps() {
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
      const callbackName = 'initMapContainer_' + Date.now()
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
        // Calculate center from POIs or use default
        let center = { lat: 48.8566, lng: 2.3522 } // Default: Paris
        
        if (this.pois && this.pois.length > 0) {
          const validPOIs = this.pois.filter(poi => 
            poi.basic && 
            typeof poi.basic.latitude === 'number' && 
            typeof poi.basic.longitude === 'number'
          )
          
          if (validPOIs.length > 0) {
            const avgLat = validPOIs.reduce((sum, poi) => sum + poi.basic.latitude, 0) / validPOIs.length
            const avgLng = validPOIs.reduce((sum, poi) => sum + poi.basic.longitude, 0) / validPOIs.length
            center = { lat: avgLat, lng: avgLng }
          }
        }
        
        const options = {
          center,
          zoom: this.pois && this.pois.length > 0 ? 10 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        }

        // Add map ID if available (for advanced markers/styling)
        if (this.mapId) {
          options.mapId = this.mapId
        }

        // Create map instance
        this.map = new window.google.maps.Map(this.$refs.mapEl, options)
        this.mapInitialized = true

        // Wait for map to be ready
        window.google.maps.event.addListenerOnce(this.map, 'idle', () => {
          // Trigger resize to ensure map fills container
          this.$nextTick(() => {
            if (this.map) {
              window.google.maps.event.trigger(this.map, 'resize')
              this.fitMapToPOIs()
            }
          })
        })
      } catch (e) {
        console.error('[MapContainer] Google Maps init failed', e)
        this.loadError = true
      }
    },
    fitMapToPOIs() {
      if (!this.map || !this.pois || this.pois.length === 0) return
      
      const validPOIs = this.pois.filter(poi => 
        poi.basic && 
        typeof poi.basic.latitude === 'number' && 
        typeof poi.basic.longitude === 'number'
      )
      
      if (validPOIs.length === 0) return
      
      const bounds = new window.google.maps.LatLngBounds()
      
      validPOIs.forEach(poi => {
        bounds.extend({
          lat: Number(poi.basic.latitude),
          lng: Number(poi.basic.longitude)
        })
      })
      
      if (validPOIs.length === 1) {
        // If only one POI, center on it with a reasonable zoom
        this.map.setCenter({
          lat: Number(validPOIs[0].basic.latitude),
          lng: Number(validPOIs[0].basic.longitude)
        })
        this.map.setZoom(14)
      } else {
        // Fit bounds for multiple POIs
        this.map.fitBounds(bounds)
      }
    },
    updateMapMarkers() {
      // TODO: Implement marker rendering when POIs are available
      // This will be implemented later when we add marker functionality
      this.fitMapToPOIs()
    }
  }
}
</script>

<style scoped>
.map-container-wrapper {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
  box-shadow: 0 1px 3px var(--shadow-light);
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
  user-select: none;
}

.map-header:hover {
  background: var(--bg-secondary);
}

.map-header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.map-icon {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
}

.map-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.map-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-left: var(--spacing-xs);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--radius-sm);
}

.toggle-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toggle-btn i {
  font-size: var(--font-size-sm);
  transition: transform var(--transition-fast);
}

.toggle-btn.expanded i {
  transform: rotate(180deg);
}

.map-content {
  border-top: 1px solid var(--border-light);
  min-height: 400px;
  background: var(--bg-secondary);
  position: relative;
}

.gmap {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

.map-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-xl);
  color: var(--error-color);
  text-align: center;
  gap: var(--spacing-md);
}

.map-fallback i {
  font-size: 2rem;
}

.map-fallback span {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .map-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .map-title {
    font-size: var(--font-size-sm);
  }
  
  .map-subtitle {
    font-size: var(--font-size-xs);
  }
  
  .map-content {
    min-height: 300px;
  }
  
  .gmap {
    height: 300px;
    min-height: 300px;
  }
  
  .map-fallback {
    min-height: 300px;
    padding: var(--spacing-lg);
  }
}
</style>

