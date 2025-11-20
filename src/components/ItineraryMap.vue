<template>
  <div class="itinerary-map-page">
    <!-- Header -->
    <Header />

    <div v-if="isAuthChecking" class="auth-guard">
      <div class="auth-card">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Checking your session…</p>
      </div>
    </div>

    <div v-else-if="!isAuthenticated" class="auth-guard">
      <div class="auth-card">
        <i class="fas fa-lock"></i>
        <h2>Sign in required</h2>
        <p>You need to be logged in to access the itinerary builder.</p>
        <button class="auth-button" @click="redirectToLogin">
          Go to homepage
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Google Map Container -->
      <div class="map-container">
        <div ref="mapEl" class="google-map"></div>
        <div v-if="loadError" class="map-fallback">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Google Maps failed to load. Please check your API key configuration.</span>
        </div>
        <!-- First Place Prompt -->
        <FirstPlacePrompt 
          :visible="showFirstPlacePrompt && !isEditingExisting" 
          @click="handleFirstPlaceClick"
        />
      </div>

      <!-- Thin Footer -->
      <ThinFooter />

      <!-- Add Itinerary Modal -->
      <AddItinerary 
        :visible="showAddItinerary" 
        :initial-itinerary="editingItinerary"
        @close="showAddItinerary = false" 
        @publish="handlePublishItinerary"
        @save-draft="handleSaveDraftItinerary"
        @share="handleShareItinerary"
      />
    </template>
  </div>
</template>

<script>
import Header from './Header.vue'
import ThinFooter from './itinerary-map/components/ThinFooter.vue'
import AddItinerary from './itinerary-map/components/AddItinerary.vue'
import FirstPlacePrompt from './itinerary-map/components/FirstPlacePrompt.vue'
import apiService from '../services/api.js'

export default {
  name: 'ItineraryMap',
  components: {
    Header,
    ThinFooter,
    AddItinerary,
    FirstPlacePrompt
  },
  computed: {
    isEditingExisting() {
      return Boolean(this.$route?.query?.id)
    }
  },
  data() {
    return {
      map: null,
      loadError: false,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null,
      useAdvanced: import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true',
      AdvancedMarkerElement: null,
      showAddItinerary: false,
      showFirstPlacePrompt: true,
      editingItinerary: null,
      isAuthChecking: true,
      isAuthenticated: false
    }
  },
  async mounted() {
    const authenticated = await this.ensureAuthenticated()
    if (!authenticated) return

    this.initGoogleMaps()
    if (this.isEditingExisting) {
      this.fetchExistingItinerary()
    }
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
    async ensureAuthenticated() {
      this.isAuthChecking = true
      try {
        const response = await apiService.getCurrentUser()
        this.isAuthenticated = Boolean(response?.success)
        return this.isAuthenticated
      } catch (error) {
        console.warn('[ItineraryMap] Auth check failed', error)
        this.isAuthenticated = false
        return false
      } finally {
        this.isAuthChecking = false
      }
    },
    redirectToLogin() {
      if (this.$router) {
        this.$router.push('/')
      } else {
        window.location.href = '/'
      }
    },
    async fetchExistingItinerary() {
      const rawId = this.$route?.query?.id
      const itineraryId = Number(rawId)

      if (!Number.isFinite(itineraryId) || itineraryId <= 0) {
        console.warn('[ItineraryMap] Invalid itinerary id in route query:', rawId)
        return
      }

      console.log('[ItineraryMap] Loading itinerary', itineraryId)
      const response = await apiService.getItinerary(itineraryId)

      if (!response?.success) {
        console.error('[ItineraryMap] Failed to load itinerary', {
          itineraryId,
          error: response?.error,
          status: response?.status
        })
        return
      }

      // Normalize itinerary payload similar to AddItinerary.extractItineraryFromResponse
      const payload = response.data || {}
      const itinerary =
        payload.data?.itinerary ||
        payload.itinerary ||
        payload.data ||
        payload

      if (!itinerary || !itinerary.id) {
        console.error('[ItineraryMap] Loaded itinerary response is missing itinerary data', payload)
        return
      }

      console.log('[ItineraryMap] Loaded itinerary data', itinerary)

      this.editingItinerary = itinerary
      this.showFirstPlacePrompt = false
      this.showAddItinerary = true
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

      // Load Google Maps script with callback to avoid loading warning
      const callbackName = 'initItineraryMap_' + Date.now()
      window[callbackName] = () => {
        this.createMap()
        delete window[callbackName]
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker,places&callback=${callbackName}&loading=async`
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

    handlePublishItinerary(payload) {
      this.showAddItinerary = false
      const query = { tab: 'maps' }
      if (payload?.itineraryId) {
        query.highlight = payload.itineraryId
      }
      if (this.$router) {
        this.$router.push({ path: '/profile', query })
      } else {
        const params = new URLSearchParams(query)
        window.location.href = `/profile?${params.toString()}`
      }
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

.auth-guard {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.auth-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.auth-card i {
  font-size: 32px;
  color: var(--secondary-color);
}

.auth-card h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.auth-card p {
  margin: 0;
  color: var(--text-secondary);
}

.auth-button {
  border: none;
  background: var(--secondary-color);
  color: #fff;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: filter var(--transition-fast);
}

.auth-button:hover {
  filter: brightness(1.05);
}
</style>

