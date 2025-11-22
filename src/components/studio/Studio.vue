<template>
  <div class="studio">
    <Header />

    <div class="studio-body">
      <div class="container">
        <!-- Toolbar actions (day switcher removed - now in calendar) -->
        <div class="days-toolbar">
          <div class="days-actions">
            <div class="toolbar-buttons">
              <button class="btn secondary" type="button">Map Timeline</button>
              <button class="btn secondary" type="button" @click="openCalendarExport">Export to Calendar</button>
              <button class="btn secondary" type="button">Statistics</button>
              <button class="btn secondary" type="button">Export as File</button>
            </div>
            <button class="btn" type="button" @click="addDay()"><i class="fas fa-plus"></i> Add day</button>
          </div>
        </div>
        <div class="studio-grid" style="min-height: 0;">
          <div class="sidebar-col" :style="{ width: sidebarWidth + 'px', minWidth: '200px', maxWidth: '600px' }">
            <Sidebar />
            <div class="calendar-wrap">
              <MiniCalendar 
                :tripDays="days" 
                :selectedStartDate="dateRange.start"
                :selectedEndDate="dateRange.end"
                :currentDayDate="currentDay?.date"
                @date-range-change="handleDateRangeChange"
                @date-select="handleDateSelect"
              />
            </div>
          </div>
          <ResizableSplitter @drag="handleSplitterDrag" @drag-start="handleSplitterDragStart" @drag-end="handleSplitterDragEnd" />
          <div class="main">
            <MapPanel ref="mapPanel" :layers="visibleLayers" />
            <div class="prompt-row">
              <InlinePromptBar :dense="true" @submit="handlePrompt" @pick-image="handlePickImage" @mic="handleMic" />
            </div>
            <EventOptionsOverlay
              :visible="options.visible"
              :event="options.event"
              :layerId="options.layerId"
              :prevEvent="options.prevEvent"
              @close="closeOptions"
              @attach-file="handleAttachFile"
              @delete-event="handleDeleteEvent"
            />
            <CalendarExportModal
              :visible="showCalendarExportModal"
              :days="days"
              @close="closeCalendarExport"
            />
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
              :isVisible="isLayerVisible(layer.id)"
              @select="selectEvent"
              @attach-file="handleAttachFile"
              @hover-event="handleHoverEvent"
              @unhover-event="handleUnhoverEvent"
              @focus-event="handleFocusEvent"
              @export-event="handleExportEvent"
              @open-options="openEventOptions"
              @add-event="handleAddEvent"
              @toggle-visibility="toggleLayerVisibility"
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
import MiniCalendar from './components/MiniCalendar.vue'
import InlinePromptBar from './components/InlinePromptBar.vue'
import Timeline from './components/Timeline.vue'
import LayerRow from './components/LayerRow.vue'
import EventOptionsOverlay from './components/EventOptionsOverlay.vue'
import ResizableSplitter from './components/ResizableSplitter.vue'
import CalendarExportModal from './components/CalendarExportModal.vue'
import toast from '../../utils/toast.js'
// import AIHints from './components/AIHints.vue'

export default {
  name: 'Studio',
  components: { Header, MapPanel, Timeline, LayerRow, Sidebar, MiniCalendar, InlinePromptBar, EventOptionsOverlay, ResizableSplitter, CalendarExportModal },
  data() {
    const defaultWidth = 260
    const savedWidth = localStorage.getItem('studio-sidebar-width')
    return {
      days: data.days || [data.day].filter(Boolean),
      selectedDayIndex: 0,
      aiHints: data.aiHints,
      selected: null,
      options: { visible: false, layerId: null, event: null },
      sidebarWidth: savedWidth ? parseInt(savedWidth, 10) : defaultWidth,
      dragStartX: 0,
      dragStartWidth: 0,
      layerVisibility: {}, // Map of layerId -> boolean, defaults to true if not set
      dateRange: { start: null, end: null }, // Date range selection from calendar
      showCalendarExportModal: false
    }
  },
  mounted() {
    // Initialize all layers as visible
    this.initializeLayerVisibility()
    // Initialize date range from existing days if available
    if (this.days && this.days.length > 0) {
      const dates = this.days
        .map(d => d.date ? new Date(d.date) : null)
        .filter(Boolean)
        .sort((a, b) => a - b)
      
      if (dates.length > 0) {
        this.dateRange = {
          start: dates[0].toISOString().split('T')[0],
          end: dates[dates.length - 1].toISOString().split('T')[0]
        }
      }
    }
    // Expose console command to clear map polylines
    this.$nextTick(() => {
      window.clearMapLines = () => {
        if (this.$refs.mapPanel && typeof this.$refs.mapPanel.clearPolylines === 'function') {
          this.$refs.mapPanel.clearPolylines()
        } else {
          console.warn('MapPanel not available or clearPolylines method not found')
        }
      }
      window.enableMapLines = () => {
        if (this.$refs.mapPanel && typeof this.$refs.mapPanel.enablePolylines === 'function') {
          this.$refs.mapPanel.enablePolylines()
        } else {
          console.warn('MapPanel not available or enablePolylines method not found')
        }
      }
      window.listPolylines = () => {
        if (this.$refs.mapPanel && typeof this.$refs.mapPanel.listPolylines === 'function') {
          return this.$refs.mapPanel.listPolylines()
        } else {
          console.warn('MapPanel not available or listPolylines method not found')
          return null
        }
      }
      window.getPersistentPolylines = () => {
        if (this.$refs.mapPanel && typeof this.$refs.mapPanel.getPersistentPolylines === 'function') {
          return this.$refs.mapPanel.getPersistentPolylines()
        } else {
          console.warn('MapPanel not available or getPersistentPolylines method not found')
          return null
        }
      }
      console.log('%cMap Commands Available:', 'color: #48c4c8; font-weight: bold;', 'Type clearMapLines() to hide polylines, enableMapLines() to show them again, listPolylines() to see current polylines, getPersistentPolylines() to see ALL polylines ever created')
    })
  },
  beforeUnmount() {
    // Clean up global commands
    if (window.clearMapLines) {
      delete window.clearMapLines
    }
    if (window.enableMapLines) {
      delete window.enableMapLines
    }
    if (window.listPolylines) {
      delete window.listPolylines
    }
    if (window.getPersistentPolylines) {
      delete window.getPersistentPolylines
    }
  },
  computed: {
    currentDay() {
      return this.days[this.selectedDayIndex]
    },
    visibleLayers() {
      if (!this.currentDay || !this.currentDay.layers) return []
      return this.currentDay.layers.filter(layer => {
        return this.isLayerVisible(layer.id)
      })
    }
  },
  methods: {
    selectEvent(event) {
      this.selected = event
    },
    switchDay(idx) {
      if (idx < 0 || idx >= this.days.length) return
      // Clear previous day's overlays before switching
      this.$refs.mapPanel && this.$refs.mapPanel.clearAll && this.$refs.mapPanel.clearAll()
      this.selectedDayIndex = idx
      // Rebuild the map to guarantee full cleanup of previous overlays
      this.$nextTick(() => {
        this.$refs.mapPanel && this.$refs.mapPanel.rebuildMap && this.$refs.mapPanel.rebuildMap()
      })
    },
    handleDateRangeChange({ start, end }) {
      this.dateRange = { start, end }
      
      // If both start and end are selected, generate days for the range
      if (start && end) {
        this.generateDaysFromRange(start, end)
      }
    },
    handleDateSelect(dateStr) {
      console.log('[Studio] handleDateSelect called with dateStr:', dateStr)
      // Use the date string directly for comparison (YYYY-MM-DD format)
      // Don't convert to Date object to avoid timezone issues
      const targetDateStr = dateStr
      
      console.log('[Studio] Looking for day with date:', targetDateStr, 'Days available:', this.days.map(d => ({ date: d.date, id: d.id })))
      
      const dayIndex = this.days.findIndex(d => {
        if (!d.date) return false
        // Extract date string from day's date - handle both ISO strings and date objects
        let dayDateStr
        if (typeof d.date === 'string') {
          // If it's already a string, check if it's in YYYY-MM-DD format
          if (d.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dayDateStr = d.date
          } else {
            // Parse as local date (not UTC) to avoid timezone shifts
            const parts = d.date.split('T')[0].split('-')
            const dayDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
            const yyyy = dayDate.getFullYear()
            const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
            const dd = String(dayDate.getDate()).padStart(2, '0')
            dayDateStr = `${yyyy}-${mm}-${dd}`
          }
        } else {
          // If it's a Date object, format it in local timezone
          const dayDate = new Date(d.date)
          const yyyy = dayDate.getFullYear()
          const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
          const dd = String(dayDate.getDate()).padStart(2, '0')
          dayDateStr = `${yyyy}-${mm}-${dd}`
        }
        const matches = dayDateStr === targetDateStr
        if (matches) {
          console.log('[Studio] Found matching day at index:', this.days.indexOf(d), 'Date:', dayDateStr)
        }
        return matches
      })
      
      if (dayIndex >= 0) {
        console.log('[Studio] Switching to day index:', dayIndex)
        this.switchDay(dayIndex)
      } else {
        // Debug: log when day is not found
        console.warn('[Studio] handleDateSelect: Day not found for date:', dateStr, 'Target date string:', targetDateStr, 'Available days:', this.days.map(d => ({ date: d.date, dateType: typeof d.date })))
      }
    },
    generateDaysFromRange(startStr, endStr) {
      const start = new Date(startStr)
      const end = new Date(endStr)
      const days = []
      
      // Generate a day for each date in the range
      let current = new Date(start)
      let dayIndex = 0
      
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0]
        
        // Check if we already have a day for this date
        let existingDay = this.days.find(d => {
          if (!d.date) return false
          return new Date(d.date).toISOString().split('T')[0] === dateStr
        })
        
        if (existingDay) {
          // Use existing day data
          days.push(existingDay)
        } else {
          // Create new day with default structure
          const baseDay = this.days[0] || {
            city: '',
            date: '',
            hours: { start: '08:00', end: '20:00' },
            layers: []
          }
          const newDay = JSON.parse(JSON.stringify(baseDay))
          newDay.id = `day-${dayIndex + 1}`
          newDay.date = dateStr
          // Clear events for new days
          newDay.layers = (newDay.layers || []).map(l => ({ ...l, events: [] }))
          days.push(newDay)
        }
        
        current.setDate(current.getDate() + 1)
        dayIndex++
      }
      
      // Update days array
      this.days = days
      this.selectedDayIndex = 0
      
      // Initialize visibility for all days
      this.$nextTick(() => {
        this.initializeLayerVisibility()
        // Rebuild map for the first day
        if (this.$refs.mapPanel && this.$refs.mapPanel.rebuildMap) {
          this.$refs.mapPanel.rebuildMap()
        }
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
      // Initialize visibility for new day's layers
      this.$nextTick(() => {
        this.initializeLayerVisibility()
      })
      this.switchDay(this.days.length - 1)
    },
    generateAI() {
      console.log('AI generate (mock)')
    },
    sharePlan() {
      console.log('Share plan (mock)')
    },
    handlePrompt({ query, image }) {
      if (!query && !image) return
      console.log('Studio prompt submit:', { query, image: image ? { name: image.name, size: image.size, type: image.type } : null })
      // Mock: if a ticket file was uploaded, map by filename to create events automatically
      if (image && image.file) {
        this.processTicketFile(image.file)
        return
      }
      // Future: process query text here
    },
    processTicketFile(file) {
      const name = (file.name || '').toLowerCase()
      const mapping = this.ticketMapping()
      const match = Object.keys(mapping).find(key => name.includes(key))
      if (!match) {
        toast.info('File uploaded. No matching mock rule found; skipped.')
        return
      }
      const mock = mapping[match]
      const event = {
        title: mock.title,
        start: mock.start,
        end: mock.end,
        coords: mock.coords,
        type: mock.type,
        notes: `Auto-created from ${file.name}`
      }
      const layer = this.currentDay.layers.find(l => l.id === mock.layerId)
      if (!layer) {
        toast.error(`Layer '${mock.layerId}' not found`)
        return
      }
      this.handleAddEvent({ layerId: mock.layerId, event })
      toast.success(`${mock.successMsg}`)
    },
    ticketMapping() {
      // POC rules: match by filename substrings
      return {
        'Eiffel-tower.pdf': {
          layerId: 'activity',
          title: 'Paris: Eiffel Tower Stairs Climb to Level 2',
          start: '14:00',
          end: '16:00',
          coords: [48.85836, 2.29778],
          type: 'activity',
          successMsg: ' Eiffel tower ticket added'
        },
        'ticket002.pdf': {
          layerId: 'activities',
          title: 'Louvre Museum Entry',
          start: '14:00',
          end: '16:00',
          coords: [48.8606, 2.3376],
          type: 'activity',
          successMsg: 'Museum ticket added'
        },
        'Paris-Crazy-Horse-Cabaret-Show.jpg': {
          layerId: 'activity',
          title: 'Paris: Crazy Horse Cabaret Show',
          start: '18:00',
          end: '20:00',
          coords: [48.86819, 2.30146],
          type: 'activity',
          successMsg: 'Show ticket added'
        },
        'hotel.pdf': {
          layerId: 'accommodation',
          title: 'Maison Proust, Hotel and Spa La Mer',
          start: '8:00',
          end: '20:00',
          coords: [48.8584, 2.2945],
          type: 'accommodation',
          successMsg: 'Hotel check-in added'
        },
        'ticket005.pdf': {
          layerId: 'food',
          title: 'Restaurant Reservation',
          start: '19:00',
          end: '20:30',
          coords: [48.8566, 2.3522],
          type: 'meal',
          successMsg: 'Dinner reservation added'
        }
      }
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
    },
    handleAddEvent({ layerId, event }) {
      const layer = this.currentDay.layers.find(l => l.id === layerId)
      if (!layer) return
      const id = `${layerId}-${Date.now()}`
      layer.events = layer.events || []
      layer.events.push({ id, ...event })
      // brief map feedback
      this.$nextTick(() => {
        this.$refs.mapPanel && this.$refs.mapPanel.highlightEvent && this.$refs.mapPanel.highlightEvent(id, { pulseOnly: true, center: true })
      })
    },
    openEventOptions({ layerId, eventId }) {
      const layer = this.currentDay.layers.find(l => l.id === layerId)
      const ev = layer?.events?.find(e => e.id === eventId) || null
      let prevEvent = null
      if (layer && Array.isArray(layer.events)) {
        const sorted = [...layer.events].sort((a,b) => (a.start||'').localeCompare(b.start||''))
        const idx = sorted.findIndex(e => e.id === eventId)
        if (idx > 0) prevEvent = sorted[idx - 1]
      }
      this.options = { visible: true, layerId, event: ev, prevEvent }
    },
    closeOptions() { this.options.visible = false },
    openCalendarExport() {
      this.showCalendarExportModal = true
    },
    closeCalendarExport() {
      this.showCalendarExportModal = false
    },
    handleSplitterDrag(e) {
      if (this.dragStartX === 0) {
        // First drag event - initialize
        this.dragStartX = e.clientX
        this.dragStartWidth = this.sidebarWidth
        return
      }
      // Continue dragging
      const deltaX = e.clientX - this.dragStartX
      const newWidth = this.dragStartWidth + deltaX
      const minWidth = 200
      const maxWidth = 600
      this.sidebarWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      localStorage.setItem('studio-sidebar-width', this.sidebarWidth.toString())
    },
    handleSplitterDragStart() {
      this.dragStartX = 0
      this.dragStartWidth = this.sidebarWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    handleSplitterDragEnd() {
      this.dragStartX = 0
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    },
    initializeLayerVisibility() {
      // Set all layers to visible by default
      this.days.forEach(day => {
        if (day.layers && Array.isArray(day.layers)) {
          day.layers.forEach(layer => {
            if (this.layerVisibility[layer.id] === undefined) {
              this.layerVisibility[layer.id] = true
            }
          })
        }
      })
    },
    isLayerVisible(layerId) {
      return this.layerVisibility[layerId] !== false
    },
    toggleLayerVisibility(layerId) {
      const current = this.isLayerVisible(layerId)
      this.layerVisibility[layerId] = !current
      console.log(`[Studio] 🔀 TOGGLE LAYER VISIBILITY: ${layerId} -> ${!current ? 'VISIBLE' : 'HIDDEN'}`)
      console.log(`[Studio] Layer visibility state:`, this.layerVisibility)
      
      // Log current map state
      if (this.$refs.mapPanel && this.$refs.mapPanel.listPolylines) {
        console.log(`[Studio] Current polylines on map:`)
        this.$refs.mapPanel.listPolylines()
      }
    },
    handleDeleteEvent({ layerId, eventId }) {
      const layer = this.currentDay.layers.find(l => l.id === layerId)
      if (!layer || !layer.events) return
      const idx = layer.events.findIndex(e => e.id === eventId)
      if (idx !== -1) {
        layer.events.splice(idx, 1)
        // Close overlay and refresh map
        this.closeOptions()
        this.$nextTick(() => {
          this.$refs.mapPanel && this.$refs.mapPanel.renderRoute && this.$refs.mapPanel.renderRoute()
        })
      }
    }
  }
}
</script>

<style scoped>
.studio { background: var(--bg-secondary); min-height: 100vh; display: flex; flex-direction: column; }
.studio-header { display: none; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: var(--font-size-2xl); color: var(--text-primary); }
.subtitle { margin: 6px 0 0; color: var(--text-secondary); }
.actions { display: flex; gap: var(--spacing-sm); }
.btn { padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-secondary); cursor: pointer; }
.btn.secondary { background: transparent; }

/* Make studio full-width like a desktop app */
.container { max-width: 100%; width: 100%; padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
.studio-body { padding: var(--spacing-lg) 0; flex: 1; display: flex; min-height: 0; }
.studio-grid { display: flex; gap: 0; min-height: 0; height: 100%; align-items: stretch; margin-bottom: var(--spacing-sm); }
.studio-grid .sidebar { align-self: start; }
.sidebar-col { position: relative; flex-direction: column; }
.sidebar-col > .calendar-wrap { position: absolute; left: 0; right: 0; bottom: 0; padding-top: var(--spacing-sm); z-index: 0; }
.sidebar-col > .sidebar { position: relative; z-index: 1; }
.main { display: flex; flex-direction: column; gap: var(--spacing-sm); flex: 1; }
.main { position: relative; }
.editor { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); }
.editor-max { width: 100%; max-width: none; margin-top: auto; padding: var(--spacing-lg); }
.layers { display: flex; flex-direction: column; gap: 10px; }

/* Prompt row spacing */
/* .prompt-row { margin-top: var(--spacing-sm); margin-bottom: var(--spacing-lg); } */

/* Options overlay styles moved to EventOptionsOverlay.vue */

/* Days */
.days-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); gap: var(--spacing-md); }
.days-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.day-tab { padding: 6px 10px; border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-secondary); border-radius: 8px; cursor: pointer; }
.day-tab.active { background: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-light); }
.day-tab .muted { color: var(--text-tertiary); font-weight: 400; }
.days-actions { display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap; justify-content: flex-end; margin-left: auto; }
.days-actions .btn { display: inline-flex; align-items: center; gap: 6px; }
.toolbar-buttons { display: flex; gap: 6px; flex-wrap: wrap; }

/* Ensure container stretches and allows editor to push to bottom */
.studio-body > .container { display: flex; flex-direction: column; flex: 1; }

/* Align timeline hours with event tracks (label column + track column) */
.timeline-row { display: grid; grid-template-columns: 180px 1fr; align-items: center; margin-bottom: 6px; }
.timeline-row > div:first-child { color: transparent; }

@media (max-width: 1024px) {
  .studio-grid { flex-direction: column; }
  .sidebar-col { width: 100% !important; max-width: 100% !important; }
}

@media (max-width: 768px) {
  .studio-grid { flex-direction: column; gap: var(--spacing-sm); }
  .studio-grid .sidebar { order: 2; margin-top: var(--spacing-sm); }
  .studio-grid .main { order: 1; }
}
</style>


