<template>
  <div class="map-panel">
    <div ref="mapEl" class="gmap"></div>
    <div v-if="loadError" class="map-fallback">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Google Maps failed to load. Set VITE_GOOGLE_MAPS_API_KEY and reload.</span>
    </div>
  </div>
</template>

<script>
import { isProxy } from 'vue'

// Use a module-scoped, non-reactive map reference
let _map = null // google.maps.Map|null
// Module-level polyline registry to track ALL polylines ever created
let _allPolylines = [] // Keep all polyline references
// PERSISTENT tracking array - NEVER cleared, tracks ALL polylines ever created
let _persistentPolylines = [] // This array is NEVER cleared - for debugging
export default {
  name: 'MapPanel',
  props: { layers: Array },
  data() {
    return { map: null, markers: [], circles: [], polyline: null, polylines: [], loadError: false, mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null, useAdvanced: (import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true'), idToShape: {}, pulseTimers: {}, isRebuilding: false, clearPolylinesLock: false, polylinesDisabled: false, waitingForIdle: false }
  },
  computed: {
    points() {
      const events = this.layers.flatMap(l => (l.events || []).map(e => ({ ...e, layer: l.id })))
      return events.sort((a, b) => a.start.localeCompare(b.start))
    },
    layerColors() {
      return {
        accommodation: { fill: '#6366f1' },
        activities: { fill: '#10b981' },
        food: { fill: '#f59e0b' },
        transport: { fill: '#3b82f6' }
      }
    }
  },
  mounted() {
    this.initGoogleMaps()
  },
  watch: {
    points: {
      handler() {
        if (this.isRebuilding || this.clearPolylinesLock || this.waitingForIdle) {
          if (this.waitingForIdle) {
            console.log('[MapPanel] points watcher: Skipping renderRoute - already waiting for map idle')
          }
          return
        }
        this.renderRoute()
      },
      deep: true
    }
  },
  methods: {
    rebuildMap() {
      if (!window.google?.maps) return
      this.isRebuilding = true
      this.clearAll()
      // Recreate the map instance to guarantee a clean slate
      try {
        const center = this.points.length ? { lat: this.points[0].coords[0], lng: this.points[0].coords[1] } : { lat: 48.8566, lng: 2.3522 }
        const options = { center, zoom: 12, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }
        if (this.mapId) options.mapId = this.mapId
        _map = new window.google.maps.Map(this.$refs.mapEl, options)
        this.AdvancedMarkerElement = (this.useAdvanced && this.mapId) ? (window.google?.maps?.marker?.AdvancedMarkerElement || null) : null
        window.google.maps.event.addListenerOnce(_map, 'idle', () => {
          this.isRebuilding = false
          this.renderRoute()
        })
      } catch (e) {
        this.isRebuilding = false
      }
    },
    clearAll() {
      if (!_map || !window.google?.maps) return
      // Remove markers (classic and AdvancedMarker)
      this.markers.forEach(m => {
        if (m && typeof m.setMap === 'function') {
          m.setMap(null)
        } else if (m && 'map' in m) {
          try { m.map = null } catch (e) {}
        }
      })
      this.markers = []
      // Remove circles
      this.circles?.forEach(c => c.setMap && c.setMap(null))
      this.circles = []
      // Remove all polylines - use aggressive clearing if lock is active
      if (this.polylines && this.polylines.length > 0) {
        console.log(`[MapPanel] clearAll: Found ${this.polylines.length} polylines in array to clear`)
      }
      if (this.clearPolylinesLock) {
        // When lock is active, clear more aggressively to ensure they're gone
        ;(this.polylines || []).forEach((pl, idx) => {
          try {
            console.log(`[MapPanel] clearAll: Clearing polyline ${idx} from array`)
            // Clear path and hide visually first
            try {
              if (pl.getPath && typeof pl.setPath === 'function') {
                const emptyPath = new window.google.maps.MVCArray([])
                pl.setPath(emptyPath)
              }
              if (pl.setOptions && typeof pl.setOptions === 'function') {
                pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
              }
            } catch (e) {}
            if (pl && typeof pl.setMap === 'function') pl.setMap(null)
            if (pl && 'map' in pl) pl.map = null
            if (pl && pl.getMap && typeof pl.getMap === 'function') {
              const attachedMap = pl.getMap()
              if (attachedMap) pl.setMap(null)
            }
          } catch (e) {
            console.warn(`[MapPanel] clearAll: Error clearing polyline ${idx}:`, e)
          }
        })
      } else {
        ;(this.polylines || []).forEach((pl, idx) => { 
          console.log(`[MapPanel] clearAll: Clearing polyline ${idx} with setMap(null)`)
          try {
            // Clear path and hide visually first
            if (pl.getPath && typeof pl.setPath === 'function') {
              const emptyPath = new window.google.maps.MVCArray([])
              pl.setPath(emptyPath)
            }
            if (pl.setOptions && typeof pl.setOptions === 'function') {
              pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
            }
            if (pl && pl.setMap) pl.setMap(null)
          } catch (e) {} 
        })
      }
      this.polylines = []
      // CRITICAL: Always clear module-level registry in clearAll()
      // The registry should only be populated when creating NEW polylines, not persisted
      _allPolylines = []
      // Stop and remove pulse rings
      Object.keys(this.pulseTimers || {}).forEach(id => this.stopPulse(id))
      this.pulseTimers = {}
      // Remove any shapes tracked by id
      Object.values(this.idToShape || {}).forEach(s => {
        try { s.circle && s.circle.setMap && s.circle.setMap(null) } catch (e) {}
        try {
          if (s.marker && typeof s.marker.setMap === 'function') s.marker.setMap(null)
          else if (s.marker && 'map' in s.marker) s.marker.map = null
        } catch (e) {}
      })
      this.idToShape = {}
      // Remove route polyline - aggressive if lock is active
      if (this.polyline) {
        console.log(`[MapPanel] clearAll: Removing this.polyline`)
        const beforeMap = this.polyline.getMap ? this.polyline.getMap() : null
        console.log(`[MapPanel] clearAll: this.polyline.getMap() before removal =`, beforeMap ? 'ATTACHED' : 'NULL')
        
        // CRITICAL: Try to clear the path FIRST before removing from map
        // This might help force Google Maps to clear the visual representation
        try {
          if (this.polyline.getPath && typeof this.polyline.setPath === 'function') {
            const emptyPath = new window.google.maps.MVCArray([])
            this.polyline.setPath(emptyPath)
            console.log(`[MapPanel] clearAll: Cleared polyline path to empty array`)
          }
        } catch (e) {
          console.warn(`[MapPanel] clearAll: Could not clear path:`, e)
        }
        
        // Also try to set opacity to 0 to hide it visually
        try {
          if (this.polyline.setOptions && typeof this.polyline.setOptions === 'function') {
            this.polyline.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
          }
        } catch (e) {}
        
        if (this.clearPolylinesLock) {
          try {
            if (typeof this.polyline.setMap === 'function') this.polyline.setMap(null)
            if ('map' in this.polyline) this.polyline.map = null
            if (this.polyline.getMap && typeof this.polyline.getMap === 'function') {
              const attachedMap = this.polyline.getMap()
              if (attachedMap) {
                console.warn(`[MapPanel] clearAll: Polyline STILL attached after first setMap(null)!`)
                this.polyline.setMap(null)
              }
            }
          } catch (e) {
            console.warn(`[MapPanel] clearAll: Error removing polyline:`, e)
          }
        } else {
          this.polyline.setMap(null)
        }
        
        // Verify it's actually removed
        const afterMap = this.polyline.getMap ? this.polyline.getMap() : null
        console.log(`[MapPanel] clearAll: this.polyline.getMap() after removal =`, afterMap ? 'STILL ATTACHED!' : 'NULL (removed)')
        
        if (afterMap !== null) {
          console.error(`[MapPanel] clearAll: FAILED TO REMOVE POLYLINE! Still attached to map!`)
          // Try one more aggressive removal
          try {
            this.polyline.setMap(null)
            if ('map' in this.polyline) {
              this.polyline.map = null
            }
          } catch (e) {}
        }
        
        this.polyline = null
      }
      
      // CRITICAL: Also check persistent array and force-remove ANY polylines that might still be visible
      // Even if getMap() says they're detached, Google Maps canvas might still show them
      if (_persistentPolylines && _persistentPolylines.length > 0) {
        console.log(`[MapPanel] clearAll: Checking ${_persistentPolylines.length} polylines in persistent array`)
        _persistentPolylines.forEach((pl, idx) => {
          if (!pl) return
          try {
            // Force clear path regardless of attachment status
            if (pl.getPath && typeof pl.setPath === 'function') {
              try {
                const emptyPath = new window.google.maps.MVCArray([])
                pl.setPath(emptyPath)
                console.log(`[MapPanel] clearAll: Cleared path for persistent polyline ${idx}`)
              } catch (e) {
                console.warn(`[MapPanel] clearAll: Could not clear path for persistent polyline ${idx}:`, e)
              }
            }
            // Force hide visually
            if (pl.setOptions && typeof pl.setOptions === 'function') {
              try {
                pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
              } catch (e) {}
            }
            // Force remove from map
            const currentMap = pl.getMap ? pl.getMap() : null
            if (currentMap !== null) {
              console.warn(`[MapPanel] clearAll: Persistent polyline ${idx} is STILL ATTACHED! Force removing...`)
              pl.setMap(null)
              if ('map' in pl) pl.map = null
            }
            // Try removing even if getMap() says null - sometimes canvas cache shows old visuals
            try {
              pl.setMap(null)
              if ('map' in pl) pl.map = null
            } catch (e) {}
          } catch (e) {
            console.warn(`[MapPanel] clearAll: Error processing persistent polyline ${idx}:`, e)
          }
        })
        
        // Force a map refresh after clearing all persistent polylines
        // This ensures the canvas is redrawn without cached visuals
        if (_map) {
          try {
            const center = _map.getCenter()
            const zoom = _map.getZoom()
            if (center && zoom) {
              // Trigger a refresh by slightly changing and restoring zoom
              _map.setZoom(zoom + 0.0001)
              setTimeout(() => {
                _map.setZoom(zoom)
                window.google.maps.event.trigger(_map, 'resize')
              }, 10)
              console.log(`[MapPanel] clearAll: Forced map refresh after clearing persistent polylines`)
            }
          } catch (e) {
            console.warn(`[MapPanel] clearAll: Could not force map refresh:`, e)
          }
        }
      }
      
      console.log(`[MapPanel] clearAll: Finished`)
    },
    initGoogleMaps() {
      const existing = window.google && window.google.maps
      if (existing) {
        this.createMap()
        return
      }
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        this.loadError = true
        return
      }
      const script = document.createElement('script')
      // Use weekly channel + marker library; avoid loading=async for broader compatibility
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`
      script.async = true
      script.defer = true
      script.onload = () => this.createMap()
      script.onerror = () => { this.loadError = true }
      document.head.appendChild(script)
    },

    createMap() {
      try {
        const center = this.points.length ? { lat: this.points[0].coords[0], lng: this.points[0].coords[1] } : { lat: 48.8566, lng: 2.3522 }
        const options = { center, zoom: 12, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }
        if (this.mapId) options.mapId = this.mapId
        _map = new window.google.maps.Map(this.$refs.mapEl, options)
        // detect advanced markers (requires vector map w/ mapId) + flag
        this.AdvancedMarkerElement = (this.useAdvanced && this.mapId) ? (window.google?.maps?.marker?.AdvancedMarkerElement || null) : null
        // Quiet: remove verbose diagnostics; use targeted debug instead
        // Wait for map to be ready before adding markers
        window.google.maps.event.addListenerOnce(_map, 'idle', () => {
          this.renderRoute()
        })
        // Click handler removed (diagnostic marker drop disabled)
      } catch (e) {
        console.error('Google Maps init failed', e)
        this.loadError = true
      }
    },

    renderRoute() {
      if (!_map || !window.google?.maps) return
      if (this.clearPolylinesLock) {
        console.log('[MapPanel] renderRoute blocked by clearPolylinesLock')
        return // Don't render if polylines are being manually cleared
      }
      if (this.polylinesDisabled) {
        console.log('[MapPanel] renderRoute blocked by polylinesDisabled - will render markers but not polylines')
        // Still render markers/circles, just skip polyline creation
        this.clearAll()
        const path = []
        this.points.forEach((p, idx) => {
          const pos = { lat: p.coords[0], lng: p.coords[1] }
          path.push(pos)
          // ... (render markers/circles only, no polyline)
          const canUseAdvanced = !!this.AdvancedMarkerElement
          if (canUseAdvanced) {
            const content = document.createElement('div')
            content.style.cssText = `
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: ${this.layerColors[p.layer]?.fill || '#10b981'};
              color: #fff;
              font-size: 16px;
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 3px solid white;
            `
            content.textContent = String(idx + 1)
            try {
              const adv = new this.AdvancedMarkerElement({ 
                map: _map, 
                position: pos, 
                title: p.name, 
                content,
                zIndex: 1000
              })
              this.markers.push(adv)
              const layerColor = this.layerColors[p.layer]?.fill || '#10b981'
              const circle = new window.google.maps.Circle({
                strokeColor: layerColor,
                strokeOpacity: 0.9,
                strokeWeight: 2,
                fillColor: layerColor,
                fillOpacity: 0.7,
                map: _map,
                center: pos,
                radius: 50,
                zIndex: 999
              })
              this.circles.push(circle)
              this.idToShape[p.id] = { marker: adv, circle, color: layerColor, position: pos, content }
            } catch (err) {
              console.error('[MapPanel] AdvancedMarker creation failed:', err)
            }
          } else {
            const marker = new window.google.maps.Marker({
              position: pos,
              map: _map,
              title: p.name,
              label: { text: String(idx + 1), color: '#ffffff', fontWeight: '700' },
              zIndex: 1000
            })
            this.markers.push(marker)
            const circle = new window.google.maps.Circle({
              strokeColor: this.layerColors[p.layer]?.fill || '#10b981',
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: this.layerColors[p.layer]?.fill || '#10b981',
              fillOpacity: 0.8,
              map: _map,
              center: pos,
              radius: 35
            })
            this.circles.push(circle)
            this.idToShape[p.id] = { marker, circle, color: this.layerColors[p.layer]?.fill || '#10b981', position: pos }
          }
        })
        return // Don't create polyline
      }
      // clear previous overlays fully
      this.clearAll()

      const path = []
      
      this.points.forEach((p, idx) => {
        const pos = { lat: p.coords[0], lng: p.coords[1] }
        // Exclude transport layer events from polyline path (but still show markers/circles)
        if (p.layer !== 'transport') {
          path.push(pos)
        }
        // Advanced markers if available; otherwise fall back to classic Marker
        const canUseAdvanced = !!this.AdvancedMarkerElement
        if (canUseAdvanced) {
          const content = document.createElement('div')
          content.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${this.layerColors[p.layer]?.fill || '#10b981'};
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 3px solid white;
          `
          content.textContent = String(idx + 1)
          try {
            const adv = new this.AdvancedMarkerElement({ 
              map: _map, 
              position: pos, 
              title: p.name, 
              content,
              zIndex: 1000
            })
            this.markers.push(adv)
            
            // ALSO add a circle as backup to guarantee visibility (color-coded by layer)
            const layerColor = this.layerColors[p.layer]?.fill || '#10b981'
            const circle = new window.google.maps.Circle({
              strokeColor: layerColor,
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: layerColor,
              fillOpacity: 0.7,
              map: _map,
              center: pos,
              radius: 50,
              zIndex: 999
            })
            this.circles.push(circle)
            this.idToShape[p.id] = { marker: adv, circle, color: layerColor, position: pos, content }
          } catch (err) {
            console.error('[MapPanel] AdvancedMarker creation failed:', err)
          }
        } else {
          const marker = new window.google.maps.Marker({
            position: pos,
            map: _map,
            title: p.name,
            label: { text: String(idx + 1), color: '#ffffff', fontWeight: '700' },
            // Use default pin to guarantee visibility across styles
            zIndex: 1000
          })
          this.markers.push(marker)
          // Add a small circle to ensure visibility regardless of style
          const circle = new window.google.maps.Circle({
            strokeColor: this.layerColors[p.layer]?.fill || '#10b981',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: this.layerColors[p.layer]?.fill || '#10b981',
            fillOpacity: 0.8,
            map: _map,
            center: pos,
            radius: 35
          })
          this.circles.push(circle)
          this.idToShape[p.id] = { marker, circle, color: this.layerColors[p.layer]?.fill || '#10b981', position: pos }
        }
      })
      // CRITICAL: A polyline needs at least 2 points to be drawn
      // If there's only 1 point, just show the marker/circle but no polyline
      if (path.length >= 2) {
        // Re-enable polylines if they were disabled for single point scenario
        if (this.polylinesDisabled) {
          console.log(`[MapPanel] Re-enabling polylines (had ${path.length} points, was disabled)`)
          this.polylinesDisabled = false
        }
        
        if (!this.clearPolylinesLock && !this.polylinesDisabled) {
          console.log(`[MapPanel] 🟢 CREATING POLYLINE: path points=${path.length}, clearPolylinesLock=${this.clearPolylinesLock}, polylinesDisabled=${this.polylinesDisabled}`)
          // CRITICAL: Before creating a new polyline, double-check the old one is REALLY gone
          if (this.polyline) {
            console.warn('[MapPanel] WARNING: this.polyline exists before creating new one! Clearing it first...')
            try {
              const oldMap = this.polyline.getMap()
              if (oldMap !== null) {
                console.warn(`[MapPanel] OLD POLYLINE STILL ATTACHED! Removing...`)
                this.polyline.setMap(null)
              }
            } catch (e) {
              console.warn('[MapPanel] Error checking old polyline:', e)
            }
            this.polyline = null
          }
          
          // CRITICAL: Set bounds FIRST, then wait for map to finish animation before creating polyline
          // This prevents old polyline visuals from reappearing during fitBounds animation
          // Calculate bounds from ALL points (including transport) so all markers are visible
          const bounds = new window.google.maps.LatLngBounds()
          this.points.forEach(p => bounds.extend({ lat: p.coords[0], lng: p.coords[1] }))
          _map.fitBounds(bounds, 50)
          
          // Set flag to prevent multiple renderRoute calls during map animation
          this.waitingForIdle = true
          console.log('[MapPanel] Waiting for map idle event - blocking further renderRoute calls')
          
          // Safety timeout - if idle doesn't fire within 2 seconds, proceed anyway
          const timeoutId = setTimeout(() => {
            if (this.waitingForIdle) {
              console.warn('[MapPanel] Timeout waiting for idle event - proceeding with polyline creation')
              this.waitingForIdle = false
              this.createPolylineAfterIdle(path)
            }
          }, 2000)
          
          // Wait for map animation to complete before adding polyline
          // This ensures old visuals are fully cleared before new ones are drawn
          const idleListener = window.google.maps.event.addListenerOnce(_map, 'idle', () => {
            clearTimeout(timeoutId)
            console.log('[MapPanel] Map idle after fitBounds - now creating polyline')
            this.waitingForIdle = false
            this.createPolylineAfterIdle(path)
          })
        }
      } else if (path.length < 2) {
        // Not enough points for a polyline (need at least 2)
        console.log(`[MapPanel] ⛔ SKIPPING POLYLINE: Only ${path.length} point(s) - polylines need at least 2 points`)
        
        // CRITICAL: Temporarily disable polylines to prevent any from appearing
        this.polylinesDisabled = true
        
        // CRITICAL: Aggressively clear ALL persistent polylines
        const clearPersistentPolylines = () => {
          if (_persistentPolylines && _persistentPolylines.length > 0) {
            console.log(`[MapPanel] Aggressively clearing ${_persistentPolylines.length} persistent polylines`)
            _persistentPolylines.forEach((pl, idx) => {
              if (!pl) return
              try {
                // Clear path first
                if (pl.getPath && typeof pl.setPath === 'function') {
                  const emptyPath = new window.google.maps.MVCArray([])
                  pl.setPath(emptyPath)
                }
                // Hide visually with multiple attempts
                if (pl.setOptions && typeof pl.setOptions === 'function') {
                  pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                  // Try multiple times
                  setTimeout(() => {
                    try {
                      pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                    } catch (e) {}
                  }, 0)
                  setTimeout(() => {
                    try {
                      pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                    } catch (e) {}
                  }, 10)
                }
                // Remove from map multiple times
                pl.setMap(null)
                if ('map' in pl) pl.map = null
                // Try again after micro-delays
                setTimeout(() => {
                  try {
                    pl.setMap(null)
                    if ('map' in pl) pl.map = null
                  } catch (e) {}
                }, 0)
                setTimeout(() => {
                  try {
                    pl.setMap(null)
                    if ('map' in pl) pl.map = null
                  } catch (e) {}
                }, 10)
              } catch (e) {
                console.warn(`[MapPanel] Error clearing persistent polyline ${idx}:`, e)
              }
            })
          }
        }
        
        // Clear immediately multiple times
        clearPersistentPolylines()
        setTimeout(() => clearPersistentPolylines(), 0)
        setTimeout(() => clearPersistentPolylines(), 10)
        setTimeout(() => clearPersistentPolylines(), 50)
        
        // Still center on the single point, but use setCenter/setZoom instead of fitBounds
        // fitBounds() can trigger canvas caching issues, so avoid it for single points
        if (path.length === 1 && _map) {
          this.waitingForIdle = true
          
          // Clear and force canvas refresh BEFORE moving map
          setTimeout(() => {
            clearPersistentPolylines()
            
            // Force immediate canvas refresh by triggering resize
            window.google.maps.event.trigger(_map, 'resize')
            
            // Wait for next frame to ensure canvas refresh
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                clearPersistentPolylines()
                
                // CRITICAL: For single point, avoid ANY zoom changes or animations
                // Zoom changes trigger aggressive canvas redraws that restore cached polylines
                const center = new window.google.maps.LatLng(path[0].lat, path[0].lng)
                
                // Add continuous clearing during map movement/animation
                // This prevents cached polylines from appearing during setCenter animations
                let animationClearingActive = true
                const clearDuringAnimation = () => {
                  if (animationClearingActive) {
                    clearPersistentPolylines()
                  }
                }
                
                // Clear continuously during bounds changes (map is moving/zooming)
                const boundsChangedListener = window.google.maps.event.addListener(_map, 'bounds_changed', clearDuringAnimation)
                
                // Also clear using requestAnimationFrame during animation - very aggressive
                let rafId = null
                const continuousClear = () => {
                  if (animationClearingActive) {
                    clearPersistentPolylines()
                    rafId = requestAnimationFrame(continuousClear)
                  }
                }
                rafId = requestAnimationFrame(continuousClear)
                
                // CRITICAL: Do NOT move the map at all when there's only 1 point
                // Map movement triggers canvas redraws that restore cached polylines
                // Just clear polylines and leave map where it is
                // Optionally, gently pan ONLY if center is very far away (but this might cause issues)
                
                // Stop continuous clearing immediately since we're not moving
                animationClearingActive = false
                if (rafId) {
                  cancelAnimationFrame(rafId)
                }
                window.google.maps.event.removeListener(boundsChangedListener)
                this.waitingForIdle = false
                
                // Clear one final time
                clearPersistentPolylines()
                
                // Force map refresh WITHOUT any movement to clear canvas cache
                window.google.maps.event.trigger(_map, 'resize')
                
                // Clear continuously for a bit after refresh
                setTimeout(() => {
                  clearPersistentPolylines()
                  setTimeout(() => clearPersistentPolylines(), 50)
                  setTimeout(() => clearPersistentPolylines(), 100)
                  setTimeout(() => clearPersistentPolylines(), 200)
                  setTimeout(() => clearPersistentPolylines(), 500)
                  // Keep polylines disabled for single point scenarios
                  console.log(`[MapPanel] Polylines remain disabled for single point scenario - map not moved to prevent canvas redraws`)
                }, 50)
              })
            })
          }, 100)
        }
        // Ensure any existing polyline is cleared immediately
        if (this.polyline) {
          try {
            if (this.polyline.getPath && typeof this.polyline.setPath === 'function') {
              const emptyPath = new window.google.maps.MVCArray([])
              this.polyline.setPath(emptyPath)
            }
            if (this.polyline.setOptions && typeof this.polyline.setOptions === 'function') {
              this.polyline.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
            }
            this.polyline.setMap(null)
            this.polyline = null
          } catch (e) {}
        }
        this.polylines = []
        _allPolylines = []
      } else if (this.clearPolylinesLock || this.polylinesDisabled) {
        // Don't create polyline if we're clearing or polylines are disabled
        console.log(`[MapPanel] ⛔ POLYLINE CREATION BLOCKED: clearPolylinesLock=${this.clearPolylinesLock}, polylinesDisabled=${this.polylinesDisabled}, path.length=${path.length}`)
      }
      
    },
    createPolylineAfterIdle(path) {
      // Final safety check - ensure old polyline is really gone
      if (this.polyline) {
        console.warn('[MapPanel] Final check: Old polyline still exists, clearing...')
        try {
          if (this.polyline.getPath && typeof this.polyline.setPath === 'function') {
            const emptyPath = new window.google.maps.MVCArray([])
            this.polyline.setPath(emptyPath)
          }
          if (this.polyline.setOptions && typeof this.polyline.setOptions === 'function') {
            this.polyline.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
          }
          this.polyline.setMap(null)
        } catch (e) {}
        this.polyline = null
      }
      
      // Now create the new polyline
      this.polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#10b981',
        strokeOpacity: 0.9,
        strokeWeight: 3
      })
      this.polyline.setMap(_map)
      
      // IMMEDIATELY verify it's attached
      const verifyMap = this.polyline.getMap()
      if (verifyMap === null) {
        console.error('[MapPanel] CRITICAL: New polyline is NOT attached to map immediately after setMap!')
      } else {
        console.log('[MapPanel] New polyline verified as attached to map')
      }
      this.polylines.push(this.polyline)
      // Register in module-level array for persistent tracking
      if (!_allPolylines.includes(this.polyline)) {
        _allPolylines.push(this.polyline)
      }
      // CRITICAL: Add to PERSISTENT tracking array - NEVER cleared
      if (!_persistentPolylines.includes(this.polyline)) {
        _persistentPolylines.push(this.polyline)
        console.log(`[MapPanel] Added to persistent array. Total polylines ever created: ${_persistentPolylines.length}`)
      }
      
      // Log polyline details
      const polylineInfo = {
        created: new Date().toISOString(),
        pathPoints: path.length,
        isAttached: this.polyline.getMap() !== null,
        strokeColor: this.polyline.get('strokeColor'),
        strokeOpacity: this.polyline.get('strokeOpacity'),
        strokeWeight: this.polyline.get('strokeWeight'),
        polyline: this.polyline,
        path: path.map(p => ({ lat: p.lat, lng: p.lng }))
      }
      console.log(`[MapPanel] 🟢 POLYLINE CREATED:`, polylineInfo)
      console.log(`[MapPanel] Current polyline refs: this.polyline=${!!this.polyline}, this.polylines.length=${this.polylines.length}, _allPolylines.length=${_allPolylines.length}`)
      console.log(`[MapPanel] FULL PATH:`, JSON.stringify(path, null, 2))
    },

    highlightEvent(eventId, opts = {}) {
      const shape = this.idToShape[eventId]
      if (!shape) return
      // ensure CSS for advanced marker pulse
      this.ensurePulseCSS && this.ensurePulseCSS()
      // emphasize circle
      shape.circle.setOptions({
        strokeColor: '#ef4444',
        fillColor: '#ef4444',
        strokeWeight: 3,
        zIndex: 2000
      })
      if (shape.content) {
        shape.content.classList.add('pulse-marker')
      }
      // pulse ring effect (dummy)
      this.pulse(eventId)
      if (opts.center) {
        _map.panTo(shape.position)
      }
    },

    clearHighlight(eventId) {
      const shape = this.idToShape[eventId]
      if (!shape) return
      shape.circle.setOptions({
        strokeColor: shape.color,
        fillColor: shape.color,
        strokeWeight: 2,
        zIndex: 999
      })
      if (shape.content) {
        shape.content.classList.remove('pulse-marker')
      }
      this.stopPulse(eventId)
    },

    pulse(eventId) {
      const shape = this.idToShape[eventId]
      if (!shape) return
      this.stopPulse(eventId)
      const basePos = shape.position
      let step = 0
      const makeRing = (radius, opacity) => new window.google.maps.Circle({
        map: _map,
        center: basePos,
        radius,
        strokeOpacity: 0,
        fillOpacity: opacity,
        fillColor: '#ef4444',
        zIndex: 2500
      })
      const ring = makeRing(30, 0.35)
      const timer = setInterval(() => {
        step += 1
        const r = 30 + step * 10
        const o = Math.max(0, 0.35 - step * 0.06)
        ring.setRadius(r)
        ring.setOptions({ fillOpacity: o })
        if (step > 6) {
          ring.setMap(null)
          clearInterval(timer)
          delete this.pulseTimers[eventId]
        }
      }, 80)
      this.pulseTimers[eventId] = { ring, timer }
    },

    stopPulse(eventId) {
      const t = this.pulseTimers[eventId]
      if (!t) return
      clearInterval(t.timer)
      t.ring && t.ring.setMap(null)
      delete this.pulseTimers[eventId]
    },
    ensurePulseCSS() {
      if (document.getElementById('map-pulse-style')) return
      const style = document.createElement('style')
      style.id = 'map-pulse-style'
      style.textContent = `@keyframes mapPulseScale{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,0.45)}50%{transform:scale(1.15);box-shadow:0 0 0 10px rgba(239,68,68,0.15)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,0)}}.pulse-marker{animation:mapPulseScale .9s ease-in-out 0s 3;}`
      document.head.appendChild(style)
    },
    listPolylines() {
      if (!_map || !window.google?.maps) {
        console.warn('[MapPanel] Map not available for listing polylines')
        return
      }
      
      const allPolylines = new Set()
      
      // Collect from all sources
      if (this.polyline) allPolylines.add(this.polyline)
      if (this.polylines && this.polylines.length > 0) {
        this.polylines.forEach(pl => { if (pl) allPolylines.add(pl) })
      }
      _allPolylines.forEach(pl => { if (pl) allPolylines.add(pl) })
      
      console.log(`[MapPanel] 📋 POLYLINE LIST: Found ${allPolylines.size} polylines`)
      console.log(`[MapPanel] State: this.polyline=${!!this.polyline}, this.polylines.length=${this.polylines?.length || 0}, _allPolylines.length=${_allPolylines.length}`)
      
      const polylineDetails = Array.from(allPolylines).map((pl, idx) => {
        try {
          const map = pl.getMap ? pl.getMap() : null
          const path = pl.getPath ? pl.getPath() : null
          const pathArray = path && path.getArray ? path.getArray() : []
          
          const details = {
            index: idx,
            isAttached: map !== null && map !== undefined,
            map: map ? 'attached' : 'null',
            pathPoints: pathArray.length,
            strokeColor: pl.get && pl.get('strokeColor') ? pl.get('strokeColor') : 'unknown',
            strokeOpacity: pl.get && pl.get('strokeOpacity') ? pl.get('strokeOpacity') : 'unknown',
            strokeWeight: pl.get && pl.get('strokeWeight') ? pl.get('strokeWeight') : 'unknown',
            visible: pl.get && pl.get('visible') !== undefined ? pl.get('visible') : 'unknown',
            path: pathArray.length > 0 ? pathArray.slice(0, 3).map(p => ({ lat: p.lat(), lng: p.lng() })) : [],
            polyline: pl,
            inThisPolyline: pl === this.polyline,
            inThisPolylines: this.polylines?.includes(pl) || false,
            inModuleArray: _allPolylines.includes(pl)
          }
          return details
        } catch (e) {
          return {
            index: idx,
            error: e.message,
            polyline: pl
          }
        }
      })
      
      console.table(polylineDetails)
      console.log(`[MapPanel] Full polyline objects:`, Array.from(allPolylines))
      
      return polylineDetails
    },
    getPersistentPolylines() {
      console.log(`[MapPanel] 🔍 PERSISTENT POLYLINES TRACKER:`)
      console.log(`[MapPanel] Total polylines EVER created (never cleared): ${_persistentPolylines.length}`)
      
      const persistentDetails = _persistentPolylines.map((pl, idx) => {
        try {
          const map = pl.getMap ? pl.getMap() : null
          const path = pl.getPath ? pl.getPath() : null
          const pathArray = path && path.getArray ? path.getArray() : []
          
          return {
            index: idx,
            isAttached: map !== null && map !== undefined,
            map: map ? 'ATTACHED (should be removed!)' : 'null (detached)',
            pathPoints: pathArray.length,
            strokeColor: pl.get && pl.get('strokeColor') ? pl.get('strokeColor') : 'unknown',
            strokeOpacity: pl.get && pl.get('strokeOpacity') ? pl.get('strokeOpacity') : 'unknown',
            strokeWeight: pl.get && pl.get('strokeWeight') ? pl.get('strokeWeight') : 'unknown',
            visible: pl.get && pl.get('visible') !== undefined ? pl.get('visible') : 'unknown',
            path: pathArray.length > 0 ? pathArray.slice(0, 3).map(p => ({ lat: p.lat(), lng: p.lng() })) : [],
            polyline: pl,
            inThisPolyline: pl === this.polyline,
            inThisPolylines: this.polylines?.includes(pl) || false,
            inModuleArray: _allPolylines.includes(pl)
          }
        } catch (e) {
          return {
            index: idx,
            error: e.message,
            polyline: pl
          }
        }
      })
      
      console.table(persistentDetails)
      console.log(`[MapPanel] Full persistent polyline objects (NEVER cleared):`, _persistentPolylines)
      
      // Check for any that are still attached
      const stillAttached = _persistentPolylines.filter(pl => {
        try {
          return pl.getMap && pl.getMap() !== null
        } catch (e) {
          return false
        }
      })
      
      if (stillAttached.length > 0) {
        console.error(`[MapPanel] ⚠️ WARNING: ${stillAttached.length} polylines in persistent array are STILL ATTACHED to map!`)
        console.error(`[MapPanel] These should have been removed but weren't:`, stillAttached)
      }
      
      return {
        total: _persistentPolylines.length,
        stillAttached: stillAttached.length,
        details: persistentDetails,
        polylines: _persistentPolylines
      }
    },
    clearPolylines() {
      if (!_map || !window.google?.maps) {
        console.warn('[MapPanel] Map not available for clearing polylines')
        return
      }
      
      // Set lock IMMEDIATELY to prevent any watcher triggers
      this.clearPolylinesLock = true
      this.polylinesDisabled = true // Prevent new polylines from being created
      const wasRebuilding = this.isRebuilding
      this.isRebuilding = true
      
      // CRITICAL: Wait for Vue's reactivity to settle AND any pending renderRoute() calls to complete
      // This ensures we catch any polylines created by recent renderRoute() calls
      this.$nextTick(() => {
        // Add a small delay to ensure renderRoute() has fully completed if it was running
        setTimeout(() => {
          this.performPolylineClear(wasRebuilding)
        }, 50)
      })
    },
    performPolylineClear(wasRebuilding) {
      // CRITICAL: Get FRESH references right now, as they might have changed
      // Use a fresh snapshot to ensure we're clearing the CURRENT polylines
      const currentPolyline = this.polyline
      const currentPolylines = this.polylines ? [...this.polylines] : []
      const currentModulePolylines = [..._allPolylines]
      
      // Function to aggressively clear a polyline - returns true if actually cleared
      const forceClearPolyline = (pl) => {
        if (!pl) return false
        let wasAttached = false
        try {
          // First check if it's actually attached
          if (pl.getMap && typeof pl.getMap === 'function') {
            const attachedMap = pl.getMap()
            if (attachedMap !== null && attachedMap !== undefined) {
              wasAttached = true
              
              // NEW APPROACH: Try to hide it first by setting opacity to 0
              // This ensures it's visually gone even if removal has issues
              try {
                if (pl.setOptions && typeof pl.setOptions === 'function') {
                  pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
                }
                if ('strokeOpacity' in pl) {
                  pl.strokeOpacity = 0
                  pl.strokeWeight = 0
                }
              } catch (e) {
                console.warn('[MapPanel] Could not set polyline opacity:', e)
              }
              
              // Then remove it from map
              if (typeof pl.setMap === 'function') {
                pl.setMap(null)
              }
              // Verify it's gone
              const stillAttached = pl.getMap()
              if (stillAttached !== null) {
                // Still attached - try direct property
                if ('map' in pl) {
                  pl.map = null
                }
                // Try again
                if (pl.getMap() !== null && typeof pl.setMap === 'function') {
                  pl.setMap(null)
                }
              }
            }
          }
          // Also try direct property access even if getMap doesn't work
          if ('map' in pl && pl.map !== null && pl.map !== undefined) {
            wasAttached = true
            // Try to hide it
            try {
              if (pl.setOptions && typeof pl.setOptions === 'function') {
                pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
              }
            } catch (e) {}
            try {
              pl.map = null
            } catch (e) {}
          }
        } catch (e) {
          console.warn('[MapPanel] Error in forceClearPolyline:', e)
        }
        return wasAttached
      }
      
      // Collect ALL polylines from multiple sources using FRESH snapshots
      const allPolylines = new Set()
      
      // Add main polyline (from fresh snapshot)
      if (currentPolyline) {
        allPolylines.add(currentPolyline)
      }
      
      // Add all from component array (from fresh snapshot)
      currentPolylines.forEach(pl => {
        if (pl) allPolylines.add(pl)
      })
      
      // IMPORTANT: Add ALL polylines from module-level registry (from fresh snapshot)
      // This catches any polylines that might have been created but lost reference
      currentModulePolylines.forEach(pl => {
        if (pl) allPolylines.add(pl)
      })
      
      // CRITICAL: Check CURRENT reactive state RIGHT NOW (not snapshot) 
      // in case renderRoute created a new polyline between snapshot and now
      // This is the MOST IMPORTANT check - get the absolutely latest state
      const absolutelyCurrentPolyline = this.polyline
      const absolutelyCurrentPolylines = this.polylines || []
      const absolutelyCurrentModulePolylines = [..._allPolylines]
      
      if (absolutelyCurrentPolyline && !allPolylines.has(absolutelyCurrentPolyline)) {
        console.log('[MapPanel] CRITICAL: Found current polyline not in initial collection!', absolutelyCurrentPolyline)
        allPolylines.add(absolutelyCurrentPolyline)
      }
      absolutelyCurrentPolylines.forEach(pl => {
        if (pl && !allPolylines.has(pl)) {
          console.log('[MapPanel] CRITICAL: Found current polyline in array not in collection!', pl)
          allPolylines.add(pl)
        }
      })
      absolutelyCurrentModulePolylines.forEach(pl => {
        if (pl && !allPolylines.has(pl)) {
          console.log('[MapPanel] CRITICAL: Found polyline in module array not in collection!', pl)
          allPolylines.add(pl)
        }
      })
      
      // ONE MORE CHECK: Get the absolute latest state RIGHT NOW before clearing
      // This catches any polyline that was created in the last microsecond
      const absoluteLatestPolyline = this.polyline
      const absoluteLatestPolylines = this.polylines || []
      const absoluteLatestModule = [..._allPolylines]
      
      if (absoluteLatestPolyline && !allPolylines.has(absoluteLatestPolyline)) {
        console.log('[MapPanel] LAST CHANCE: Found absolute latest polyline!', absoluteLatestPolyline)
        allPolylines.add(absoluteLatestPolyline)
      }
      absoluteLatestPolylines.forEach(pl => {
        if (pl && !allPolylines.has(pl)) {
          console.log('[MapPanel] LAST CHANCE: Found absolute latest polyline in array!', pl)
          allPolylines.add(pl)
        }
      })
      absoluteLatestModule.forEach(pl => {
        if (pl && !allPolylines.has(pl)) {
          console.log('[MapPanel] LAST CHANCE: Found absolute latest polyline in module!', pl)
          allPolylines.add(pl)
        }
      })
      
      // Clear all collected polylines
      console.log(`[MapPanel] Found ${allPolylines.size} polylines to clear (after ALL checks including last chance)`)
      let clearedCount = 0
      allPolylines.forEach(pl => {
        // Check if polyline is actually on the map before clearing
        try {
          const attachedMap = pl.getMap ? pl.getMap() : null
          if (attachedMap !== null) {
            console.log('[MapPanel] Clearing polyline that is attached to map')
            
            // FIRST: Hide it visually by setting opacity to 0 (instant visual removal)
            try {
              if (pl.setOptions && typeof pl.setOptions === 'function') {
                pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
              }
            } catch (e) {
              console.warn('[MapPanel] Could not hide polyline via opacity:', e)
            }
            
            // THEN: Actually remove it from map
            forceClearPolyline(pl)
            clearedCount++
            
            // Immediately check if it's still attached
            const stillAttached = pl.getMap ? pl.getMap() : null
            if (stillAttached !== null) {
              console.warn('[MapPanel] Polyline still attached after clearing! Attempting aggressive removal')
              // Force hide again
              try {
                if (pl.setOptions && typeof pl.setOptions === 'function') {
                  pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                }
              } catch(e) {}
              // Try multiple methods aggressively
              try { pl.setMap(null) } catch(e) {}
              try { if ('map' in pl) pl.map = null } catch(e) {}
              // Force remove by getting the map and calling setMap
              try {
                const currentMap = pl.getMap()
                if (currentMap) {
                  pl.setMap(null)
                  // Sometimes need to do it twice
                  setTimeout(() => {
                    if (pl.getMap && pl.getMap() !== null) {
                      console.warn('[MapPanel] Polyline STILL attached after aggressive clear!')
                      // Hide it again
                      try {
                        if (pl.setOptions && typeof pl.setOptions === 'function') {
                          pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                        }
                      } catch(e) {}
                      pl.setMap(null)
                    }
                  }, 5)
                }
              } catch(e) {
                console.warn('[MapPanel] Error in aggressive removal:', e)
              }
            } else {
              console.log('[MapPanel] Polyline successfully removed from map')
            }
          } else {
            console.log('[MapPanel] Polyline was already detached, skipping')
          }
        } catch (e) {
          console.warn('[MapPanel] Error checking polyline attachment:', e)
          // Try to hide it anyway
          try {
            if (pl.setOptions && typeof pl.setOptions === 'function') {
              pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
            }
          } catch(e2) {}
          forceClearPolyline(pl)
          clearedCount++
        }
      })
      console.log(`[MapPanel] Attempted to clear ${clearedCount} polylines`)
      
      // Also clear the module-level registry
      _allPolylines = []
      
      // Also clear any polylines that might be in clearAll's path
      // (in case renderRoute was called and created new ones)
      this.polylines = []
      this.polyline = null
      
      // Now wait a moment and check again - sometimes renderRoute creates new ones
      setTimeout(() => {
        // Check ALL sources again for any polylines that might have been recreated
        const recheckSet = new Set()
        
        if (this.polyline) recheckSet.add(this.polyline)
        if (this.polylines && this.polylines.length > 0) {
          this.polylines.forEach(pl => { if (pl) recheckSet.add(pl) })
        }
        _allPolylines.forEach(pl => { if (pl) recheckSet.add(pl) })
        
        if (recheckSet.size > 0) {
          console.log(`[MapPanel] Found ${recheckSet.size} polylines after initial clear, removing them`)
          recheckSet.forEach(pl => {
            forceClearPolyline(pl)
            // Also try to hide by opacity as backup
            try {
              if (pl.setOptions && typeof pl.setOptions === 'function') {
                pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
              }
            } catch (e) {}
          })
          this.polyline = null
          this.polylines = []
          _allPolylines = []
        }
        
        // Keep lock active for a bit longer to prevent recreation
        setTimeout(() => {
          // Final check one more time
          const finalCheck = new Set()
          if (this.polyline) finalCheck.add(this.polyline)
          if (this.polylines && this.polylines.length > 0) {
            this.polylines.forEach(pl => { if (pl) finalCheck.add(pl) })
          }
          _allPolylines.forEach(pl => { if (pl) finalCheck.add(pl) })
          
          if (finalCheck.size > 0) {
            console.warn(`[MapPanel] Still found ${finalCheck.size} polylines in final check, force clearing`)
            finalCheck.forEach(pl => {
              try {
                // Hide first
                if (pl.setOptions && typeof pl.setOptions === 'function') {
                  pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
                }
                // Then remove
                if (pl.getMap && pl.getMap() !== null) {
                  pl.setMap(null)
                }
              } catch (e) {}
            })
            this.polyline = null
            this.polylines = []
            _allPolylines = []
          }
          
          // One final verification - check if ANY polylines exist AND are visible
          const finalPolylineCheck = []
          if (this.polyline) finalPolylineCheck.push({ ref: 'this.polyline', pl: this.polyline })
          if (this.polylines && this.polylines.length > 0) {
            this.polylines.forEach((pl, idx) => {
              finalPolylineCheck.push({ ref: `this.polylines[${idx}]`, pl })
            })
          }
          _allPolylines.forEach((pl, idx) => {
            finalPolylineCheck.push({ ref: `_allPolylines[${idx}]`, pl })
          })
          
          // Check which ones are still attached AND actually visible
          const stillAttached = finalPolylineCheck.filter(({ pl }) => {
            try {
              if (!pl) return false
              const map = pl.getMap ? pl.getMap() : null
              return map !== null && map !== undefined
            } catch (e) {
              return false
            }
          })
          
          if (stillAttached.length > 0) {
            console.error(`[MapPanel] ERROR: ${stillAttached.length} polylines still attached after clearing!`, stillAttached.map(s => s.ref))
            // Force clear them one more time - MULTIPLE attempts
            stillAttached.forEach(({ pl }) => {
              try {
                // First hide it by opacity
                if (pl.setOptions && typeof pl.setOptions === 'function') {
                  pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
                }
                // Try multiple times with different methods
                for (let i = 0; i < 3; i++) {
                  if (pl.getMap && pl.getMap() !== null) {
                    pl.setMap(null)
                    if ('map' in pl) pl.map = null
                  } else {
                    break
                  }
                }
                // Final check
                if (pl.getMap && pl.getMap() !== null) {
                  console.error('[MapPanel] CRITICAL: Polyline STILL cannot be removed after multiple attempts!', pl)
                  // Force hide it even if we can't remove it
                  try {
                    if (pl.setOptions && typeof pl.setOptions === 'function') {
                      pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                    }
                  } catch (e) {}
                  // Try to get the path and manually remove if possible
                  try {
                    const path = pl.getPath ? pl.getPath() : null
                    if (path) {
                      console.error('[MapPanel] Polyline path:', path.getArray())
                    }
                  } catch (e) {}
                }
              } catch (e) {
                console.error('[MapPanel] Error in final clear attempt:', e)
              }
            })
          }
          
          // ABSOLUTE FINAL CHECK: Right before releasing lock, get the absolute latest state
          // and clear ANY polyline that exists
          const absoluteFinalCheck = new Set()
          if (this.polyline) absoluteFinalCheck.add(this.polyline)
          if (this.polylines) this.polylines.forEach(pl => { if (pl) absoluteFinalCheck.add(pl) })
          _allPolylines.forEach(pl => { if (pl) absoluteFinalCheck.add(pl) })
          
          absoluteFinalCheck.forEach(pl => {
            try {
              const map = pl.getMap ? pl.getMap() : null
              if (map !== null && map !== undefined) {
                console.error('[MapPanel] ABSOLUTE FINAL: Found polyline still attached!', pl)
                // Hide it first
                try {
                  if (pl.setOptions && typeof pl.setOptions === 'function') {
                    pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                  }
                } catch (e) {}
                // Then remove
                pl.setMap(null)
                if ('map' in pl) pl.map = null
                // Try one more time
                setTimeout(() => {
                  if (pl.getMap && pl.getMap() !== null) {
                    console.error('[MapPanel] ABSOLUTE FINAL: Polyline STILL attached after second attempt!')
                    // Hide it again
                    try {
                      if (pl.setOptions && typeof pl.setOptions === 'function') {
                        pl.setOptions({ strokeOpacity: 0, strokeWeight: 0, visible: false })
                      }
                    } catch (e) {}
                    pl.setMap(null)
                  }
                }, 10)
              }
            } catch (e) {
              console.error('[MapPanel] Error in absolute final check:', e)
            }
          })
          
          // Clear all references one more time
          this.polyline = null
          this.polylines = []
          _allPolylines = []
          
          this.isRebuilding = wasRebuilding
          this.clearPolylinesLock = false
          console.log(`[MapPanel] All polylines cleared and lock released. Final check: ${stillAttached.length} still attached, absolute final found: ${absoluteFinalCheck.size}`)
          
          // CRITICAL: Try MULTIPLE methods to force Google Maps to refresh/redraw
          // Google Maps sometimes caches the visual representation even after objects are removed
          if (_map) {
            try {
              // Method 1: panBy with zero movement
              const center = _map.getCenter()
              if (center) {
                _map.panBy(0, 0)
              }
              
              // Method 2: Force a zoom level change (tiny, invisible)
              const zoom = _map.getZoom()
              _map.setZoom(zoom + 0.0001)
              setTimeout(() => {
                _map.setZoom(zoom)
              }, 10)
              
              // Method 3: Trigger a map refresh event
              window.google.maps.event.trigger(_map, 'resize')
              
              console.log('[MapPanel] Forced map redraw with multiple methods to clear visual cache')
            } catch (e) {
              console.warn('[MapPanel] Could not force map redraw:', e)
            }
          }
          
          // CRITICAL: After releasing lock, the watcher might immediately fire and create a new polyline
          // But polylinesDisabled should prevent this - let's verify
          // Check multiple times to catch any recreation attempts
          const checkInterval = setInterval(() => {
            const quickCheck = []
            if (this.polyline && this.polyline.getMap && this.polyline.getMap() !== null) {
              quickCheck.push(this.polyline)
            }
            if (this.polylines && this.polylines.length > 0) {
              this.polylines.forEach(pl => {
                if (pl && pl.getMap && pl.getMap() !== null) {
                  quickCheck.push(pl)
                }
              })
            }
            
            if (quickCheck.length > 0) {
              console.warn(`[MapPanel] Polyline recreated! polylinesDisabled=${this.polylinesDisabled}. Clearing ${quickCheck.length} new polylines`)
              quickCheck.forEach(pl => {
                try {
                  // Hide it first
                  if (pl.setOptions && typeof pl.setOptions === 'function') {
                    pl.setOptions({ strokeOpacity: 0, strokeWeight: 0 })
                  }
                  // Then remove
                  if (pl.setMap) pl.setMap(null)
                  if ('map' in pl) pl.map = null
                } catch (e) {}
              })
              this.polyline = null
              this.polylines = []
              _allPolylines = []
            }
          }, 100)
          
          // Stop checking after 1 second
          setTimeout(() => {
            clearInterval(checkInterval)
          }, 1000)
        }, 100)
      }, 200)
      
      console.log('[MapPanel] Clearing polylines...')
    },
    enablePolylines() {
      this.polylinesDisabled = false
      
      // AGGRESSIVE: Clear ANY lingering polylines before re-enabling
      if (this.polyline) {
        console.log('[MapPanel] enablePolylines: Removing lingering this.polyline')
        try {
          this.polyline.setMap(null)
          this.polyline = null
        } catch (e) {
          console.warn('[MapPanel] Error removing polyline in enablePolylines:', e)
        }
      }
      if (this.polylines && this.polylines.length > 0) {
        console.log(`[MapPanel] enablePolylines: Removing ${this.polylines.length} lingering polylines in array`)
        this.polylines.forEach(pl => {
          try {
            if (pl.setMap) pl.setMap(null)
          } catch (e) {}
        })
        this.polylines = []
      }
      _allPolylines = []
      
      // Trigger a re-render to create polylines if there are points
      if (this.points && this.points.length > 0) {
        this.$nextTick(() => {
          this.renderRoute()
        })
      }
      console.log('[MapPanel] Polylines re-enabled')
    }
  }
}
</script>

<style scoped>
.map-panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--spacing-md); display: flex; flex-direction: column; height: 100%; }
.gmap { flex: 1; min-height: 280px; border-radius: var(--radius-sm); overflow: hidden; }
.map-fallback { display:flex; align-items:center; gap:8px; color: var(--text-secondary); padding-top: 8px; }
</style>


