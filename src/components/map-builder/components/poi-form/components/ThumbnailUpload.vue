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
      <img :src="imagePreview" alt="Thumbnail preview" crossorigin="anonymous" />
      <div class="image-actions">
        <button type="button" class="action-button edit-button" @click.stop="openCropper" aria-label="Edit image">
          <i class="fas fa-crop-alt"></i>
        </button>
        <button type="button" class="action-button remove-button" @click.stop="removeImage" aria-label="Remove image">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Image Cropper Modal -->
  <Teleport to="body">
    <div v-if="showCropper" class="cropper-overlay" @click.self="cancelCrop">
      <div class="cropper-modal">
        <div class="cropper-header">
          <h3>Crop Thumbnail</h3>
          <p>Drag to pan, scroll or pinch to zoom</p>
        </div>
        
        <div class="cropper-container" ref="cropperContainer">
          <div 
            class="cropper-image-wrapper"
            ref="imageWrapper"
            @mousedown="startDrag"
            @touchstart="handleTouchStart"
            @wheel.prevent="handleWheel"
          >
            <img 
              ref="cropperImage"
              :src="originalImageData"
              :style="imageTransformStyle"
              @load="onImageLoad"
              @error="onImageError"
              crossorigin="anonymous"
              draggable="false"
            />
          </div>
          <div class="crop-overlay">
            <div class="crop-area" :style="cropAreaStyle">
              <div class="crop-corner top-left"></div>
              <div class="crop-corner top-right"></div>
              <div class="crop-corner bottom-left"></div>
              <div class="crop-corner bottom-right"></div>
              <div class="crop-grid">
                <div class="grid-line horizontal"></div>
                <div class="grid-line horizontal"></div>
                <div class="grid-line vertical"></div>
                <div class="grid-line vertical"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="cropper-controls">
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" :disabled="scale <= minScale">
              <i class="fas fa-minus"></i>
            </button>
            <div class="zoom-slider-container">
              <input 
                type="range" 
                class="zoom-slider"
                :min="minScale" 
                :max="maxScale" 
                :step="0.01"
                v-model.number="scale"
              />
            </div>
            <button class="zoom-btn" @click="zoomIn" :disabled="scale >= maxScale">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <button class="reset-btn" @click="resetTransform">
            <i class="fas fa-undo"></i>
            Reset
          </button>
        </div>
        
        <div class="cropper-footer">
          <button class="btn btn-secondary" @click="cancelCrop">Cancel</button>
          <button class="btn btn-primary" @click="applyCrop">
            <i class="fas fa-check"></i>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import apiService from '@/services/api.js'

export default {
  name: 'ThumbnailUpload',
  props: {
    label: {
      type: String,
      default: 'Thumbnail'
    },
    placeholder: {
      type: String,
      default: 'Upload map thumbnail'
    },
    modelValue: {
      type: [File, String],
      default: null
    },
    aspectRatio: {
      type: Number,
      default: 16 / 9 // Default aspect ratio for thumbnails
    },
    outputWidth: {
      type: Number,
      default: 800 // Output image width in pixels
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      imagePreview: null,
      isDragging: false,
      showCropper: false,
      originalImageData: null,
      originalFile: null,
      // Transform state
      scale: 1,
      minScale: 0.5,
      maxScale: 3,
      translateX: 0,
      translateY: 0,
      // Drag state
      isDraggingImage: false,
      dragStartX: 0,
      dragStartY: 0,
      lastTranslateX: 0,
      lastTranslateY: 0,
      // Touch state
      lastTouchDistance: 0,
      // Image dimensions
      imageWidth: 0,
      imageHeight: 0,
      containerWidth: 0,
      containerHeight: 0,
      cropAreaWidth: 0,
      cropAreaHeight: 0
    }
  },
  computed: {
    hasImage() {
      return this.imagePreview !== null
    },
    imageTransformStyle() {
      return {
        transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`,
        transformOrigin: 'center center'
      }
    },
    cropAreaStyle() {
      return {
        width: `${this.cropAreaWidth}px`,
        height: `${this.cropAreaHeight}px`
      }
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
    },
    showCropper(visible) {
      if (visible) {
        document.addEventListener('mousemove', this.onDrag)
        document.addEventListener('mouseup', this.endDrag)
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false })
        document.addEventListener('touchend', this.handleTouchEnd)
        this.$nextTick(() => {
          this.calculateCropArea()
        })
      } else {
        document.removeEventListener('mousemove', this.onDrag)
        document.removeEventListener('mouseup', this.endDrag)
        document.removeEventListener('touchmove', this.handleTouchMove)
        document.removeEventListener('touchend', this.handleTouchEnd)
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.endDrag)
    document.removeEventListener('touchmove', this.handleTouchMove)
    document.removeEventListener('touchend', this.handleTouchEnd)
  },
  methods: {
    handleClick() {
      if (!this.hasImage) {
        this.$refs.fileInput.click()
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        this.originalFile = file
        this.loadImageForCropping(file)
      }
    },
    loadImageForCropping(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.originalImageData = e.target.result
        this.resetTransform()
        this.showCropper = true
      }
      reader.readAsDataURL(file)
    },
    createPreview(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    openCropper() {
      if (this.modelValue instanceof File) {
        this.originalFile = this.modelValue
        this.loadImageForCropping(this.modelValue)
      } else if (typeof this.modelValue === 'string' && this.modelValue) {
        // For existing URL images, fetch as blob to avoid CORS/tainted canvas issues
        this.loadImageFromUrl(this.modelValue)
      }
    },
    async loadImageFromUrl(url) {
      // Try multiple strategies to load the image
      const strategies = [
        // Strategy 1: Load via img element and convert to blob (works with CORS configured)
        () => this.fetchImageAsBlobViaImg(url),
        // Strategy 2: Try direct fetch with CORS (works if backend has CORS configured)
        () => this.fetchImageAsBlob(url),
      ]
      
      for (const strategy of strategies) {
        try {
          const result = await strategy()
          if (result) {
            this.originalImageData = result.dataUrl
            this.originalFile = result.file
            this.resetTransform()
            this.showCropper = true
            return
          }
        } catch (error) {
          console.warn('Image load strategy failed:', error.message)
          // Try next strategy
        }
      }
      
      // All strategies failed
      console.error('All image loading strategies failed for:', url)
      
      // Check if it's a Google Cloud Storage URL (likely CORS issue)
      const isGcsUrl = url && url.includes('storage.googleapis.com')
      const errorMessage = isGcsUrl
        ? 'Unable to load the existing image for cropping due to CORS restrictions. Please upload a new image file to crop it.'
        : 'Could not load the image for editing. Please upload a new image instead.'
      
      this.showCropperError(errorMessage)
    },
    async fetchImageAsBlobViaImg(url) {
      // Load image via img element and convert to blob using canvas
      // This works for public images even with CORS restrictions
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          try {
            // Create canvas and draw image
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  resolve({
                    dataUrl: e.target.result,
                    file: new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
                  })
                }
                reader.onerror = () => reject(new Error('Failed to read blob'))
                reader.readAsDataURL(blob)
              } else {
                reject(new Error('Failed to create blob from canvas'))
              }
            }, 'image/jpeg', 0.95)
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }
        
        // Set timeout to avoid hanging
        setTimeout(() => {
          reject(new Error('Image load timeout'))
        }, 10000)
        
        img.src = url
      })
    },
    async fetchImageAsBlob(url) {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      const blob = await response.blob()
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            dataUrl: e.target.result,
            file: new File([blob], 'thumbnail.jpg', { type: blob.type || 'image/jpeg' })
          })
        }
        reader.onerror = () => reject(new Error('Failed to read blob'))
        reader.readAsDataURL(blob)
      })
    },
    showCropperError(message) {
      // Show user-friendly error - could integrate with toast system
      // For Google Cloud Storage images with CORS issues, provide helpful guidance
      if (message.includes('Could not load the image')) {
        const userMessage = 'Unable to load the existing image for cropping due to CORS restrictions. Please upload a new image file to crop it.'
        alert(userMessage)
        // Optionally trigger file input to make it easier for user
        this.$nextTick(() => {
          if (this.$refs.fileInput) {
            this.$refs.fileInput.click()
          }
        })
      } else {
        alert(message)
      }
    },
    removeImage() {
      this.imagePreview = null
      this.originalImageData = null
      this.originalFile = null
      this.$emit('update:modelValue', null)
      this.$emit('change', null)
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    cancelCrop() {
      this.showCropper = false
      // If no image was set yet, clear the file input
      if (!this.imagePreview) {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      }
    },
    onImageLoad() {
      const img = this.$refs.cropperImage
      if (img) {
        this.imageWidth = img.naturalWidth
        this.imageHeight = img.naturalHeight
        this.calculateCropArea()
        this.fitImageToCropArea()
      }
    },
    onImageError(event) {
      console.error('Failed to load image in cropper:', event)
      // If image fails to load with crossorigin, try without it
      const img = event.target
      if (img.crossOrigin) {
        img.crossOrigin = null
        img.src = this.originalImageData
      }
    },
    calculateCropArea() {
      const container = this.$refs.cropperContainer
      if (!container) return
      
      this.containerWidth = container.clientWidth
      this.containerHeight = container.clientHeight
      
      // Calculate crop area to fit within container while maintaining aspect ratio
      const containerAspect = this.containerWidth / this.containerHeight
      const targetAspect = this.aspectRatio
      
      const padding = 40 // Padding around crop area
      const availableWidth = this.containerWidth - padding * 2
      const availableHeight = this.containerHeight - padding * 2
      
      if (targetAspect > availableWidth / availableHeight) {
        // Width constrained
        this.cropAreaWidth = availableWidth
        this.cropAreaHeight = availableWidth / targetAspect
      } else {
        // Height constrained
        this.cropAreaHeight = availableHeight
        this.cropAreaWidth = availableHeight * targetAspect
      }
    },
    fitImageToCropArea() {
      if (!this.imageWidth || !this.imageHeight || !this.cropAreaWidth || !this.cropAreaHeight) return
      
      const imageAspect = this.imageWidth / this.imageHeight
      const cropAspect = this.cropAreaWidth / this.cropAreaHeight
      
      // Calculate scale to fit image to cover crop area
      if (imageAspect > cropAspect) {
        // Image is wider - fit by height
        this.scale = this.cropAreaHeight / this.imageHeight
      } else {
        // Image is taller - fit by width
        this.scale = this.cropAreaWidth / this.imageWidth
      }
      
      // Ensure minimum scale
      this.minScale = this.scale * 0.5
      this.scale = Math.max(this.scale, this.minScale)
      
      // Center the image
      this.translateX = 0
      this.translateY = 0
    },
    resetTransform() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
      this.$nextTick(() => {
        this.fitImageToCropArea()
      })
    },
    // Mouse drag handlers
    startDrag(event) {
      event.preventDefault()
      this.isDraggingImage = true
      this.dragStartX = event.clientX
      this.dragStartY = event.clientY
      this.lastTranslateX = this.translateX
      this.lastTranslateY = this.translateY
    },
    onDrag(event) {
      if (!this.isDraggingImage) return
      
      const deltaX = event.clientX - this.dragStartX
      const deltaY = event.clientY - this.dragStartY
      
      this.translateX = this.lastTranslateX + deltaX
      this.translateY = this.lastTranslateY + deltaY
      
      this.constrainPosition()
    },
    endDrag() {
      this.isDraggingImage = false
    },
    // Touch handlers
    handleTouchStart(event) {
      if (event.touches.length === 1) {
        // Single touch - drag
        this.isDraggingImage = true
        this.dragStartX = event.touches[0].clientX
        this.dragStartY = event.touches[0].clientY
        this.lastTranslateX = this.translateX
        this.lastTranslateY = this.translateY
      } else if (event.touches.length === 2) {
        // Two fingers - pinch zoom
        this.lastTouchDistance = this.getTouchDistance(event.touches)
      }
    },
    handleTouchMove(event) {
      if (event.touches.length === 1 && this.isDraggingImage) {
        event.preventDefault()
        const deltaX = event.touches[0].clientX - this.dragStartX
        const deltaY = event.touches[0].clientY - this.dragStartY
        
        this.translateX = this.lastTranslateX + deltaX
        this.translateY = this.lastTranslateY + deltaY
        
        this.constrainPosition()
      } else if (event.touches.length === 2) {
        event.preventDefault()
        const currentDistance = this.getTouchDistance(event.touches)
        const scaleDelta = currentDistance / this.lastTouchDistance
        
        const newScale = Math.min(Math.max(this.scale * scaleDelta, this.minScale), this.maxScale)
        this.scale = newScale
        
        this.lastTouchDistance = currentDistance
        this.constrainPosition()
      }
    },
    handleTouchEnd() {
      this.isDraggingImage = false
      this.lastTouchDistance = 0
    },
    getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    },
    // Wheel zoom
    handleWheel(event) {
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale)
      this.scale = newScale
      this.constrainPosition()
    },
    // Zoom buttons
    zoomIn() {
      this.scale = Math.min(this.scale + 0.1, this.maxScale)
      this.constrainPosition()
    },
    zoomOut() {
      this.scale = Math.max(this.scale - 0.1, this.minScale)
      this.constrainPosition()
    },
    constrainPosition() {
      // Allow some movement but keep the image covering the crop area
      const scaledWidth = this.imageWidth * this.scale
      const scaledHeight = this.imageHeight * this.scale
      
      const maxX = Math.max(0, (scaledWidth - this.cropAreaWidth) / 2)
      const maxY = Math.max(0, (scaledHeight - this.cropAreaHeight) / 2)
      
      this.translateX = Math.max(-maxX, Math.min(maxX, this.translateX))
      this.translateY = Math.max(-maxY, Math.min(maxY, this.translateY))
    },
    async applyCrop() {
      try {
        const croppedFile = await this.generateCroppedImage()
        if (croppedFile) {
          this.createPreview(croppedFile)
          this.$emit('update:modelValue', croppedFile)
          this.$emit('change', croppedFile)
        }
        this.showCropper = false
      } catch (error) {
        console.error('Error applying crop:', error)
        // If it's a tainted canvas error, show user-friendly message
        if (error.name === 'SecurityError' || error.message?.includes('Tainted')) {
          alert('Unable to crop this image due to security restrictions. Please download the image and re-upload it.')
          this.showCropper = false
        }
      }
    },
    async generateCroppedImage() {
      return new Promise((resolve, reject) => {
        const img = this.$refs.cropperImage
        if (!img) {
          reject(new Error('Image not loaded'))
          return
        }
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Output dimensions
        const outputWidth = this.outputWidth
        const outputHeight = outputWidth / this.aspectRatio
        
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        // Calculate source rectangle in original image coordinates
        const scaledWidth = this.imageWidth * this.scale
        const scaledHeight = this.imageHeight * this.scale
        
        // The crop area center is at the container center
        // The image is offset by translateX, translateY from center
        const imageCenterX = this.containerWidth / 2 + this.translateX
        const imageCenterY = this.containerHeight / 2 + this.translateY
        
        // Crop area is centered in container
        const cropLeft = (this.containerWidth - this.cropAreaWidth) / 2
        const cropTop = (this.containerHeight - this.cropAreaHeight) / 2
        
        // Calculate source rectangle
        const sourceX = ((cropLeft - imageCenterX + scaledWidth / 2) / this.scale)
        const sourceY = ((cropTop - imageCenterY + scaledHeight / 2) / this.scale)
        const sourceWidth = this.cropAreaWidth / this.scale
        const sourceHeight = this.cropAreaHeight / this.scale
        
        // Draw the cropped portion
        try {
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, outputWidth, outputHeight
          )
        } catch (drawError) {
          reject(drawError)
          return
        }
        
        // Convert to blob - wrap in try-catch for tainted canvas errors
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = this.originalFile?.name || 'thumbnail.jpg'
              const file = new File([blob], fileName, { type: 'image/jpeg' })
              resolve(file)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.9)
        } catch (blobError) {
          reject(blobError)
        }
      })
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
        this.originalFile = file
        this.loadImageForCropping(file)
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
  cursor: default;
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
  border-radius: var(--radius-sm);
}

.image-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
}

.action-button {
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

.action-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.edit-button:hover {
  background: var(--primary-color);
}

.remove-button:hover {
  background: #ef4444;
}

/* Cropper Modal Styles */
.cropper-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  z-index: 20000;
}

.cropper-modal {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cropper-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  text-align: center;
}

.cropper-header h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.cropper-header p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.cropper-container {
  position: relative;
  flex: 1;
  min-height: 300px;
  max-height: 50vh;
  background: #1a1a1a;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-image-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
}

.cropper-image-wrapper:active {
  cursor: grabbing;
}

.cropper-image-wrapper img {
  max-width: none;
  max-height: none;
  user-select: none;
  pointer-events: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.crop-area {
  position: relative;
  border: 2px solid white;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-sm);
}

.crop-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid white;
}

.crop-corner.top-left {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 4px;
}

.crop-corner.top-right {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 4px;
}

.crop-corner.bottom-left {
  bottom: -3px;
  left: -3px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 4px;
}

.crop-corner.bottom-right {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 4px;
}

.crop-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.grid-line.horizontal {
  height: 1px;
  left: 0;
  right: 0;
}

.grid-line.horizontal:first-child {
  top: 33.33%;
}

.grid-line.horizontal:nth-child(2) {
  top: 66.66%;
}

.grid-line.vertical {
  width: 1px;
  top: 0;
  bottom: 0;
}

.grid-line.vertical:nth-child(3) {
  left: 33.33%;
}

.grid-line.vertical:nth-child(4) {
  left: 66.66%;
}

.cropper-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zoom-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-slider-container {
  width: 120px;
}

.zoom-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-light);
  border-radius: 2px;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.zoom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.reset-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.cropper-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .cropper-overlay {
    padding: 0;
  }

  .cropper-modal {
    max-width: 100%;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .cropper-container {
    max-height: 60vh;
  }

  .cropper-controls {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .zoom-slider-container {
    width: 100px;
  }
}
</style>
