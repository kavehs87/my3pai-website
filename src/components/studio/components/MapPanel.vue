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
export default {
  name: 'MapPanel',
  props: { layers: Array },
  data() {
    return { map: null, markers: [], circles: [], polyline: null, loadError: false, mapId: import.meta.env.VITE_GOOGLE_MAP_ID || null }
  },
  computed: {
    points() {
      const events = this.layers.flatMap(l => (l.events || []).map(e => ({ ...e, layer: l.id })))
      return events.sort((a, b) => a.start.localeCompare(b.start))
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
        this.map = new window.google.maps.Map(this.$refs.mapEl, options)
        // detect advanced markers (requires vector map w/ mapId)
        this.AdvancedMarkerElement = this.mapId ? (window.google?.maps?.marker?.AdvancedMarkerElement || null) : null
        console.log('[MapPanel] Map created. mapId:', this.mapId, 'AdvancedMarkerElement:', !!this.AdvancedMarkerElement)
        this.renderRoute()
      } catch (e) {
        console.error('Google Maps init failed', e)
        this.loadError = true
      }
    },

    renderRoute() {
      if (!this.map || !window.google?.maps) return
      // clear old
      this.markers.forEach(m => m.setMap(null))
      this.markers = []
      this.circles?.forEach(c => c.setMap && c.setMap(null))
      this.circles = []
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
          content.style.display = 'flex'
          content.style.alignItems = 'center'
          content.style.justifyContent = 'center'
          content.style.width = '28px'
          content.style.height = '28px'
          content.style.borderRadius = '6px'
          content.style.background = '#10b981'
          content.style.color = '#fff'
          content.style.fontSize = '12px'
          content.style.fontWeight = '700'
          content.textContent = String(idx + 1)
          const adv = new this.AdvancedMarkerElement({ map: this.map, position: pos, title: p.title, content })
          this.markers.push(adv)
        } else {
          const marker = new window.google.maps.Marker({
            position: pos,
            map: this.map,
            title: p.title,
            label: { text: String(idx + 1), color: '#ffffff', fontWeight: '700' },
            // Use default pin to guarantee visibility across styles
            zIndex: 1000
          })
          this.markers.push(marker)
          // Add a small circle to ensure visibility regardless of style
          const circle = new window.google.maps.Circle({
            strokeColor: '#0e7a5a',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            fillColor: '#10b981',
            fillOpacity: 0.8,
            map: this.map,
            center: pos,
            radius: 35
          })
          this.circles.push(circle)
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
        this.polyline.setMap(this.map)
        const bounds = new window.google.maps.LatLngBounds()
        path.forEach(pt => bounds.extend(pt))
        this.map.fitBounds(bounds, 50)
      }
    }
  }
}
</script>

<style scoped>
.map-panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--spacing-md); }
.gmap { height: 300px; border-radius: var(--radius-sm); overflow: hidden; }
.map-fallback { display:flex; align-items:center; gap:8px; color: var(--text-secondary); padding-top: 8px; }
</style>


