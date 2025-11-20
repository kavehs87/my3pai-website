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

    <!-- POI Markers on Map -->
    <!-- Always render POIMarkers when map is ready, even if AdvancedMarkerElement is not available yet -->
    <!-- It will create markers when AdvancedMarkerElement becomes available -->
    <POIMarkers
      v-if="map"
      :pois="currentPOIs"
      :map="map"
      :AdvancedMarkerElement="AdvancedMarkerElement"
    />

    <!-- Add Itinerary Modal -->
    <AddItinerary 
      :visible="showAddItinerary" 
        :initial-itinerary="editingItinerary"
      @close="showAddItinerary = false" 
      @publish="handlePublishItinerary"
      @save-draft="handleSaveDraftItinerary"
      @share="handleShareItinerary"
      @pois-updated="handlePOIsUpdated"
    />
    </template>
  </div>
</template>

<script>
import Header from './Header.vue'
import ThinFooter from './itinerary-map/components/ThinFooter.vue'
import AddItinerary from './itinerary-map/components/AddItinerary.vue'
import FirstPlacePrompt from './itinerary-map/components/FirstPlacePrompt.vue'
import POIMarkers from './itinerary-map/components/POIMarkers.vue'
import apiService from '../services/api.js'

export default {
  name: 'ItineraryMap',
  components: {
    Header,
    ThinFooter,
    AddItinerary,
    FirstPlacePrompt,
    POIMarkers
  },
  computed: {
    isEditingExisting() {
      return Boolean(this.$route?.query?.id)
    }
  },
  data() {
    return {
      // ============================================================================
      // IMPORTANT: map is NOT stored in data() - Vue's reactivity breaks AdvancedMarkerElement
      // ============================================================================
      // 
      // ISSUE: When map is stored in data(), Vue 3 wraps it in a Proxy for reactivity.
      // This Proxy wrapper breaks Google Maps AdvancedMarkerElement - markers are created
      // but don't display on the map.
      //
      // SOLUTION: Store map as a non-reactive property (initialized in beforeCreate hook).
      // This prevents Vue from wrapping it in a Proxy, allowing AdvancedMarkerElement to work.
      //
      // REFERENCE: https://stackoverflow.com/questions/75526094/advancedmarkerelement-do-not-display-on-the-map
      // 
      // For Vue 3 Composition API: Use shallowRef() instead of ref() for the map instance.
      // For Vue 2 Options API: Don't store map in data(), use a non-reactive property instead.
      //
      // ============================================================================
      
      loadError: false,
      mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null,
      useAdvanced: import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true',
      AdvancedMarkerElement: null,
      showAddItinerary: false,
      showFirstPlacePrompt: true,
      editingItinerary: null,
      isAuthChecking: true,
      isAuthenticated: false,
      currentPOIs: []
    }
  },
  beforeCreate() {
    // Initialize map as a non-reactive property to avoid Vue's Proxy wrapping.
    // This is REQUIRED for AdvancedMarkerElement to work correctly.
    // Do NOT move this to data() - it will break marker visibility.
    this.map = null
  },
  async mounted() {
    const authenticated = await this.ensureAuthenticated()
    if (!authenticated) return

    // Log environment variables for debugging
    console.log('[ItineraryMap] Environment check:', {
      mapId: this.mapId,
      useAdvanced: this.useAdvanced,
      hasApiKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    })

    // Expose instance to window for manual testing in console
    window.itineraryMapInstance = this
    console.log('[ItineraryMap] Instance exposed to window.itineraryMapInstance for manual testing')
    console.log('[ItineraryMap] Available methods:')
    console.log('  - window.itineraryMapInstance.fitMapToPOIs()')
    console.log('  - window.itineraryMapInstance.createTestMarker(lat, lng)')
    console.log('  - window.itineraryMapInstance.map (map instance)')
    console.log('  - window.itineraryMapInstance.currentPOIs (POIs array)')
    console.log('  - window.itineraryMapInstance.AdvancedMarkerElement (AdvancedMarkerElement class)')

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
      
      // Extract POIs from itinerary and set currentPOIs immediately
      // This allows markers to be displayed on the map even before opening the modal
      if (itinerary.pointsOfInterest && Array.isArray(itinerary.pointsOfInterest)) {
        // Use Vue.set or direct assignment to ensure reactivity
        this.currentPOIs = [...itinerary.pointsOfInterest] // Create new array to trigger reactivity
        console.log('[ItineraryMap] Set currentPOIs from itinerary:', this.currentPOIs.length, 'POIs')
        console.log('[ItineraryMap] currentPOIs details:', this.currentPOIs.map(poi => ({
          name: poi?.basic?.name,
          lat: poi?.basic?.latitude,
          lng: poi?.basic?.longitude
        })))
        
        // Wait for map to be ready, then fit map FIRST, then wait before markers are created
        this.$nextTick(() => {
          if (this.map && this.currentPOIs.length > 0) {
            console.log('[ItineraryMap] Map ready, fitting to POIs first')
            // Fit map immediately
            this.fitMapToPOIs()
            
            // Then wait before ensuring markers are created
            setTimeout(() => {
              console.log('[ItineraryMap] After map fit delay, ensuring markers are created')
              // Force POIMarkers to update by triggering a reactive update
              this.$forceUpdate()
            }, 1000) // Delay after fitMapToPOIs, before ensuring markers
          } else {
            // Map not ready yet, wait for it
            const checkMap = setInterval(() => {
              if (this.map && this.currentPOIs.length > 0) {
                clearInterval(checkMap)
                console.log('[ItineraryMap] Map ready, fitting to POIs first')
                this.fitMapToPOIs()
                setTimeout(() => {
                  console.log('[ItineraryMap] After map fit delay, ensuring markers are created')
                  this.$forceUpdate()
                }, 1000)
              }
            }, 100)
            
            // Timeout after 10 seconds
            setTimeout(() => clearInterval(checkMap), 10000)
          }
        })
      }
      
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
          
          console.log('[ItineraryMap] Map idle - AdvancedMarkerElement:', !!this.AdvancedMarkerElement, 'useAdvanced:', this.useAdvanced, 'mapId:', this.mapId)
          
          // Trigger resize to ensure map fills container
          this.$nextTick(() => {
            if (this.map) {
              window.google.maps.event.trigger(this.map, 'resize')
            }
          })
          
          // If we have POIs loaded (e.g., from editing an existing itinerary), fit map to them
          if (this.currentPOIs && this.currentPOIs.length > 0) {
            this.$nextTick(() => {
              console.log('[ItineraryMap] Map idle - fitting to existing POIs:', this.currentPOIs.length)
              // Fit map immediately
              this.fitMapToPOIs()
              
              // Then wait before ensuring markers are created
              setTimeout(() => {
                console.log('[ItineraryMap] After map fit delay, ensuring markers are created')
                // Force POIMarkers to update
                this.$forceUpdate()
              }, 1000) // Delay after fitMapToPOIs, before ensuring markers
            })
          }
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
    },
    handlePOIsUpdated(pois) {
      // Update current POIs when AddItinerary emits updates
      this.currentPOIs = Array.isArray(pois) ? pois : []
      console.log('[ItineraryMap] POIs updated:', this.currentPOIs.length, 'POIs', this.currentPOIs)
      
      // Log POI positions for debugging
      this.currentPOIs.forEach((poi, index) => {
        const lat = poi?.basic?.latitude
        const lng = poi?.basic?.longitude
        const latNum = Number(lat)
        const lngNum = Number(lng)
        const isValid = !isNaN(latNum) && !isNaN(lngNum) && 
                       latNum >= -90 && latNum <= 90 && 
                       lngNum >= -180 && lngNum <= 180
        console.log(`[ItineraryMap] POI ${index + 1}:`, poi?.basic?.name, 'lat:', lat, 'lng:', lng, 'latNum:', latNum, 'lngNum:', lngNum, 'valid:', isValid)
      })
      
      // Fit map bounds to show all POIs if there are any
      // Use the same approach as when loading existing itinerary: fit map first, then wait for markers
      if (this.currentPOIs.length > 0 && this.map) {
        this.$nextTick(() => {
          console.log('[ItineraryMap] Fitting map to POIs after POI update')
          // Fit map immediately
          this.fitMapToPOIs()
          
          // Then wait before ensuring markers are created
          setTimeout(() => {
            console.log('[ItineraryMap] After map fit delay, ensuring markers are created')
            // Force POIMarkers to update
            this.$forceUpdate()
          }, 1000) // Delay after fitMapToPOIs, before ensuring markers
        })
      }
    },
    // Removed waitForMapAndMarkers - no longer needed with new approach
    fitMapToPOIs() {
      if (!this.map || !window.google || !window.google.maps) {
        console.log('[ItineraryMap] fitMapToPOIs: map not ready')
        return
      }
      
      const validPOIs = this.currentPOIs.filter(poi => {
        const lat = poi?.basic?.latitude
        const lng = poi?.basic?.longitude
        // Convert to numbers and validate
        const latNum = Number(lat)
        const lngNum = Number(lng)
        const isValid = !isNaN(latNum) && !isNaN(lngNum) && 
                       latNum >= -90 && latNum <= 90 && 
                       lngNum >= -180 && lngNum <= 180
        if (!isValid) {
          console.log('[ItineraryMap] fitMapToPOIs: Invalid POI coordinates:', {
            name: poi?.basic?.name,
            lat: lat,
            lng: lng,
            latNum: latNum,
            lngNum: lngNum,
            latType: typeof lat,
            lngType: typeof lng
          })
        }
        return isValid
      })
      
      console.log('[ItineraryMap] fitMapToPOIs: validPOIs count:', validPOIs.length)
      
      if (validPOIs.length === 0) {
        console.log('[ItineraryMap] fitMapToPOIs: no valid POIs, skipping')
        return
      }
      
      if (validPOIs.length === 1) {
        // Single POI: center and zoom
        const poi = validPOIs[0]
        const center = {
          lat: Number(poi.basic.latitude),
          lng: Number(poi.basic.longitude)
        }
        console.log('[ItineraryMap] fitMapToPOIs: centering on single POI:', center)
        this.map.setCenter(center)
        this.map.setZoom(14)
      } else {
        // Multiple POIs: fit bounds
        const bounds = new window.google.maps.LatLngBounds()
        validPOIs.forEach(poi => {
          bounds.extend({
            lat: Number(poi.basic.latitude),
            lng: Number(poi.basic.longitude)
          })
        })
        console.log('[ItineraryMap] fitMapToPOIs: fitting bounds for', validPOIs.length, 'POIs')
        this.map.fitBounds(bounds)
      }
    },
    // Manual test method to create a marker at specific coordinates
    createTestMarker(lat, lng, title = 'Test Marker') {
      if (!this.map) {
        console.error('[ItineraryMap] Map not ready')
        return null
      }
      
      if (!this.AdvancedMarkerElement) {
        console.error('[ItineraryMap] AdvancedMarkerElement not available')
        return null
      }
      
      const position = { lat: Number(lat), lng: Number(lng) }
      
      // Create content element
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
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 3px solid white;
      `
      content.textContent = 'T'
      content.title = title
      
      try {
        const marker = new this.AdvancedMarkerElement({
          map: this.map,
          position: position,
          title: title,
          content: content,
          zIndex: 2000
        })
        
        console.log('[ItineraryMap] Test marker created:', marker, 'at', position)
        return marker
      } catch (error) {
        console.error('[ItineraryMap] Failed to create test marker:', error)
        return null
      }
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

