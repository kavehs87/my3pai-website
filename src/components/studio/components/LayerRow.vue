<template>
  <div class="layer-row">
    <div class="label">{{ layer.name }}</div>
    <div class="track">
      <EventBlock
        v-for="ev in layer.events"
        :key="ev.id"
        :event="ev"
        :hours="hours"
        :colorFill="layerColor(layer.id).fill"
        :colorStroke="layerColor(layer.id).stroke"
        :issue="issuesMap[ev.id]"
        @update-time="onUpdateTime"
        @attach-file="onAttachFile"
        @hover-event="onHover"
        @unhover-event="onUnhover"
        @focus-event="onFocus"
        @click.native="$emit('select', ev)"
      />
    </div>
    <div class="layer-warnings" v-if="warnings.length">
      <div v-for="(w, i) in warnings" :key="i" class="warning-chip" :class="{ danger: w.type === 'overlap' }">
        <i class="fas" :class="w.type === 'overlap' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'"></i>
        <span>{{ w.message }}</span>
      </div>
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
    },
    onAttachFile({ eventId, attachment }) {
      // emit upward so Studio can centralize attachments
      this.$emit('attach-file', { layerId: this.layer.id, eventId, attachment })
    },
    onHover({ eventId }) { this.$emit('hover-event', { eventId }) },
    onUnhover({ eventId }) { this.$emit('unhover-event', { eventId }) },
    onFocus({ eventId }) { this.$emit('focus-event', { eventId }) },
    toMin(t) { const [h,m] = t.split(':').map(Number); return h*60+m },
    computeIssues() {
      const events = (this.layer.events || []).slice().sort((a,b)=> this.toMin(a.start)-this.toMin(b.start))
      const issuesMap = {}
      const warnings = []
      const minTransfer = 30 // minutes - dummy threshold
      for (let i=0;i<events.length;i++) {
        const a = events[i]
        const aStart = this.toMin(a.start)
        const aEnd = this.toMin(a.end)
        // overlap with previous
        if (i>0) {
          const prev = events[i-1]
          const prevEnd = this.toMin(prev.end)
          if (aStart < prevEnd) {
            issuesMap[a.id] = { type: 'overlap', message: 'Overlaps with previous event' }
            issuesMap[prev.id] = issuesMap[prev.id] || { type: 'overlap', message: 'Overlaps with next event' }
            warnings.push({ type: 'overlap', message: `${a.title} overlaps with ${prev.title}` })
          } else if (aStart - prevEnd < minTransfer) {
            const gap = aStart - prevEnd
            issuesMap[a.id] = issuesMap[a.id] || { type: 'too-close', message: `Only ${gap} min gap` }
            warnings.push({ type: 'too-close', message: `${a.title} starts ${gap} min after ${prev.title}. Consider at least ${minTransfer} min.` })
          }
        }
      }
      this.issuesMap = issuesMap
      this.warnings = warnings
    }
  },
  data() {
    return { issuesMap: {}, warnings: [] }
  },
  watch: {
    layer: { handler() { this.computeIssues() }, deep: true }
  },
  mounted() { this.computeIssues() }
}
</script>

<style scoped>
.layer-row { display: grid; grid-template-columns: 180px 1fr; gap: 8px; align-items: center; }
.label { color: var(--text-secondary); font-weight: 600; }
.track { position: relative; height: 52px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); overflow: hidden; }
.layer-warnings { grid-column: 2 / 3; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.warning-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px; font-size: 12px; background: rgba(245,158,11,0.12); color: #b45309; border: 1px solid rgba(245,158,11,0.25); }
.warning-chip.danger { background: rgba(239,68,68,0.12); color: #b91c1c; border-color: rgba(239,68,68,0.25); }
</style>


