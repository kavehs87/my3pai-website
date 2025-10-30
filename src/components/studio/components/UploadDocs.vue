<template>
  <div class="upload-card">
    <div class="upload-header">
      <div class="title">
        <i class="fas fa-file-upload"></i>
        <span>Upload travel documents</span>
      </div>
      <div class="hint">PDF, images — tickets, vouchers, reservations</div>
    </div>

    <div
      class="dropzone"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="onDrop"
    >
      <input ref="fileInput" class="hidden-file" type="file" multiple
             accept="image/*,application/pdf,.pdf,.png,.jpg,.jpeg,.webp"
             @change="onFileChosen" />
      <div class="dropzone-inner" @click="openPicker">
        <i class="fas fa-cloud-upload-alt"></i>
        <div>Drag & drop files here or click to browse</div>
      </div>
    </div>

    <div v-if="items.length" class="items">
      <div v-for="it in items" :key="it.id" class="item">
        <div class="meta">
          <i class="fas" :class="iconFor(it)" />
          <div class="name">{{ it.file.name }}</div>
        </div>
        <div class="status">
          <span v-if="it.state==='queued'" class="chip">Queued</span>
          <span v-else-if="it.state==='uploading'" class="chip">Uploading…</span>
          <span v-else-if="it.state==='parsing'" class="chip">Parsing…</span>
          <span v-else-if="it.state==='done'" class="chip success">Parsed</span>
          <span v-else-if="it.state==='error'" class="chip danger">Error</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadDocs',
  emits: ['parsed'],
  data() {
    return { items: [] }
  },
  methods: {
    openPicker() {
      const el = this.$refs.fileInput
      if (el) el.click()
    },
    onFileChosen(e) {
      const files = Array.from(e.target.files || [])
      if (!files.length) return
      this.enqueue(files)
      e.target.value = ''
    },
    onDrop(e) {
      const files = Array.from(e.dataTransfer?.files || [])
      if (!files.length) return
      this.enqueue(files)
    },
    enqueue(files) {
      files.forEach((file) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        const item = { id, file, state: 'queued' }
        this.items.unshift(item)
        // Simulate upload -> parsing -> parsed
        this.simulatePipeline(item)
      })
    },
    async simulatePipeline(item) {
      try {
        item.state = 'uploading'
        await new Promise(r => setTimeout(r, 500 + Math.random()*500))
        item.state = 'parsing'
        await new Promise(r => setTimeout(r, 900 + Math.random()*900))
        const suggestion = this.makeSuggestion(item.file)
        item.state = 'done'
        this.$emit('parsed', suggestion)
      } catch (e) {
        item.state = 'error'
      }
    },
    makeSuggestion(file) {
      const name = (file?.name || '').toLowerCase()
      // Heuristic: decide layer and title
      let layer = 'activities'
      let title = 'Imported document'
      if (name.includes('ticket') || name.includes('flight') || name.includes('train')) {
        layer = 'transport'; title = 'Imported ticket'
      } else if (name.includes('hotel') || name.includes('voucher')) {
        layer = 'accommodation'; title = 'Imported reservation'
      }
      // Time slot: 10:00-11:00 by default
      const start = '10:00'
      const end = '11:00'
      // Dummy coord (center of Paris)
      const coords = [48.8566, 2.3522]
      return { layer, title, start, end, coords, notes: `Parsed from ${file?.name || 'file'}` }
    },
    iconFor(it) {
      const name = (it.file?.name || '').toLowerCase()
      if (name.endsWith('.pdf')) return 'fa-file-pdf'
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')) return 'fa-file-image'
      return 'fa-file'
    }
  }
}
</script>

<style scoped>
.upload-card { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); }
.upload-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--border-light); }
.upload-header .title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-primary); font-size: 14px; }
.upload-header .title i { color: var(--text-secondary); font-size: 13px; }
.upload-header .hint { color: var(--text-tertiary); font-size: 11px; }

.dropzone { padding: var(--spacing-md); }
.dropzone-inner { border: 2px dashed var(--border-light); border-radius: var(--radius-md); padding: var(--spacing-lg); text-align: center; color: var(--text-secondary); cursor: pointer; }
.dropzone-inner i { display: block; font-size: 18px; margin-bottom: 6px; color: var(--text-tertiary); }
.hidden-file { display: none; }

.items { border-top: 1px solid var(--border-light); padding: var(--spacing-sm) var(--spacing-md); display: flex; flex-direction: column; gap: 8px; }
.item { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 6px 0; }
.meta { display: flex; align-items: center; gap: 8px; color: var(--text-primary); font-size: 13px; }
.meta i { color: var(--text-secondary); }
.name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.status .chip { background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-light); padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.status .chip.success { background: rgba(16,185,129,0.12); color: #065f46; border-color: rgba(16,185,129,0.25); }
.status .chip.danger { background: rgba(239,68,68,0.12); color: #7f1d1d; border-color: rgba(239,68,68,0.25); }
</style>


