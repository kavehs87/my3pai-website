<template>
  <div class="itinerary-map-page">
    <!-- Header -->
    <Header />

    <!-- Google Map Container -->
    <div class="map-container">
      <div ref="mapEl" class="google-map"></div>
      <div v-if="loadError" class="map-fallback">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Google Maps failed to load. Please check your API key configuration.</span>
      </div>
      <!-- First Place Prompt -->
      <FirstPlacePrompt 
        :visible="showFirstPlacePrompt" 
        @click="handleFirstPlaceClick"
      />
    </div>

    <!-- Thin Footer -->
    <ThinFooter />

    <!-- Add Itinerary Modal -->
    <AddItinerary 
      :visible="showAddItinerary" 
      @close="showAddItinerary = false" 
      @publish="handlePublishItinerary"
      @save-draft="handleSaveDraftItinerary"
      @share="handleShareItinerary"
    />
  </div>
</template>

<script>
import Header from './Header.vue'
import ThinFooter from './itinerary-map/components/ThinFooter.vue'
import AddItinerary from './itinerary-map/components/AddItinerary.vue'
import FirstPlacePrompt from './itinerary-map/components/FirstPlacePrompt.vue'

export default {
  name: 'ItineraryMap',
  components: {
    Header,
    ThinFooter,
    AddItinerary,
    FirstPlacePrompt
  },
  data() {
    return {
      map: null,
      loadError: false,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null,
      useAdvanced: import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true',
      AdvancedMarkerElement: null,
      showAddItinerary: false,
      showFirstPlacePrompt: true
    }
  },
  mounted() {
    this.initGoogleMaps()
    // Add resize listener to ensure map resizes properly
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    // Clean up map instance if needed
    if (this.map) {
      this.map = null
    }
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
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

      // Load Google Maps script with callback to avoid loading warning
      const callbackName = 'initItineraryMap_' + Date.now()
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
        // Default center (can be changed later)
        const center = { lat: 48.8566, lng: 2.3522 } // Paris, France
        
        const options = {
          center,
          zoom: 12,
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

        // Wait for map to be ready (idle event) before initializing advanced markers
        window.google.maps.event.addListenerOnce(this.map, 'idle', () => {
          // Initialize Advanced Marker Element if available and enabled
          this.AdvancedMarkerElement = (this.useAdvanced && this.mapId) 
            ? (window.google?.maps?.marker?.AdvancedMarkerElement || null) 
            : null
          
          // Trigger resize to ensure map fills container
          this.$nextTick(() => {
            if (this.map) {
              window.google.maps.event.trigger(this.map, 'resize')
            }
          })
        })
      } catch (error) {
        this.loadError = true
      }
    },

    handleResize() {
      // Resize map when window resizes
      if (this.map && window.google && window.google.maps) {
        window.google.maps.event.trigger(this.map, 'resize')
      }
    },

    handlePublishItinerary() {
      // Handle itinerary publish logic here
      this.showAddItinerary = false
    },
    handleSaveDraftItinerary() {
      // Handle save draft logic here
      // Don't close modal on draft save
    },
    handleShareItinerary() {
      // Handle share logic here
      // Don't close modal on share
    },
    handleFirstPlaceClick() {
      this.showFirstPlacePrompt = false
      this.showAddItinerary = true
    }
  }
}
</script>

<style scoped>
.itinerary-map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.map-container {
  flex: 1;
  width: 100%;
  position: relative;
  height: 100%;
  min-height: 0; /* Important for flex children */
}

.google-map {
  width: 100%;
  height: 100%;
}

.map-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-fallback i {
  font-size: 24px;
  color: var(--error-color, #ef4444);
}
</style>

