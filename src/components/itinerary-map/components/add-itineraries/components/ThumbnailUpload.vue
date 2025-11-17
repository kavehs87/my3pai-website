<template>
  <div class="thumbnail-upload" :class="{ 'has-image': hasImage, 'is-dragging': isDragging }" 
       @click="handleClick"
       @dragover.prevent="handleDragOver"
       @dragleave.prevent="handleDragLeave"
       @drop.prevent="handleDrop">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <div class="field-label" v-if="label">{{ label }}</div>
    
    <div v-if="!hasImage" class="upload-placeholder">
      <div class="upload-icon">
        <i class="fas fa-image"></i>
      </div>
      <p class="upload-text">{{ placeholder }}</p>
      <p class="upload-hint">Click or drag to upload</p>
    </div>
    
    <div v-else class="image-preview">
      <img :src="imagePreview" alt="Thumbnail preview" />
      <button class="remove-button" @click.stop="removeImage" aria-label="Remove image">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThumbnailUpload',
  props: {
    label: {
      type: String,
      default: 'Thumbnail'
    },
    placeholder: {
      type: String,
      default: 'Upload itinerary thumbnail'
    },
    modelValue: {
      type: [File, String],
      default: null
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      imagePreview: null,
      isDragging: false
    }
  },
  computed: {
    hasImage() {
      return this.imagePreview !== null
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue instanceof File) {
          this.createPreview(newValue)
        } else if (typeof newValue === 'string' && newValue) {
          this.imagePreview = newValue
        } else {
          this.imagePreview = null
        }
      }
    }
  },
  methods: {
    handleClick() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        this.$emit('update:modelValue', file)
        this.$emit('change', file)
        this.createPreview(file)
      }
    },
    createPreview(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    removeImage() {
      this.imagePreview = null
      this.$emit('update:modelValue', null)
      this.$emit('change', null)
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    handleDragOver(event) {
      event.preventDefault()
      this.isDragging = true
    },
    handleDragLeave() {
      this.isDragging = false
    },
    handleDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.$emit('update:modelValue', file)
        this.$emit('change', file)
        this.createPreview(file)
      }
    }
  }
}
</script>

<style scoped>
.thumbnail-upload {
  background: var(--bg-secondary);
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-height: 110px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  position: relative;
  overflow: visible;
}

.thumbnail-upload:hover {
  border-color: var(--border-medium);
  background: var(--bg-tertiary);
}

.thumbnail-upload.has-image {
  border-style: solid;
  border-color: var(--border-medium);
  background: var(--bg-primary);
  padding: 0;
}

.thumbnail-upload.is-dragging {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
  border-style: solid;
}

.field-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
}

.upload-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0px;
  padding: 0;
  text-align: center;
}

.upload-icon {
  font-size: 24px;
  color: var(--text-secondary);
  opacity: 0.6;
  margin-bottom: 0;
}

.upload-text {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  font-weight: 500;
  margin: 0;
}

.upload-hint {
  font-size: var(--font-size-3xs);
  color: var(--text-secondary);
  opacity: 0.7;
  margin: 0;
}

.image-preview {
  position: relative;
  width: 100%;
  min-height: 110px;
  padding: var(--spacing-xs);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.remove-button {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all var(--transition-normal);
  z-index: 10;
}

.remove-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}
</style>

