<template>
  <div v-if="visible" class="options-overlay">
    <div class="options-header">
      <div class="title">{{ event && event.title ? event.title : 'Event options' }}</div>
      <button class="close-btn" type="button" @click="$emit('close')"><i class="fas fa-times"></i></button>
    </div>
    <div v-if="event" class="options-section">
      <div class="section-title">Event Insights</div>
      <ul class="metrics">
        <li><span>Duration</span><strong>{{ durationLabel }}</strong></li>
        <li><span>Distance from previous</span><strong>{{ distanceLabel }}</strong></li>
        <li><span>Location</span><strong>{{ locationLabel }}</strong></li>
        <li><span>Estimated cost</span><strong>{{ costLabel }}</strong></li>
      </ul>
    </div>
    <div class="options-section">
      <div class="section-title">Attachments</div>
      <div v-if="!event || !event.attachments || !event.attachments.length" class="muted">No attachments</div>
      <ul v-else class="attachments">
        <li v-for="att in event.attachments" :key="att.id">{{ att.name }}</li>
      </ul>
      <div class="attach-row">
        <input ref="fileInput" class="hidden-file" type="file" @change="onFileSelected" accept="image/*,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" />
        <button class="btn" type="button" @click="triggerFile">Attach file</button>
      </div>
    </div>
    <div class="options-section danger-section">
      <div class="section-title">Danger Zone</div>
      <button class="btn btn-danger" type="button" @click="showConfirmDelete">
        <i class="fas fa-trash"></i> Delete Event
      </button>
    </div>
    <!-- Confirmation Dialog -->
    <div v-if="showConfirm" class="confirm-dialog">
      <div class="confirm-content">
        <div class="confirm-title">Delete Event?</div>
        <div class="confirm-message">Are you sure you want to delete "{{ event && event.title ? event.title : 'this event' }}"? This action cannot be undone.</div>
        <div class="confirm-actions">
          <button class="btn btn-secondary" type="button" @click="cancelDelete">Cancel</button>
          <button class="btn btn-danger" type="button" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventOptionsOverlay',
  props: { visible: Boolean, event: Object, layerId: String, prevEvent: Object },
  emits: ['close', 'attach-file', 'delete-event'],
  data() {
    return { showConfirm: false }
  },
  computed: {
    durationLabel() {
      if (!this.event || !this.event.start || !this.event.end) return '—'
      const mins = this.diffMinutes(this.event.start, this.event.end)
      if (mins <= 0 || isNaN(mins)) return '—'
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return h ? `${h}h ${m}m` : `${m}m`
    },
    distanceLabel() {
      const a = this.prevEvent && Array.isArray(this.prevEvent.coords) ? this.prevEvent.coords : null
      const b = this.event && Array.isArray(this.event.coords) ? this.event.coords : null
      if (!a || !b) return '—'
      const km = this.haversineKm(a, b)
      if (!isFinite(km)) return '—'
      return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
    },
    locationLabel() {
      if (!this.event || !Array.isArray(this.event.coords)) return '—'
      const [lat, lng] = this.event.coords
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    },
    costLabel() {
      if (!this.event) return '—'
      const type = this.event.type || 'other'
      const table = {
        accommodation: 120,
        meal: 25,
        activity: 30,
        transport: 35,
        other: 15
      }
      const usd = table[type] != null ? table[type] : table.other
      return `~ $${usd}`
    }
  },
  methods: {
    diffMinutes(startHHMM, endHHMM) {
      const [sh, sm] = (startHHMM || '').split(':').map(n => parseInt(n, 10))
      const [eh, em] = (endHHMM || '').split(':').map(n => parseInt(n, 10))
      if ([sh, sm, eh, em].some(n => isNaN(n))) return NaN
      return (eh * 60 + em) - (sh * 60 + sm)
    },
    haversineKm(a, b) {
      const toRad = d => d * Math.PI / 180
      const [lat1, lon1] = a
      const [lat2, lon2] = b
      const R = 6371
      const dLat = toRad(lat2 - lat1)
      const dLon = toRad(lon2 - lon1)
      const s1 = Math.sin(dLat/2)
      const s2 = Math.sin(dLon/2)
      const h = s1*s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2*s2
      const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h))
      return R * c
    },
    triggerFile() { const el = this.$refs.fileInput; if (el) el.click() },
    onFileSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file || !this.event) return
      const reader = new FileReader()
      reader.onload = () => {
        const attachment = {
          id: `${this.event.id}-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: typeof reader.result === 'string' ? reader.result : null
        }
        this.$emit('attach-file', { layerId: this.layerId, eventId: this.event.id, attachment })
        e.target.value = ''
      }
      if (/^image\//.test(file.type) || file.type === 'application/pdf') reader.readAsDataURL(file)
      else {
        const attachment = { id: `${this.event.id}-${Date.now()}`, name: file.name, type: file.type, size: file.size, previewUrl: null }
        this.$emit('attach-file', { layerId: this.layerId, eventId: this.event.id, attachment })
        e.target.value = ''
      }
    },
    showConfirmDelete() {
      this.showConfirm = true
    },
    cancelDelete() {
      this.showConfirm = false
    },
    confirmDelete() {
      if (!this.event) return
      this.$emit('delete-event', { layerId: this.layerId, eventId: this.event.id })
      this.showConfirm = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.options-overlay { position: absolute; top: 10px; right: 10px; width: 420px; max-width: calc(100% - 20px); background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); padding: 12px; z-index: 20000; }
.options-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.options-header .title { font-weight: 600; color: var(--text-primary); }
.close-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; width: 28px; height: 28px; border-radius: 6px; }
.close-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
.options-section { margin-top: 8px; }
.section-title { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .02em; }
.metrics { list-style: none; padding: 0; margin: 0 0 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; color: var(--text-primary); }
.metrics li { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed var(--border-light); padding: 4px 0; }
.metrics li span { color: var(--text-secondary); font-size: 12px; }
.metrics li strong { font-weight: 600; font-size: 13px; }
.attachments { margin: 0; padding-left: 16px; color: var(--text-primary); }
.muted { color: var(--text-tertiary); }
.attach-row { margin-top: 8px; }
.hidden-file { display: none; }

.danger-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light); }
.btn-danger { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; }
.btn-danger:hover { background: #ef4444; color: #fff; }
.btn-secondary { background: var(--bg-secondary); border-color: var(--border-light); color: var(--text-primary); }

.confirm-dialog { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 30000; }
.confirm-content { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 20px; max-width: 400px; width: 90%; box-shadow: var(--shadow-light); }
.confirm-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
.confirm-message { color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
.confirm-actions .btn { padding: 8px 16px; }
/* calendar export buttons removed */
</style>
