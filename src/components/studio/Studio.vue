<template>
  <div class="studio">
    <Header />
    <div class="studio-header">
      <div class="container">
        <InlinePromptBar @submit="handlePrompt" @pick-image="handlePickImage" @mic="handleMic" />
      </div>
    </div>

    <div class="studio-body">
      <div class="container">
        <!-- Day switcher -->
        <div class="days-toolbar">
          <div class="days-tabs">
            <button
              v-for="(d, idx) in days"
              :key="d.id || idx"
              class="day-tab"
              :class="{ active: idx === selectedDayIndex }"
              type="button"
              @click="switchDay(idx)"
              :title="d.date"
            >
              Day {{ idx + 1 }}<span class="muted" v-if="d.city"> — {{ d.city }}</span>
            </button>
          </div>
          <div class="days-actions">
            <button class="btn" type="button" @click="addDay()"><i class="fas fa-plus"></i> Add day</button>
          </div>
        </div>
        <div class="studio-grid" style="min-height: 0;">
          <Sidebar />
          <div class="main">
            <MapPanel ref="mapPanel" :layers="currentDay.layers" />
          </div>
        </div>

        <!-- Timeline/editor below, full width under grid -->
        <div class="editor editor-max">
          <div class="timeline-row">
            <div></div>
            <Timeline :hours="currentDay.hours" />
          </div>
          <div class="layers">
            <LayerRow
              v-for="layer in currentDay.layers"
              :key="layer.id"
              :layer="layer"
              :hours="currentDay.hours"
              @select="selectEvent"
              @attach-file="handleAttachFile"
              @hover-event="handleHoverEvent"
              @unhover-event="handleUnhoverEvent"
              @focus-event="handleFocusEvent"
              @export-event="handleExportEvent"
            />
          </div>
          <!-- AIHints hidden per request -->
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import Header from '../Header.vue'
import data from '../../data/studioSample.json'
import MapPanel from './components/MapPanel.vue'
import Sidebar from './components/Sidebar.vue'
import InlinePromptBar from './components/InlinePromptBar.vue'
import Timeline from './components/Timeline.vue'
import LayerRow from './components/LayerRow.vue'
// import AIHints from './components/AIHints.vue'

export default {
  name: 'Studio',
  components: { Header, MapPanel, Timeline, LayerRow, Sidebar, InlinePromptBar },
  data() {
    return {
      days: data.days || [data.day].filter(Boolean),
      selectedDayIndex: 0,
      aiHints: data.aiHints,
      selected: null
    }
  },
  computed: {
    currentDay() {
      return this.days[this.selectedDayIndex]
    }
  },
  methods: {
    selectEvent(event) {
      this.selected = event
    },
    switchDay(idx) {
      if (idx < 0 || idx >= this.days.length) return
      // Clear previous day's overlays before switching
      console.debug('[Studio] switchDay: clearing overlays for day', this.selectedDayIndex, '->', idx)
      this.$refs.mapPanel && this.$refs.mapPanel.clearAll && this.$refs.mapPanel.clearAll()
      this.selectedDayIndex = idx
      // refresh map markers for the new day
      this.$nextTick(() => {
        console.debug('[Studio] switchDay: rendering new day', this.selectedDayIndex)
        this.$refs.mapPanel && this.$refs.mapPanel.renderRoute && this.$refs.mapPanel.renderRoute()
      })
    },
    addDay() {
      const base = this.currentDay || { city: '', date: '', hours: { start: '08:00', end: '20:00' }, layers: [] }
      const newIdx = this.days.length + 1
      const deepCopy = JSON.parse(JSON.stringify(base))
      // Clear events for a fresh day
      deepCopy.layers = (deepCopy.layers || []).map(l => ({ ...l, events: [] }))
      deepCopy.id = `day-${newIdx}`
      // Optionally bump date if ISO
      if (base.date && /^\d{4}-\d{2}-\d{2}$/.test(base.date)) {
        const dt = new Date(base.date)
        if (!isNaN(dt.getTime())) {
          dt.setDate(dt.getDate() + 1)
          const yyyy = dt.getFullYear()
          const mm = String(dt.getMonth() + 1).padStart(2, '0')
          const dd = String(dt.getDate()).padStart(2, '0')
          deepCopy.date = `${yyyy}-${mm}-${dd}`
        }
      }
      this.days.push(deepCopy)
      this.switchDay(this.days.length - 1)
    },
    generateAI() {
      console.log('AI generate (mock)')
    },
    sharePlan() {
      console.log('Share plan (mock)')
    },
    handlePrompt(q) {
      if (!q) return
      console.log('Studio prompt submit:', q)
    },
    handlePickImage() { console.log('Studio pick image') },
    handleMic() { console.log('Studio mic') },
    handleAttachFile({ layerId, eventId, attachment }) {
      // find event and attach file (mock only)
      const layer = this.currentDay.layers.find(l => l.id === layerId)
      if (!layer) return
      const ev = layer.events.find(e => e.id === eventId)
      if (!ev) return
      if (!Array.isArray(ev.attachments)) ev.attachments = []
      ev.attachments.push(attachment)
      console.log('[Studio] Attached file to event', { layerId, eventId, attachment })
    },
    handleHoverEvent({ eventId }) {
      this.$refs.mapPanel && this.$refs.mapPanel.highlightEvent(eventId, { pulseOnly: true })
    },
    handleUnhoverEvent({ eventId }) {
      this.$refs.mapPanel && this.$refs.mapPanel.clearHighlight(eventId)
    },
    handleFocusEvent({ eventId }) {
      this.$refs.mapPanel && this.$refs.mapPanel.highlightEvent(eventId, { center: true, pulseOnly: false })
    },
    handleExportEvent({ layerId, eventId, provider }) {
      const layer = this.currentDay.layers.find(l => l.id === layerId)
      const ev = layer?.events?.find(e => e.id === eventId)
      if (!ev) return
      // Mock: log and briefly highlight on the map to confirm action
      console.log(`[Export Mock] Provider=${provider} | Event=${ev.title} (${ev.start}-${ev.end})`)
      this.$refs.mapPanel && this.$refs.mapPanel.highlightEvent(eventId, { pulseOnly: true })
    }
  }
}
</script>

<style scoped>
.studio { background: var(--bg-secondary); min-height: 100vh; display: flex; flex-direction: column; }
.studio-header { padding: var(--spacing-xl) 0; border-bottom: 1px solid var(--border-light); background: var(--bg-primary); }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: var(--font-size-2xl); color: var(--text-primary); }
.subtitle { margin: 6px 0 0; color: var(--text-secondary); }
.actions { display: flex; gap: var(--spacing-sm); }
.btn { padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-secondary); cursor: pointer; }
.btn.secondary { background: transparent; }

/* Make studio full-width like a desktop app */
.container { max-width: 100%; width: 100%; padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
.studio-body { padding: var(--spacing-lg) 0; flex: 1; display: flex; min-height: 0; }
.studio-grid { display: grid; grid-template-columns: 260px 1fr; gap: var(--spacing-lg); min-height: 0; height: 100%; align-items: stretch; margin-bottom: var(--spacing-lg); }
.studio-grid .sidebar { align-self: start; }
.main { display: flex; flex-direction: column; gap: var(--spacing-lg); flex: 1; }
.editor { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); }
.editor-max { width: 100%; max-width: none; margin-top: auto; padding: var(--spacing-lg); }
.layers { display: flex; flex-direction: column; gap: 10px; }

/* Days */
.days-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); gap: var(--spacing-md); }
.days-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.day-tab { padding: 6px 10px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-secondary); border-radius: 8px; cursor: pointer; }
.day-tab.active { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-light); }
.day-tab .muted { color: var(--text-tertiary); font-weight: 400; }
.days-actions .btn { display: inline-flex; align-items: center; gap: 6px; }

/* Ensure container stretches and allows editor to push to bottom */
.studio-body > .container { display: flex; flex-direction: column; flex: 1; }

/* Align timeline hours with event tracks (label column + track column) */
.timeline-row { display: grid; grid-template-columns: 180px 1fr; align-items: center; margin-bottom: 6px; }
.timeline-row > div:first-child { color: transparent; }

@media (max-width: 1024px) {
  .studio-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .studio-grid { grid-template-columns: 1fr; gap: var(--spacing-sm); }
  .studio-grid .sidebar { order: 2; margin-top: var(--spacing-sm); }
  .studio-grid .main { order: 1; }
}
</style>


