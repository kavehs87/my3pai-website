<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="cropper-overlay" @click.self="handleCancel">
        <div class="cropper-modal">
          <div class="cropper-header">
            <h3>Crop Your Avatar</h3>
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
                :src="imageSrc"
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
            <button class="btn btn-secondary" @click="handleCancel">Cancel</button>
            <button class="btn btn-primary" @click="applyCrop" :disabled="cropping">
              <i v-if="cropping" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              {{ cropping ? 'Cropping...' : 'Apply Crop' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
export default {
  name: 'AvatarCropper',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    imageSrc: {
      type: String,
      default: ''
    }
  },
  emits: ['crop', 'cancel'],
  data() {
    return {
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
      cropAreaHeight: 0,
      cropping: false
    }
  },
  computed: {
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
    visible(newVal) {
      if (newVal) {
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
    },
    imageSrc() {
      if (this.visible && this.imageSrc) {
        this.$nextTick(() => {
          this.resetTransform()
        })
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
        img.src = this.imageSrc
      }
    },
    calculateCropArea() {
      const container = this.$refs.cropperContainer
      if (!container) return
      
      this.containerWidth = container.clientWidth
      this.containerHeight = container.clientHeight
      
      // Square crop area (1:1 aspect ratio for avatar)
      const padding = 40
      const availableWidth = this.containerWidth - padding * 2
      const availableHeight = this.containerHeight - padding * 2
      
      // Use the smaller dimension to ensure square fits
      const size = Math.min(availableWidth, availableHeight)
      this.cropAreaWidth = size
      this.cropAreaHeight = size
    },
    fitImageToCropArea() {
      if (!this.imageWidth || !this.imageHeight || !this.cropAreaWidth || !this.cropAreaHeight) return
      
      const imageAspect = this.imageWidth / this.imageHeight
      const cropAspect = this.cropAreaWidth / this.cropAreaHeight // Should be 1:1
      
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
      // Keep the image covering the crop area
      const scaledWidth = this.imageWidth * this.scale
      const scaledHeight = this.imageHeight * this.scale
      
      const maxX = Math.max(0, (scaledWidth - this.cropAreaWidth) / 2)
      const maxY = Math.max(0, (scaledHeight - this.cropAreaHeight) / 2)
      
      this.translateX = Math.max(-maxX, Math.min(maxX, this.translateX))
      this.translateY = Math.max(-maxY, Math.min(maxY, this.translateY))
    },
    handleCancel() {
      this.$emit('cancel')
    },
    async applyCrop() {
      this.cropping = true
      try {
        const croppedBlob = await this.generateCroppedImage()
        if (croppedBlob) {
          this.$emit('crop', croppedBlob)
        }
      } catch (error) {
        console.error('Error applying crop:', error)
        if (error.name === 'SecurityError' || error.message?.includes('Tainted')) {
          alert('Unable to crop this image due to security restrictions. Please download the image and re-upload it.')
        }
      } finally {
        this.cropping = false
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
        
        // Output dimensions - square 400x400 for avatar
        const outputWidth = 400
        const outputHeight = 400
        
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
        
        // Convert to blob
        try {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.92)
        } catch (blobError) {
          reject(blobError)
        }
      })
    }
  }
}
</script>

<style scoped>
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
  z-index: 2000;
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
  border-color: var(--secondary-color);
  color: var(--secondary-color);
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
  background: var(--secondary-color);
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
  background: var(--secondary-color);
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
  background: var(--secondary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
