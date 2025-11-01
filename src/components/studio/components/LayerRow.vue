<template>
  <div class="layer-row">
    <div class="label">
      <button class="visibility-toggle" type="button" @click="$emit('toggle-visibility', layer.id)" :title="isVisible ? 'Hide layer' : 'Show layer'">
        <i class="fas" :class="isVisible ? 'fa-eye' : 'fa-eye-slash'"></i>
      </button>
      <span :class="{ 'text-muted': !isVisible }">{{ layer.name }}</span>
    </div>
    <div v-show="isVisible" class="track" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" :class="{ 'drag-allowed': isDragAllowed, 'drag-disallowed': isDragDisallowed }">
      <EventBlock
        v-for="ev in layer.events"
        :key="ev.id"
        :event="ev"
        :hours="hours"
        :layerId="layer.id"
        :colorFill="layerColor(layer.id).fill"
        :colorStroke="layerColor(layer.id).stroke"
        :issue="issuesMap[ev.id]"
        @update-time="onUpdateTime"
        @hover-event="onHover"
        @unhover-event="onUnhover"
        @focus-event="onFocus"
        @open-options="onOpenOptions"
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
import { currentDragLayerId, clearDragLayerId } from './dragState.js'

export default {
  name: 'LayerRow',
  components: { EventBlock },
  props: {
    layer: Object,
    hours: Object,
    isVisible: { type: Boolean, default: true }
  },
  emits: ['select', 'attach-file', 'hover-event', 'unhover-event', 'focus-event', 'export-event', 'open-options', 'add-event', 'toggle-visibility'],
  computed: {
    currentDragLayerId() { return currentDragLayerId },
    isDragDisallowed() { return this.hasActiveDrag && !this.isDragAllowed && currentDragLayerId !== null && currentDragLayerId !== this.layer.id }
  },
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
    onAttachFile({ eventId, attachment }) { this.$emit('attach-file', { layerId: this.layer.id, eventId, attachment }) },
    onHover({ eventId }) { this.$emit('hover-event', { eventId }) },
    onUnhover({ eventId }) { this.$emit('unhover-event', { eventId }) },
    onFocus({ eventId }) { this.$emit('focus-event', { eventId }) },
    onExport({ eventId, provider }) { this.$emit('export-event', { layerId: this.layer.id, eventId, provider }) },
    onOpenOptions(payload) { this.$emit('open-options', payload) },
    onDragOver(e) {
      e.preventDefault()
      this.hasActiveDrag = true
      // Check if dragged item belongs to this layer
      if (currentDragLayerId === this.layer.id) {
        e.dataTransfer.dropEffect = 'copy'
        this.isDragAllowed = true
      } else {
        e.dataTransfer.dropEffect = 'none'
        this.isDragAllowed = false
      }
    },
    onDragLeave() {
      this.isDragAllowed = false
      this.hasActiveDrag = false
    },
    onDrop(e) {
      this.isDragAllowed = false
      this.hasActiveDrag = false
      clearDragLayerId()
      try {
        const data = e.dataTransfer.getData('application/json')
        if (!data) return
        const payload = JSON.parse(data)
        // Only allow drop if the item's category matches this layer
        if (payload.layerId !== this.layer.id) return
        const rect = e.currentTarget.getBoundingClientRect()
        const px = Math.min(Math.max(e.clientX - rect.left, 0), rect.width)
        const dayStartMin = this.toMin(this.hours.start)
        const dayEndMin = this.toMin(this.hours.end)
        const total = dayEndMin - dayStartMin
        const minFromStart = Math.round((px / rect.width) * total)
        const snap = 15
        const snapped = Math.round(minFromStart / snap) * snap
        const duration = Math.max(15, Math.min(payload.durationMin || 60, total))
        const startAbs = dayStartMin + Math.min(Math.max(snapped, 0), total - duration)
        const endAbs = startAbs + duration
        const toTime = (m)=> `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
        const eventPartial = { title: payload.title, start: toTime(startAbs), end: toTime(endAbs), coords: payload.coords, type: payload.type }
        this.$emit('add-event', { layerId: this.layer.id, event: eventPartial })
      } catch (err) {}
    },
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
    return { issuesMap: {}, warnings: [], isDragAllowed: false, hasActiveDrag: false }
  },
  watch: {
    layer: { handler() { this.computeIssues() }, deep: true }
  },
  mounted() { this.computeIssues() }
}
</script>

<style scoped>
.layer-row { display: grid; grid-template-columns: 180px 1fr; gap: 8px; align-items: center; }
.label { color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 8px; }
.visibility-toggle { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; }
.visibility-toggle:hover { background: var(--bg-secondary); color: var(--text-primary); }
.visibility-toggle i { font-size: 14px; }
.text-muted { opacity: 0.5; color: var(--text-tertiary); }
.track { position: relative; height: 52px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); overflow: visible; transition: background-color 0.15s, border-color 0.15s; }
.track.drag-allowed { background: rgba(16,185,129,0.1); border-color: #10b981; border-style: solid; }
.track.drag-disallowed { background: rgba(239,68,68,0.1); border-color: #ef4444; border-style: solid; position: relative; }
.track.drag-disallowed::after { content: '🚫'; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 20px; pointer-events: none; opacity: 0.8; }
.track.drag-allowed::after { content: '✓'; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #10b981; font-weight: bold; pointer-events: none; }
.layer-warnings { grid-column: 2 / 3; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.warning-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px; font-size: 12px; background: rgba(245,158,11,0.12); color: #b45309; border: 1px solid rgba(245,158,11,0.25); }
.warning-chip.danger { background: rgba(239,68,68,0.12); color: #b91c1c; border-color: rgba(239,68,68,0.25); }
</style>


