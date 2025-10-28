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
    return { map: null, markers: [], polyline: null, loadError: false }
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => this.createMap()
      script.onerror = () => { this.loadError = true }
      document.head.appendChild(script)
    },

    createMap() {
      const center = this.points.length ? { lat: this.points[0].coords[0], lng: this.points[0].coords[1] } : { lat: 48.8566, lng: 2.3522 }
      this.map = new window.google.maps.Map(this.$refs.mapEl, {
        center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      })
      this.renderRoute()
    },

    renderRoute() {
      if (!this.map || !window.google?.maps) return
      // clear old
      this.markers.forEach(m => m.setMap(null))
      this.markers = []
      if (this.polyline) { this.polyline.setMap(null); this.polyline = null }

      const path = []
      this.points.forEach((p, idx) => {
        const pos = { lat: p.coords[0], lng: p.coords[1] }
        path.push(pos)
        const marker = new window.google.maps.Marker({
          position: pos,
          map: this.map,
          label: String(idx + 1),
          title: p.title
        })
        this.markers.push(marker)
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


