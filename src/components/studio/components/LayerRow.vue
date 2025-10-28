<template>
  <div class="layer-row">
    <div class="label">{{ layer.name }}</div>
    <div class="track">
      <EventBlock v-for="ev in layer.events" :key="ev.id" :event="ev" :hours="hours" :colorFill="layerColor(layer.id).fill" :colorStroke="layerColor(layer.id).stroke" @update-time="onUpdateTime" @click.native="$emit('select', ev)" />
    </div>
  </div>
</template>

<script>
import EventBlock from './EventBlock.vue'
export default {
  name: 'LayerRow',
  components: { EventBlock },
  props: { layer: Object, hours: Object },
  methods: {
    layerColor(id) {
      // consistent color mapping per layer type
      const map = {
        accommodation: { fill: 'rgba(99,102,241,0.15)', stroke: '#6366f1' },
        activities: { fill: 'rgba(16,185,129,0.15)', stroke: '#10b981' },
        food: { fill: 'rgba(245,158,11,0.18)', stroke: '#f59e0b' },
        transport: { fill: 'rgba(59,130,246,0.15)', stroke: '#3b82f6' }
      }
      return map[id] || { fill: 'rgba(148,163,184,0.15)', stroke: '#94a3b8' }
    },
    onUpdateTime({ id, start, end }) {
      const idx = this.layer.events.findIndex(e => e.id === id)
      if (idx !== -1) {
        this.layer.events[idx].start = start
        this.layer.events[idx].end = end
      }
    }
  }
}
</script>

<style scoped>
.layer-row { display: grid; grid-template-columns: 180px 1fr; gap: 8px; align-items: center; }
.label { color: var(--text-secondary); font-weight: 600; }
.track { position: relative; height: 52px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); overflow: hidden; }
</style>


