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
export default {
  name: 'MapPanel',
  props: { layers: Array },
  data() {
    return { map: null, markers: [], circles: [], polyline: null, loadError: false, mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null, useAdvanced: (import.meta.env.VITE_USE_ADVANCED_MARKERS === 'true'), idToShape: {}, pulseTimers: {} }
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
        this.renderRoute()
      },
      deep: true
    }
  },
  methods: {
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
        // Diagnostics for proxy/reactivity and capabilities
        try {
          // Vue proxies often report true with isProxy if stored in reactive state
          console.log('[DBG] map created; isProxy:', isProxy && isProxy(_map), 'ctor:', _map && _map.constructor && _map.constructor.name)
          // @ts-ignore - capabilities present on vector maps
          const caps = _map && _map.mapCapabilities
          console.log('[DBG] capabilities:', caps)
          console.log('[DBG] has AdvancedMarkerElement:', !!window.google?.maps?.marker?.AdvancedMarkerElement)
        } catch (e) {}
        console.log('[MapPanel] Map created. mapId:', this.mapId, 'useAdvanced:', this.useAdvanced, 'AdvancedMarkerElement:', !!this.AdvancedMarkerElement)
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
      // clear old
      this.markers.forEach(m => {
        if (m && typeof m.setMap === 'function') {
          m.setMap(null)
        } else if (m && 'map' in m) {
          // AdvancedMarkerElement uses .map property instead of setMap
          try { m.map = null } catch (e) {}
        }
      })
      this.markers = []
      this.circles?.forEach(c => c.setMap && c.setMap(null))
      this.circles = []
      // stop any active pulse rings
      Object.keys(this.pulseTimers || {}).forEach(id => this.stopPulse(id))
      this.idToShape = {}
      if (this.polyline) { this.polyline.setMap(null); this.polyline = null }

      const path = []
      console.log('[MapPanel] renderRoute points:', this.points.length, this.points)
      this.points.forEach((p, idx) => {
        const pos = { lat: p.coords[0], lng: p.coords[1] }
        console.log('[MapPanel] Point', idx + 1, 'pos:', pos, 'title:', p.title)
        path.push(pos)
        // Advanced markers if available; otherwise fall back to classic Marker
        const canUseAdvanced = !!this.AdvancedMarkerElement
        console.log('[MapPanel] canUseAdvanced:', canUseAdvanced, 'Creating marker at', pos)
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
          console.log('[MapPanel] Content element created:', content)
          try {
            const adv = new this.AdvancedMarkerElement({ 
              map: _map, 
              position: pos, 
              title: p.name, 
              content,
              zIndex: 1000
            })
            console.log('[MapPanel] AdvancedMarker created:', adv, 'position:', adv.position)
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
            console.log('[MapPanel] Backup circle added for AdvancedMarker')
          } catch (err) {
            console.error('[MapPanel] AdvancedMarker creation failed:', err)
          }
        } else {
          console.log('[MapPanel] Creating classic Marker at', pos)
          const marker = new window.google.maps.Marker({
            position: pos,
            map: _map,
            title: p.name,
            label: { text: String(idx + 1), color: '#ffffff', fontWeight: '700' },
            // Use default pin to guarantee visibility across styles
            zIndex: 1000
          })
          console.log('[MapPanel] Classic Marker created:', marker)
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
          console.log('[MapPanel] Circle overlay created:', circle)
          this.circles.push(circle)
          this.idToShape[p.id] = { marker, circle, color: this.layerColors[p.layer]?.fill || '#10b981', position: pos }
        }
      })
      if (path.length) {
        this.polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#10b981',
          strokeOpacity: 0.9,
          strokeWeight: 3
        })
        this.polyline.setMap(_map)
        const bounds = new window.google.maps.LatLngBounds()
        path.forEach(pt => bounds.extend(pt))
        _map.fitBounds(bounds, 50)
      }
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
    }
  }
}
</script>

<style scoped>
.map-panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--spacing-md); display: flex; flex-direction: column; height: 100%; }
.gmap { flex: 1; min-height: 280px; border-radius: var(--radius-sm); overflow: hidden; }
.map-fallback { display:flex; align-items:center; gap:8px; color: var(--text-secondary); padding-top: 8px; }
</style>


