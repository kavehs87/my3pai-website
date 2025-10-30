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
    <div class="options-section">
      <div class="section-title">Export to calendar</div>
      <div class="export-buttons">
        <button class="btn" type="button" @click="emitExport('google')"><i class="fab fa-google"></i> Google</button>
        <button class="btn" type="button" @click="emitExport('outlook')"><i class="fab fa-microsoft"></i> Outlook</button>
        <button class="btn" type="button" @click="emitExport('apple')"><i class="fab fa-apple"></i> Apple (.ics)</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventOptionsOverlay',
  props: { visible: Boolean, event: Object, layerId: String },
  emits: ['close', 'attach-file', 'export-event'],
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
    emitExport(provider) {
      if (!this.event) return
      this.$emit('export-event', { layerId: this.layerId, eventId: this.event.id, provider })
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
.export-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
</style>
