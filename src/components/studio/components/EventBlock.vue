<template>
  <div class="event" :class="eventClass" :style="styleObject" @mousedown.prevent="onMouseDown" :title="issue && issue.message ? issue.message : ''">
    <span class="handle handle-left" @mousedown.stop.prevent="onResizeStart('left', $event)"></span>
    <span class="title">{{ event.title }}</span>
    <span class="time">{{ event.start }}–{{ event.end }}</span>

    <!-- Attachments: paperclip button + count badge -->
    <button class="attach-btn" type="button" @click.stop="openFilePicker" title="Attach file">
      <i class="fas fa-paperclip"></i>
      <span v-if="(event.attachments && event.attachments.length)" class="badge">{{ event.attachments.length }}</span>
    </button>
    <input ref="fileInput" class="hidden-file" type="file" @change="onFileSelected" accept="image/*,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" />

    <span class="handle handle-right" @mousedown.stop.prevent="onResizeStart('right', $event)"></span>
  </div>
  
</template>

<script>
export default {
  name: 'EventBlock',
  props: { event: Object, hours: Object, colorFill: String, colorStroke: String, issue: Object },
  data() {
    return { isDragging: false, isResizing: false, resizeSide: null, dragOffsetPx: 0, tempStartMin: null, tempEndMin: null }
  },
  computed: {
    styleObject() {
      const [sh, sm] = this.hours.start.split(':').map(Number)
      const [eh, em] = this.hours.end.split(':').map(Number)
      const total = (eh * 60 + em) - (sh * 60 + sm)
      const [stH, stM] = this.event.start.split(':').map(Number)
      const [enH, enM] = this.event.end.split(':').map(Number)
      const startMinEvent = (stH * 60 + stM) - (sh * 60 + sm)
      const endMinEvent = (enH * 60 + enM) - (sh * 60 + sm)
      const startMin = this.tempStartMin != null ? this.tempStartMin : startMinEvent
      const endMin = this.tempEndMin != null ? this.tempEndMin : (this.tempStartMin != null ? this.tempStartMin + (endMinEvent - startMinEvent) : endMinEvent)
      const left = `${(startMin / total) * 100}%`
      const width = `${((endMin - startMin) / total) * 100}%`
      const styles = { left, width }
      if (this.colorFill) styles.background = this.colorFill
      if (this.colorStroke) styles.borderColor = this.colorStroke
      return styles
    },
    eventClass() {
      return {
        dragging: this.isDragging || this.isResizing,
        warning: this.issue && this.issue.type === 'too-close',
        danger: this.issue && this.issue.type === 'overlap'
      }
    }
  },
  methods: {
    timeToMinutes(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m },
    minutesToTime(min) { const h = Math.floor(min / 60); const m = min % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}` },
    onMouseDown(e) {
      // track element is offsetParent
      const track = this.$el.offsetParent
      if (!track) return
      const rect = track.getBoundingClientRect()
      const currentLeftPx = this.$el.getBoundingClientRect().left - rect.left
      this.dragOffsetPx = e.clientX - (rect.left + currentLeftPx)
      this.isDragging = true
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseup', this.onMouseUp, { once: true })
    },
    onMouseMove(e) {
      const track = this.$el.offsetParent
      if (!track) return
      const rect = track.getBoundingClientRect()
      const px = Math.min(Math.max(e.clientX - rect.left - this.dragOffsetPx, 0), rect.width)
      const dayStart = this.timeToMinutes(this.hours.start)
      const dayEnd = this.timeToMinutes(this.hours.end)
      const total = dayEnd - dayStart
      const durationInitial = this.timeToMinutes(this.event.end) - this.timeToMinutes(this.event.start)
      const minFromStart = Math.round((px / rect.width) * total)
      if (this.isResizing) {
        const minDuration = 15 // minutes
        if (this.resizeSide === 'left') {
          const newStart = Math.min(Math.max(minFromStart, 0), (this.tempEndMin != null ? this.tempEndMin : (this.tempStartMin != null ? this.tempStartMin + durationInitial : durationInitial)) - minDuration)
          this.tempStartMin = newStart
        } else if (this.resizeSide === 'right') {
          const baseStart = this.tempStartMin != null ? this.tempStartMin : 0
          const startAbs = this.tempStartMin != null ? this.tempStartMin : Math.round(((this.timeToMinutes(this.event.start) - dayStart) / total) * total)
          const newEnd = Math.min(Math.max(minFromStart, (this.tempStartMin != null ? this.tempStartMin : startAbs) + minDuration), total)
          this.tempEndMin = newEnd
        }
      } else {
        // dragging: keep duration constant
        const duration = durationInitial
        const clamped = Math.min(Math.max(minFromStart, 0), total - duration)
        this.tempStartMin = clamped
        this.tempEndMin = clamped + duration
      }
    },
    onMouseUp() {
      if (!this.isDragging && !this.isResizing) return
      const wasResizing = this.isResizing
      this.isDragging = false
      this.isResizing = false
      this.resizeSide = null
      window.removeEventListener('mousemove', this.onMouseMove)
      // commit new times
      const dayStart = this.timeToMinutes(this.hours.start)
      const startMinVal = this.tempStartMin != null ? this.tempStartMin : Math.max(0, this.timeToMinutes(this.event.start) - dayStart)
      const endMinVal = this.tempEndMin != null ? this.tempEndMin : startMinVal + (this.timeToMinutes(this.event.end) - this.timeToMinutes(this.event.start))
      const newStartAbs = dayStart + startMinVal
      const newEndAbs = dayStart + endMinVal
      const start = this.minutesToTime(newStartAbs)
      const end = this.minutesToTime(newEndAbs)
      this.tempStartMin = null
      this.tempEndMin = null
      this.$emit('update-time', { id: this.event.id, start, end })
    }
    ,
    onResizeStart(side, e) {
      this.isResizing = true
      this.resizeSide = side
      const track = this.$el.offsetParent
      if (!track) return
      const rect = track.getBoundingClientRect()
      this.dragOffsetPx = side === 'left' ? e.clientX - this.$el.getBoundingClientRect().left : e.clientX - this.$el.getBoundingClientRect().right
      // initialize temp bounds
      const [sh, sm] = this.hours.start.split(':').map(Number)
      const dayStart = sh * 60 + sm
      this.tempStartMin = this.timeToMinutes(this.event.start) - dayStart
      this.tempEndMin = this.timeToMinutes(this.event.end) - dayStart
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseup', this.onMouseUp, { once: true })
    },
    openFilePicker() {
      const el = this.$refs.fileInput
      if (el) el.click()
    },
    onFileSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      // Create lightweight attachment object with preview for images/PDF
      const reader = new FileReader()
      reader.onload = () => {
        const attachment = {
          id: `${this.event.id}-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: typeof reader.result === 'string' ? reader.result : null
        }
        this.$emit('attach-file', { eventId: this.event.id, attachment })
        // reset input so selecting the same file again will trigger change
        e.target.value = ''
      }
      // For images and PDFs, read as DataURL; otherwise, skip preview
      if (/^image\//.test(file.type) || file.type === 'application/pdf') {
        reader.readAsDataURL(file)
      } else {
        // no preview, but still emit metadata
        const attachment = { id: `${this.event.id}-${Date.now()}`, name: file.name, type: file.type, size: file.size, previewUrl: null }
        this.$emit('attach-file', { eventId: this.event.id, attachment })
        e.target.value = ''
      }
    }
  }
}
</script>

<style scoped>
.event { position: absolute; top: 6px; height: 40px; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); display:flex; align-items:center; gap:8px; padding: 0 10px; cursor: grab; user-select: none; }
.event.dragging { opacity: .9; cursor: grabbing; }
.event.warning { box-shadow: 0 0 0 2px rgba(245,158,11,0.4) inset; }
.event.danger { box-shadow: 0 0 0 2px rgba(239,68,68,0.5) inset; }
.handle { position: absolute; top: 0; width: 8px; height: 100%; background: rgba(0,0,0,0.06); cursor: ew-resize; }
.handle-left { left: 0; border-top-left-radius: var(--radius-sm); border-bottom-left-radius: var(--radius-sm); }
.handle-right { right: 0; border-top-right-radius: var(--radius-sm); border-bottom-right-radius: var(--radius-sm); }
.event .title { color: var(--text-primary); font-weight: 600; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event .time { color: var(--text-secondary); font-size: 11px; }

.attach-btn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 26px; padding: 0 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-primary); color: var(--text-secondary); cursor: pointer; transition: var(--transition-normal); }
.attach-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
.attach-btn i { font-size: 12px; }
.badge { background: var(--secondary-color); color: #fff; border-radius: 10px; padding: 0 6px; font-size: 10px; line-height: 16px; }
.hidden-file { display: none; }
</style>


