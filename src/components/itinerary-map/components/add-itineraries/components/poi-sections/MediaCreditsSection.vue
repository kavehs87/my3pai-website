<template>
  <div class="media-credits">
    <div class="upload-panel">
      <div class="upload-header">
        <div>
        <label>Media uploads</label>
          <p class="upload-hint-text">Add up to 10 images to showcase this POI.</p>
        </div>
        <button
          type="button"
          class="ghost-button"
          @click="triggerFileInput"
          :disabled="!canAddMoreImages"
        >
          <i class="fas fa-plus"></i>
          Add images
        </button>
      </div>
      <div
        class="upload-area"
        :class="{ 'is-disabled': !canAddMoreImages, 'is-dragging': dragUploadActive }"
        @click="triggerFileInput"
        @dragover.prevent="handleUploadDragOver"
        @dragleave.prevent="handleUploadDragLeave"
        @drop.prevent="handleUploadDrop"
      >
        <div class="upload-content">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>
            {{ canAddMoreImages ? 'Click or drag files to upload' : 'Maximum images added' }}
          </span>
          <small>PNG, JPG, WebP, GIF — 10MB max each</small>
        </div>
      </div>
          <input
            ref="mediaInput"
            type="file"
            multiple
        accept="image/*"
            style="display: none"
            @change="handleImageChange"
      />
      <p v-if="uploadError" class="upload-error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ uploadError }}
      </p>
    </div>

    <div v-if="images.length" class="media-gallery">
      <div
        v-for="(image, index) in images"
        :key="image.uid || index"
        class="media-card"
        draggable="true"
        @dragstart="startDrag(index)"
        @dragover.prevent="onDragOver(index)"
        @dragleave.prevent="onDragLeave(index)"
        @drop.prevent="onDrop(index)"
        @dragend="endDrag"
      >
        <button class="drag-handle" type="button" title="Drag to reorder">
          <i class="fas fa-grip-vertical"></i>
        </button>
        <div class="media-card-preview">
          <img :src="image.previewUrl || placeholderImage" alt="POI media preview" />
          </div>
        <div class="media-card-meta">
          <span class="badge" :class="image.type">
            {{ image.type === 'existing' ? 'Saved' : 'New upload' }}
          </span>
          <span class="filename">{{ image.name || 'Untitled image' }}</span>
        </div>
        <div class="media-card-actions">
          <button type="button" class="text-button danger" @click="removeImage(index)">
            <i class="fas fa-trash"></i>
            Remove
          </button>
          <div class="reorder-buttons">
            <button type="button" @click="moveImage(index, -1)" :disabled="index === 0">
              <i class="fas fa-arrow-up"></i>
            </button>
            <button
              type="button"
              @click="moveImage(index, 1)"
              :disabled="index === images.length - 1"
            >
              <i class="fas fa-arrow-down"></i>
            </button>
          </div>
        </div>
      </div>
      <p class="reorder-hint">
        <i class="fas fa-arrows-alt"></i>
        Drag cards or use the arrows to reorder. The first image will be featured first.
      </p>
    </div>
    <p v-else class="media-empty">
      No media uploaded yet. Add your first photo to bring this POI to life.
    </p>

    <div class="field-group">
      <label>Copyright owner</label>
      <textarea
        v-model="imageCredit"
        placeholder="Name or handle to credit"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ imageCreditLength }} chars</div>
      </div>
    </div>

    <div class="field-group">
      <h4>Video &amp; Social</h4>
      <label>YouTube video URL</label>
      <input type="url" v-model="videoUrl" placeholder="Full link to video" />

      <div class="row">
        <div class="col">
          <label>Time in video (start)</label>
          <input type="text" v-model="videoStart" placeholder="e.g. 04:32" />
        </div>
        <div class="col">
          <label>Time in video (end, optional)</label>
          <input type="text" v-model="videoEnd" placeholder="e.g. 05:10" />
        </div>
      </div>

      <label>Caption for video box</label>
      <input type="text" v-model="videoCaption" placeholder="See this lake at 4:32 in our vlog" />

      <label>Social showcases</label>
      <div class="social-entry">
        <input
          type="url"
          v-model="socialLinkInput"
          :disabled="!canAddSocialLink"
          placeholder="Paste a TikTok / Instagram / Facebook post URL"
        />
        <button
          type="button"
          class="add-btn"
          :disabled="!canAddSocialLink || !socialLinkInput"
          @click="addSocialLink"
        >
          Add
        </button>
      </div>
      <p class="social-helper">
        {{ socialPosts.length }}/3 links added. Supported: TikTok, Instagram, Facebook posts or reels.
      </p>
      <p v-if="socialLinkError" class="social-error">{{ socialLinkError }}</p>
      <ul v-if="socialPosts.length" class="social-list">
        <li v-for="(link, index) in socialPosts" :key="link + index">
          <span>{{ link }}</span>
          <button type="button" class="remove-social" @click="removeSocialLink(index)">
            <i class="fas fa-times"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const MAX_IMAGES = 10
const MAX_FILE_SIZE_MB = 10
const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif'
]

const defaultValue = () => ({
  images: [],
  imagesToDelete: [],
  imagesOrder: [],
  originalImageOrder: [],
  imageCredit: '',
  videoUrl: '',
  videoStart: '',
  videoEnd: '',
  videoCaption: '',
  socialPosts: []
})

export default {
  name: 'MediaCreditsSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      socialLinkInput: '',
      socialLinkError: '',
      dragUploadActive: false,
      dragState: { from: null },
      createdObjectUrls: new Set(),
      uploadError: '',
      uploadErrorTimeout: null,
      internalImages: [],
      internalImagesToDelete: [] // Internal tracking of images to delete, persists across updates
    }
  },
  computed: {
    mediaValue() {
      return { ...defaultValue(), ...(this.modelValue || {}) }
    },
    images() {
      return this.internalImages
    },
    imagesToDeleteList() {
      // Use internal array if it has items, otherwise fall back to modelValue
      // This ensures we preserve deletions even when modelValue is stale
      if (this.internalImagesToDelete.length > 0) {
        return this.internalImagesToDelete
      }
      return Array.isArray(this.mediaValue.imagesToDelete) ? this.mediaValue.imagesToDelete : []
    },
    canAddMoreImages() {
      return this.images.length < MAX_IMAGES
    },
    imageCredit: {
      get() {
        return this.mediaValue.imageCredit || ''
      },
      set(value) {
        this.updateField('imageCredit', value)
      }
    },
    videoUrl: {
      get() {
        return this.mediaValue.videoUrl || ''
      },
      set(value) {
        this.updateField('videoUrl', value)
      }
    },
    videoStart: {
      get() {
        return this.mediaValue.videoStart || ''
      },
      set(value) {
        this.updateField('videoStart', value)
      }
    },
    videoEnd: {
      get() {
        return this.mediaValue.videoEnd || ''
      },
      set(value) {
        this.updateField('videoEnd', value)
      }
    },
    videoCaption: {
      get() {
        return this.mediaValue.videoCaption || ''
      },
      set(value) {
        this.updateField('videoCaption', value)
      }
    },
    socialPosts() {
      return Array.isArray(this.mediaValue.socialPosts) ? this.mediaValue.socialPosts : []
    },
    imageCreditLength() {
      return this.imageCredit?.length || 0
    },
    canAddSocialLink() {
      return this.socialPosts.length < 3
    },
    placeholderImage() {
      return (
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">' +
            '<rect width="200" height="140" fill="#f3f4f6"/>' +
            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#9ca3af">Preview</text>' +
          '</svg>'
        )
      )
    }
  },
  watch: {
    'modelValue.images': {
      immediate: true,
      handler(newValue, oldValue) {
        console.log('[MediaCreditsSection] watcher: modelValue.images changed')
        console.log('[MediaCreditsSection] watcher: newValue length:', Array.isArray(newValue) ? newValue.length : 0)
        console.log('[MediaCreditsSection] watcher: current internalImages length:', this.internalImages.length)
        
        // Preserve images with File objects (new uploads) even if they're not in newValue
        // This happens when parent updates come back without File objects
        const currentImagesWithFiles = this.internalImages.filter(img => img.type === 'new' && img.file)
        const newValueArray = Array.isArray(newValue) ? newValue : []
        
        // Merge: keep existing images with files, add/update from newValue
        const mergedImages = []
        const processedUids = new Set()
        
        // First, add all current images that have files (new uploads)
        currentImagesWithFiles.forEach(img => {
          mergedImages.push(img)
          processedUids.add(img.uid)
        })
        
        // Then, add/update from newValue
        newValueArray.forEach(img => {
          if (!processedUids.has(img.uid)) {
            mergedImages.push(img)
            processedUids.add(img.uid)
          }
        })
        
        const { images, changed } = this.normalizeImagesArray(mergedImages)
        console.log('[MediaCreditsSection] watcher: after merge, images length:', images.length, 'changed:', changed)
        
        if (changed || images.length !== this.internalImages.length) {
          // Update internal images but don't emit (we're receiving an update from parent)
          this.internalImages = images
          if (!this.mediaValue.imagesOrder?.length) {
            this.captureImageOrder(images)
          }
        }
      }
    },
    'modelValue.imagesToDelete': {
      immediate: true,
      handler(newValue) {
        // Sync internalImagesToDelete from modelValue
        // This allows us to preserve deletions even when modelValue is stale
        if (Array.isArray(newValue)) {
          this.internalImagesToDelete = [...newValue]
        } else {
          this.internalImagesToDelete = []
        }
      }
    }
  },
  beforeUnmount() {
    if (this.uploadErrorTimeout) {
      clearTimeout(this.uploadErrorTimeout)
    }
    this.createdObjectUrls.forEach((url) => URL.revokeObjectURL(url))
    this.createdObjectUrls.clear()
  },
  methods: {
    triggerFileInput() {
      if (!this.canAddMoreImages) {
        this.setUploadError('You have reached the maximum number of images for this POI.')
        return
      }
      this.$refs.mediaInput?.click()
    },
    handleImageChange(event) {
      const files = Array.from(event.target.files || [])
      this.addFiles(files)
      if (event.target) {
        event.target.value = ''
      }
    },
    handleUploadDragOver() {
      if (!this.canAddMoreImages) return
      this.dragUploadActive = true
    },
    handleUploadDragLeave() {
      this.dragUploadActive = false
    },
    handleUploadDrop(event) {
      this.dragUploadActive = false
      if (!this.canAddMoreImages) {
        this.setUploadError('You have reached the maximum number of images for this POI.')
        return
      }
      const files = Array.from(event.dataTransfer?.files || [])
      this.addFiles(files)
    },
    addFiles(files = []) {
      if (!files.length || !this.canAddMoreImages) return
      let validFiles = []
      files.forEach((file) => {
        const validation = this.validateFile(file)
        if (validation.valid) {
          validFiles.push(file)
        } else if (validation.reason) {
          this.setUploadError(validation.reason)
        }
      })
      if (!validFiles.length) return
      const availableSlots = MAX_IMAGES - this.images.length
      if (validFiles.length > availableSlots) {
        validFiles = validFiles.slice(0, availableSlots)
        this.setUploadError(`Only ${availableSlots} more image${availableSlots === 1 ? '' : 's'} allowed.`)
      }
      const newEntries = validFiles.map((file) => this.createImageEntryFromFile(file))
      const next = [...this.images, ...newEntries]
      this.commitImages(next)
      if (this.uploadError) {
        this.uploadError = ''
      }
    },
    removeImage(index) {
      const next = [...this.images]
      const removed = next.splice(index, 1)[0]
      if (!removed) return
      if (removed.type === 'existing' && removed.id) {
        this.appendImageToDelete(removed.id)
      }
      this.revokeObjectUrl(removed)
      this.commitImages(next)
    },
    moveImage(index, direction) {
      const target = index + direction
      if (target < 0 || target >= this.images.length) return
      this.reorderImages(index, target)
    },
    reorderImages(from, to) {
      if (from === to || from < 0 || to < 0 || from >= this.images.length || to >= this.images.length) return
      const next = [...this.images]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      this.commitImages(next)
    },
    startDrag(index) {
      this.dragState = { from: index }
    },
    onDragOver(index) {
      this.dragState.to = index
    },
    onDragLeave() {},
    onDrop(index) {
      if (this.dragState.from === null) return
      this.reorderImages(this.dragState.from, index)
      this.endDrag()
    },
    endDrag() {
      this.dragState = { from: null }
    },
    normalizeImagesArray(list = []) {
      let changed = false
      const normalized = []
      for (let i = 0; i < list.length && normalized.length < MAX_IMAGES; i += 1) {
        const entry = list[i]
        if (entry && entry.type && entry.uid) {
          normalized.push(entry)
          continue
        }
        changed = true
        if (this.isSupportedFile(entry)) {
          normalized.push(this.createImageEntryFromFile(entry))
        } else if (entry && typeof entry === 'object') {
          normalized.push(this.createImageEntryFromExisting(entry, normalized.length))
        }
      }
      return { images: normalized, changed }
    },
    createImageEntryFromFile(file) {
      const objectUrl = URL.createObjectURL(file)
      this.createdObjectUrls.add(objectUrl)
      return {
        uid: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'new',
        name: file.name,
        file,
        previewUrl: objectUrl,
        objectUrl
      }
    },
    createImageEntryFromExisting(image = {}, index = 0) {
      return {
        uid: image.uid || `existing-${image.id ?? index}`,
        id: image.id,
        type: 'existing',
        name: image.name || image.original_name || this.deriveFilename(image.url) || `Image ${index + 1}`,
        previewUrl: image.previewUrl || image.url || '',
        url: image.url,
        sortOrder: image.sortOrder ?? image.sort_order ?? index
      }
    },
    deriveFilename(url = '') {
      if (!url) return ''
      try {
        const parsed = new URL(url)
        const segments = parsed.pathname.split('/')
        return segments.pop() || ''
      } catch (error) {
        void error
        const parts = url.split('/')
        return parts.pop() || ''
      }
    },
    commitImages(images, { emitUpdate = true } = {}) {
      console.log('[MediaCreditsSection] commitImages called, images count:', images.length, 'emitUpdate:', emitUpdate)
      console.log('[MediaCreditsSection] commitImages: images:', images.map(img => ({ type: img.type, hasFile: !!img.file, name: img.name })))
      this.internalImages = images
      if (emitUpdate) {
        console.log('[MediaCreditsSection] commitImages: emitting update with images')
        this.updateField('images', images)
        this.captureImageOrder(images)
      }
    },
    captureImageOrder(images = []) {
      // Exclude images that are marked for deletion
      const idsToDelete = new Set(this.imagesToDeleteList)
      const order = images
        .filter((image) => image.type === 'existing' && image.id && !idsToDelete.has(image.id))
        .map((image) => image.id)
      this.updateField('imagesOrder', order)
    },
    appendImageToDelete(id) {
      if (!id) return
      // Update internal array immediately to preserve it across rapid updates
      this.internalImagesToDelete = Array.from(new Set([...this.internalImagesToDelete, id]))
      const next = [...this.internalImagesToDelete]
      this.updateField('imagesToDelete', next)
    },
    revokeObjectUrl(entry) {
      if (entry?.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl)
        this.createdObjectUrls.delete(entry.objectUrl)
      }
    },
    isSupportedFile(file) {
      if (!file || typeof File === 'undefined' || !(file instanceof File)) return false
      if (file.type && (file.type.startsWith('image/') || ACCEPTED_MIME_TYPES.includes(file.type.toLowerCase()))) {
        return true
      }
      const name = (file.name || '').toLowerCase()
      return /\.(png|jpe?g|gif|webp|avif|heic|heif)$/.test(name)
    },
    validateFile(file) {
      if (!this.isSupportedFile(file)) {
        return {
          valid: false,
          reason: 'Unsupported file type. Please upload PNG, JPG, WebP, GIF, AVIF, or HEIC images.'
        }
      }
      const sizeMb = file.size / (1024 * 1024)
      if (sizeMb > MAX_FILE_SIZE_MB) {
        return {
          valid: false,
          reason: `“${file.name}” exceeds the ${MAX_FILE_SIZE_MB}MB limit.`
        }
      }
      return { valid: true }
    },
    setUploadError(message) {
      if (this.uploadErrorTimeout) {
        clearTimeout(this.uploadErrorTimeout)
        this.uploadErrorTimeout = null
      }
      this.uploadError = message
      if (message) {
        this.uploadErrorTimeout = setTimeout(() => {
          this.uploadError = ''
          this.uploadErrorTimeout = null
        }, 4000)
      }
    },
    addSocialLink() {
      const value = (this.socialLinkInput || '').trim()
      if (!value || !this.canAddSocialLink) return
      if (!this.isSupportedSocialLink(value)) {
        this.socialLinkError = 'Only Instagram, TikTok, or Facebook post links are allowed.'
        return
      }
      if (this.socialPosts.includes(value)) {
        this.socialLinkError = 'This link is already added.'
        this.socialLinkInput = ''
        return
      }
      this.socialLinkError = ''
      this.updateField('socialPosts', [...this.socialPosts, value])
      this.socialLinkInput = ''
    },
    removeSocialLink(index) {
      const next = this.socialPosts.filter((_, idx) => idx !== index)
      this.updateField('socialPosts', next)
      if (next.length < 3) {
        this.socialLinkError = ''
      }
    },
    isSupportedSocialLink(link) {
      try {
        const url = new URL(link)
        const host = url.hostname.toLowerCase()
        return (
          host.includes('instagram.com') ||
          host.includes('tiktok.com') ||
          host.includes('facebook.com')
        )
      } catch (error) {
        void error
        return false
      }
    },
    updateField(key, value) {
      const base = {
        ...defaultValue(),
        ...(this.modelValue || {})
      }
      base[key] = value
      // Always include current internal state for imagesToDelete to ensure it's preserved
      // This prevents it from being lost when modelValue is stale
      // But don't overwrite if we're explicitly setting that field
      if (key !== 'imagesToDelete') {
        // Use internalImagesToDelete directly to ensure we have the latest value
        if (this.internalImagesToDelete.length > 0) {
          base.imagesToDelete = [...this.internalImagesToDelete]
        } else if (Array.isArray(this.mediaValue.imagesToDelete) && this.mediaValue.imagesToDelete.length > 0) {
          base.imagesToDelete = [...this.mediaValue.imagesToDelete]
        }
      }
      // Preserve imagesOrder if we have one computed from internalImages
      // But don't overwrite if we're explicitly setting that field
      if (key !== 'imagesOrder' && this.internalImages.length > 0) {
        const idsToDelete = new Set(this.imagesToDeleteList)
        const currentOrder = this.internalImages
          .filter((image) => image.type === 'existing' && image.id && !idsToDelete.has(image.id))
          .map((image) => image.id)
        if (currentOrder.length > 0) {
          base.imagesOrder = currentOrder
        }
      }
      console.log('[MediaCreditsSection] updateField:', key, 'value:', value)
      if (key === 'images') {
        console.log('[MediaCreditsSection] updateField: emitting images array with', Array.isArray(value) ? value.length : 0, 'items')
        console.log('[MediaCreditsSection] updateField: images details:', Array.isArray(value) ? value.map(img => ({ type: img.type, hasFile: !!img.file, name: img.name })) : 'not an array')
      }
      if (key === 'imagesToDelete' || key === 'imagesOrder') {
        console.log('[MediaCreditsSection] updateField: emitting', key, 'with value:', value)
        console.log('[MediaCreditsSection] updateField: base.imagesToDelete:', base.imagesToDelete)
        console.log('[MediaCreditsSection] updateField: base.imagesOrder:', base.imagesOrder)
      }
      this.$emit('update:modelValue', base)
    }
  }
}
</script>

<style scoped>
.media-credits {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.upload-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.upload-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.upload-hint-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.upload-area.is-dragging {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.upload-area.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-content {
  color: var(--text-secondary);
}

.upload-content i {
  font-size: 28px;
  margin-bottom: var(--spacing-sm);
}

.upload-content span {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-content small {
  display: block;
  color: var(--text-light);
}

.upload-error {
  margin-top: var(--spacing-xs);
  color: var(--error-color, #ef4444);
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs);
}

.upload-error i {
  font-size: var(--font-size-sm);
}

.media-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.media-card {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  transition: box-shadow var(--transition-normal);
}

.media-card.dragging {
  opacity: 0.6;
}

.drag-handle {
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: grab;
  font-size: 18px;
}

.media-card-preview {
  width: 140px;
  height: 100px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-card-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--font-size-2xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge.existing {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.badge.new {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.filename {
  font-weight: 600;
  color: var(--text-primary);
}

.media-card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.text-button {
  border: none;
  background: transparent;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
}

.text-button.danger {
  color: var(--error-color);
}

.reorder-buttons {
  display: inline-flex;
  gap: var(--spacing-2xs);
}

.reorder-buttons button {
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.reorder-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reorder-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.media-empty {
  text-align: center;
  color: var(--text-secondary);
  margin: 0;
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  gap: var(--spacing-sm);
}

.actions-row.space-between {
  justify-content: space-between;
}

.ghost-button {
  border: 1px dashed var(--border-medium);
  background: transparent;
  color: var(--text-secondary);
  padding: var(--spacing-2xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.ghost-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ghost-button:not(:disabled):hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-left: auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.col {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

input,
textarea,
select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.social-entry {
  margin-top: var(--spacing-xs);
  display: flex;
  gap: var(--spacing-sm);
}

.social-entry input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.social-entry input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.add-btn {
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-weight: 600;
  transition: filter var(--transition-normal);
}

.add-btn:hover:enabled {
  filter: brightness(0.95);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-helper {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0 0;
}

.social-error {
  color: var(--error-color, #ef4444);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2xs);
}

.social-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-sm) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.social-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  font-size: var(--font-size-sm);
}

.remove-social {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm);
}
</style>

