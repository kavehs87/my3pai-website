<template>
  <div class="map-panel">
    <div class="map-placeholder">
      <i class="fas fa-map"></i>
      <span>Map Preview (mock)</span>
    </div>
    <div class="route">
      <div v-for="(l, idx) in points" :key="idx" class="route-point">
        <div class="dot"></div>
        <span class="label">{{ l.title }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapPanel',
  props: { layers: Array },
  computed: {
    points() {
      // Flatten events in chronological order for mock route list
      const events = this.layers.flatMap(l => l.events.map(e => ({ ...e, layer: l.id })))
      return events.sort((a, b) => a.start.localeCompare(b.start))
    }
  }
}
</script>

<style scoped>
.map-panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: var(--spacing-md); }
.map-placeholder { height: 220px; background: var(--bg-secondary); border-radius: var(--radius-sm); display:flex; align-items:center; justify-content:center; gap:8px; color: var(--text-secondary); }
.route { display:flex; flex-wrap: wrap; gap: 12px; padding-top: 10px; }
.route-point { display:flex; align-items:center; gap:6px; }
.dot { width:8px; height:8px; background: var(--secondary-color); border-radius:50%; }
.label { color: var(--text-primary); font-size: var(--font-size-sm); }
</style>


