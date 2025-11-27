<template>
  <div class="map-builder-page">
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
        <p>You need to be logged in to access the map builder.</p>
        <button class="auth-button" @click="redirectToLogin">
          Go to homepage
        </button>
      </div>
    </div>

    <template v-else>
    <!-- Container for split layout and overlay prompt -->
    <div class="split-layout-container">
      <!-- Split Layout: AddMap (left) | Map (right) -->
      <div class="split-layout">
        <!-- Left Side: Add Map Panel (30%) -->
        <div class="panel-side">
          <AddMap 
            :visible="true" 
            :initial-map="editingMap"
            @close="handleCloseMap" 
            @publish="handlePublishMap"
            @save-draft="handleSaveDraftMap"
            @share="handleShareMap"
            @pois-updated="handlePOIsUpdated"
          />
        </div>

        <!-- Right Side: Map Container (70%) -->
        <div class="map-side">
          <div class="map-container">
            <div ref="mapEl" class="google-map"></div>
            <div v-if="loadError" class="map-fallback">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Google Maps failed to load. Please check your API key configuration.</span>
            </div>
            <!-- Pick mode indicator -->
            <transition name="fade">
              <div v-if="isMapPickMode" class="pick-mode-indicator">
                <i class="fas fa-crosshairs"></i>
                <span>Click anywhere on the map to set location</span>
                <button class="pick-mode-cancel" @click="exitMapPickMode">Cancel</button>
              </div>
            </transition>
          </div>

          <!-- POI Markers on Map -->
          <!-- Always render POIMarkers when map is ready, even if AdvancedMarkerElement is not available yet -->
          <!-- It will create markers when AdvancedMarkerElement becomes available -->
          <POIMarkers
            v-if="map"
            :pois="currentPOIs"
            :map="map"
            :AdvancedMarkerElement="AdvancedMarkerElement"
          />
        </div>
      </div>

      <!-- First Place Prompt - Overlays entire split layout (both panel and map) -->
      <FirstPlacePrompt 
        :visible="showFirstPlacePrompt && !isEditingExisting" 
        @click="handleFirstPlaceClick"
      />
    </div>

    <!-- Thin Footer - Outside split layout, spans full width -->
    <ThinFooter />
    </template>
  </div>
</template>

<script>
import Header from './Header.vue'
import ThinFooter from './map-builder/components/ThinFooter.vue'
import AddMap from './map-builder/components/AddMap.vue'
import FirstPlacePrompt from './map-builder/components/FirstPlacePrompt.vue'
import POIMarkers from './map-builder/components/POIMarkers.vue'
import apiService from '../services/api.js'
import { eventBus } from '../utils/eventBus.js'

export default {
  name: 'MapBuilder',
  components: {
    Header,
    ThinFooter,
    AddMap,
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
      showAddMap: false,
      showFirstPlacePrompt: true,
      editingMap: null,
      isAuthChecking: true,
      isAuthenticated: false,
      currentPOIs: [],
      // Map pick mode state
      isMapPickMode: false,
      mapPickClickListener: null,
      pickModeMarker: null
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
    console.log('[MapBuilder] Environment check:', {
      mapId: this.mapId,
      useAdvanced: this.useAdvanced,
      hasApiKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    })

    // Expose instance to window for manual testing in console
    window.mapBuilderInstance = this
    console.log('[MapBuilder] Instance exposed to window.mapBuilderInstance for manual testing')
    console.log('[MapBuilder] Available methods:')
    console.log('  - window.mapBuilderInstance.fitMapToPOIs()')
    console.log('  - window.mapBuilderInstance.createTestMarker(lat, lng)')
    console.log('  - window.mapBuilderInstance.map (map instance)')
    console.log('  - window.mapBuilderInstance.currentPOIs (POIs array)')
    console.log('  - window.mapBuilderInstance.AdvancedMarkerElement (AdvancedMarkerElement class)')

    this.initGoogleMaps()
    if (this.isEditingExisting) {
      this.fetchExistingMap()
    }
    // Add resize listener to ensure map resizes properly
    window.addEventListener('resize', this.handleResize)
    
    // Listen for map pick mode events
    eventBus.on('enter-map-pick-mode', this.enterMapPickMode)
  },
  beforeUnmount() {
    // Clean up map instance if needed
    if (this.map) {
      this.map = null
    }
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize)
    
    // Clean up event bus listeners and pick mode
    eventBus.off('enter-map-pick-mode', this.enterMapPickMode)
    this.exitMapPickMode()
  },
  methods: {
    async ensureAuthenticated() {
      this.isAuthChecking = true
      try {
        const response = await apiService.getCurrentUser()
        this.isAuthenticated = Boolean(response?.success)
        return this.isAuthenticated
      } catch (error) {
        console.warn('[MapBuilder] Auth check failed', error)
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
    async fetchExistingMap() {
      const rawId = this.$route?.query?.id
      const mapId = Number(rawId)

      if (!Number.isFinite(mapId) || mapId <= 0) {
        console.warn('[MapBuilder] Invalid map id in route query:', rawId)
        return
      }

      console.log('[MapBuilder] Loading map', mapId)
      const response = await apiService.getMap(mapId)

      if (!response?.success) {
        console.error('[MapBuilder] Failed to load map', {
          mapId,
          error: response?.error,
          status: response?.status
        })
        return
      }

      // Normalize map payload similar to AddMap.extractMapFromResponse
      const payload = response.data || {}
      const map =
        payload.data?.map ||
        payload.map ||
        payload.data ||
        payload

      if (!map || !map.id) {
        console.error('[MapBuilder] Loaded map response is missing map data', payload)
        return
      }

      console.log('[MapBuilder] Loaded map data', map)

      this.editingMap = map
      this.showFirstPlacePrompt = false
      // AddMap is always visible now, no need to set showAddMap
      
      // Extract POIs from map and set currentPOIs immediately
      // This allows markers to be displayed on the map even before opening the modal
      if (map.pois && Array.isArray(map.pois)) {
        // Use Vue.set or direct assignment to ensure reactivity
        this.currentPOIs = [...map.pois] // Create new array to trigger reactivity
        console.log('[MapBuilder] Set currentPOIs from map:', this.currentPOIs.length, 'POIs')
        console.log('[MapBuilder] currentPOIs details:', this.currentPOIs.map(poi => ({
          name: poi?.basic?.name,
          lat: poi?.basic?.latitude,
          lng: poi?.basic?.longitude
        })))
        
        // Wait for map to be ready, then fit map FIRST, then wait before markers are created
        this.$nextTick(() => {
          if (this.map && this.currentPOIs.length > 0) {
            console.log('[MapBuilder] Map ready, fitting to POIs first')
            // Fit map immediately
            this.fitMapToPOIs()
            
            // Then wait before ensuring markers are created
            setTimeout(() => {
              console.log('[MapBuilder] After map fit delay, ensuring markers are created')
              // Force POIMarkers to update by triggering a reactive update
              this.$forceUpdate()
            }, 1000) // Delay after fitMapToPOIs, before ensuring markers
          } else {
            // Map not ready yet, wait for it
            const checkMap = setInterval(() => {
              if (this.map && this.currentPOIs.length > 0) {
                clearInterval(checkMap)
                console.log('[MapBuilder] Map ready, fitting to POIs first')
                this.fitMapToPOIs()
                setTimeout(() => {
                  console.log('[MapBuilder] After map fit delay, ensuring markers are created')
                  this.$forceUpdate()
                }, 1000)
              }
            }, 100)
            
            // Timeout after 10 seconds
            setTimeout(() => clearInterval(checkMap), 10000)
          }
        })
      }
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
      const callbackName = 'initMapBuilder_' + Date.now()
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
          
          console.log('[MapBuilder] Map idle - AdvancedMarkerElement:', !!this.AdvancedMarkerElement, 'useAdvanced:', this.useAdvanced, 'mapId:', this.mapId)
          
          // Trigger resize to ensure map fills container
          this.$nextTick(() => {
            if (this.map) {
              window.google.maps.event.trigger(this.map, 'resize')
            }
          })
          
          // If we have POIs loaded (e.g., from editing an existing map), fit map to them
          if (this.currentPOIs && this.currentPOIs.length > 0) {
            this.$nextTick(() => {
              console.log('[MapBuilder] Map idle - fitting to existing POIs:', this.currentPOIs.length)
              // Fit map immediately
              this.fitMapToPOIs()
              
              // Then wait before ensuring markers are created
              setTimeout(() => {
                console.log('[MapBuilder] After map fit delay, ensuring markers are created')
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

    handlePublishMap(payload) {
      const query = { tab: 'maps' }
      if (payload?.mapId) {
        query.highlight = payload.mapId
      }
      if (this.$router) {
        this.$router.push({ path: '/profile', query })
      } else {
        const params = new URLSearchParams(query)
        window.location.href = `/profile?${params.toString()}`
      }
    },
    handleSaveDraftMap() {
      // Handle save draft logic here
      // Don't close modal on draft save
    },
    handleShareMap() {
      // Handle share logic here
      // Don't close modal on share
    },
    handleFirstPlaceClick() {
      this.showFirstPlacePrompt = false
      // AddMap is always visible now, no need to set showAddMap
    },
    handleCloseMap() {
      // When closing, we might want to reset the form or navigate away
      // For now, just hide the first place prompt if needed
      this.showFirstPlacePrompt = true
    },
    handlePOIsUpdated(pois) {
      // Update current POIs when AddMap emits updates
      this.currentPOIs = Array.isArray(pois) ? pois : []
      console.log('[MapBuilder] POIs updated:', this.currentPOIs.length, 'POIs', this.currentPOIs)
      
      // Log POI positions for debugging
      this.currentPOIs.forEach((poi, index) => {
        const lat = poi?.basic?.latitude
        const lng = poi?.basic?.longitude
        const latNum = Number(lat)
        const lngNum = Number(lng)
        const isValid = !isNaN(latNum) && !isNaN(lngNum) && 
                       latNum >= -90 && latNum <= 90 && 
                       lngNum >= -180 && lngNum <= 180
        console.log(`[MapBuilder] POI ${index + 1}:`, poi?.basic?.name, 'lat:', lat, 'lng:', lng, 'latNum:', latNum, 'lngNum:', lngNum, 'valid:', isValid)
      })
      
      // Fit map bounds to show all POIs if there are any
      // Use the same approach as when loading existing map: fit map first, then wait for markers
      if (this.currentPOIs.length > 0 && this.map) {
        this.$nextTick(() => {
          console.log('[MapBuilder] Fitting map to POIs after POI update')
          // Fit map immediately
          this.fitMapToPOIs()
          
          // Then wait before ensuring markers are created
          setTimeout(() => {
            console.log('[MapBuilder] After map fit delay, ensuring markers are created')
            // Force POIMarkers to update
            this.$forceUpdate()
          }, 1000) // Delay after fitMapToPOIs, before ensuring markers
        })
      }
    },
    // Removed waitForMapAndMarkers - no longer needed with new approach
    fitMapToPOIs() {
      if (!this.map || !window.google || !window.google.maps) {
        console.log('[MapBuilder] fitMapToPOIs: map not ready')
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
          console.log('[MapBuilder] fitMapToPOIs: Invalid POI coordinates:', {
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
      
      console.log('[MapBuilder] fitMapToPOIs: validPOIs count:', validPOIs.length)
      
      if (validPOIs.length === 0) {
        console.log('[MapBuilder] fitMapToPOIs: no valid POIs, skipping')
        return
      }
      
      if (validPOIs.length === 1) {
        // Single POI: center and zoom
        const poi = validPOIs[0]
        const center = {
          lat: Number(poi.basic.latitude),
          lng: Number(poi.basic.longitude)
        }
        console.log('[MapBuilder] fitMapToPOIs: centering on single POI:', center)
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
        console.log('[MapBuilder] fitMapToPOIs: fitting bounds for', validPOIs.length, 'POIs')
        this.map.fitBounds(bounds)
      }
    },
    // Map pick mode methods
    enterMapPickMode(options = {}) {
      console.log('[MapBuilder] Entering map pick mode', options)
      if (!this.map) {
        console.warn('[MapBuilder] Cannot enter pick mode - map not ready')
        return
      }
      
      this.isMapPickMode = true
      
      // Add crosshair cursor class to map container
      const mapEl = this.$refs.mapEl
      if (mapEl) {
        mapEl.classList.add('pick-mode')
      }
      
      // If there are initial coordinates, center the map there
      if (options.currentLatitude && options.currentLongitude) {
        const lat = Number(options.currentLatitude)
        const lng = Number(options.currentLongitude)
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          this.map.setCenter({ lat, lng })
          if (this.map.getZoom() < 12) {
            this.map.setZoom(14)
          }
        }
      }
      
      // Add click listener to map
      this.mapPickClickListener = this.map.addListener('click', (event) => {
        const position = {
          latitude: event.latLng.lat().toFixed(6),
          longitude: event.latLng.lng().toFixed(6)
        }
        console.log('[MapBuilder] Map clicked in pick mode:', position)
        
        // Show temporary marker at picked location
        this.showPickModeMarker(event.latLng)
        
        // Emit the picked location
        eventBus.emit('map-location-picked', position)
        
        // Exit pick mode after a short delay to show the marker
        setTimeout(() => {
          this.exitMapPickMode()
        }, 300)
      })
    },
    
    exitMapPickMode(emitCancelEvent = true) {
      if (!this.isMapPickMode) return
      
      console.log('[MapBuilder] Exiting map pick mode')
      this.isMapPickMode = false
      
      // Remove crosshair cursor class
      const mapEl = this.$refs.mapEl
      if (mapEl) {
        mapEl.classList.remove('pick-mode')
      }
      
      // Remove click listener
      if (this.mapPickClickListener) {
        window.google?.maps?.event?.removeListener(this.mapPickClickListener)
        this.mapPickClickListener = null
      }
      
      // Remove temporary marker
      if (this.pickModeMarker) {
        this.pickModeMarker.setMap(null)
        this.pickModeMarker = null
      }
      
      // Emit cancel event so UI can update (e.g., button state)
      if (emitCancelEvent) {
        eventBus.emit('map-pick-mode-cancelled')
      }
    },
    
    showPickModeMarker(position) {
      // Remove existing pick mode marker
      if (this.pickModeMarker) {
        this.pickModeMarker.setMap(null)
      }
      
      if (!this.map || !window.google) return
      
      // Create a simple marker to show where user clicked
      const AdvancedMarkerElement = this.AdvancedMarkerElement
      
      if (AdvancedMarkerElement) {
        const content = document.createElement('div')
        content.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #22c55e;
          color: #fff;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          border: 3px solid white;
          animation: pick-marker-pop 0.3s ease-out;
        `
        content.innerHTML = '<i class="fas fa-check"></i>'
        
        try {
          this.pickModeMarker = new AdvancedMarkerElement({
            map: this.map,
            position: position,
            content: content,
            zIndex: 3000
          })
        } catch (error) {
          console.warn('[MapBuilder] AdvancedMarkerElement failed for pick marker:', error)
        }
      } else {
        // Fallback to regular marker
        this.pickModeMarker = new window.google.maps.Marker({
          map: this.map,
          position: position,
          animation: window.google.maps.Animation.DROP
        })
      }
    },
    
    // Manual test method to create a marker at specific coordinates
    createTestMarker(lat, lng, title = 'Test Marker') {
      if (!this.map) {
        console.error('[MapBuilder] Map not ready')
        return null
      }
      
      if (!this.AdvancedMarkerElement) {
        console.error('[MapBuilder] AdvancedMarkerElement not available')
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
        
        console.log('[MapBuilder] Test marker created:', marker, 'at', position)
        return marker
      } catch (error) {
        console.error('[MapBuilder] Failed to create test marker:', error)
        return null
      }
    }
  }
}
</script>

<style scoped>
.map-builder-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Container for split layout and overlay prompt */
.split-layout-container {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0; /* Important for flex children */
  overflow: hidden;
}

/* Split Layout: 30/70 vertical split */
.split-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 0; /* Important for flex children */
}

/* Left Side: AddMap Panel (30%) */
.panel-side {
  width: 30%;
  flex: 0 0 30%;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--border-light);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex children to allow scrolling */
}

/* Right Side: Map Container (70%) */
.map-side {
  width: 70%;
  flex: 0 0 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
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

/* Map pick mode styles */
.google-map.pick-mode {
  cursor: crosshair !important;
}

.google-map.pick-mode :deep(*) {
  cursor: crosshair !important;
}

.pick-mode-indicator {
  position: absolute;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-primary);
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 100;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.pick-mode-indicator i {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  animation: pulse-icon 1s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pick-mode-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pick-mode-cancel:hover {
  background: var(--error-color, #ef4444);
  border-color: var(--error-color, #ef4444);
  color: white;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

