<template>
  <div class="layer-row">
    <div class="label">{{ layer.name }}</div>
    <div class="track">
      <EventBlock v-for="ev in layer.events" :key="ev.id" :event="ev" :hours="hours" @update-time="onUpdateTime" @click.native="$emit('select', ev)" />
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
.track { position: relative; height: 52px; background: var(--bg-primary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); overflow: hidden; }
</style>


