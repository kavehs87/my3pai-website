<template>
  <div v-if="visible" class="options-overlay">
    <div class="options-header">
      <div class="title">{{ event && event.title ? event.title : 'Event options' }}</div>
      <button class="close-btn" type="button" @click="$emit('close')"><i class="fas fa-times"></i></button>
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
  props: { visible: Boolean, event: Object, layerId: String },
  emits: ['close', 'attach-file', 'delete-event'],
  data() {
    return { showConfirm: false }
  },
  methods: {
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
.options-overlay { position: absolute; top: 10px; right: 10px; width: 320px; max-width: calc(100% - 20px); background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); padding: 12px; z-index: 20000; }
.options-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.options-header .title { font-weight: 600; color: var(--text-primary); }
.close-btn { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; width: 28px; height: 28px; border-radius: 6px; }
.close-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
.options-section { margin-top: 8px; }
.section-title { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .02em; }
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
