<template>
  <div class="add-itinerary-root">
  <div v-if="visible" class="add-place-overlay" @click.self="handleOverlayClick">
    <div class="add-place-modal">
      <div class="modal-header">
        <h2 class="modal-title">Add Itinerary</h2>
        <button class="close-button" @click="handleClose" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-content">
        <!-- Add itinerary form content -->
        <div class="form-section">
          <ThumbnailUpload
            label="Thumbnail"
            placeholder="Upload itinerary thumbnail"
            v-model="formData.thumbnail"
          />
          <div v-if="formData.pointsOfInterest.length" class="poi-list">
            <div
              v-for="(poi, index) in formData.pointsOfInterest"
              :key="poi.id || index"
              class="poi-card"
            >
              <div class="poi-card-content">
                <div class="poi-card-title">{{ formatPOITitle(poi) }}</div>
                <div class="poi-card-meta">
                  <span v-if="formatPOICategory(poi)">{{ formatPOICategory(poi) }}</span>
                  <span v-if="formatPOIRegion(poi)">
                    <span v-if="formatPOICategory(poi)"> • </span>{{ formatPOIRegion(poi) }}
                  </span>
                </div>
              </div>
              <div class="poi-card-actions">
                <button class="text-button" @click="editPOI(index)">Edit</button>
                <button class="text-button danger" @click="removePOI(index)">Delete</button>
              </div>
            </div>
          </div>
          <PlaceField
            :text="formData.pointsOfInterest.length ? 'Add another point of interest' : 'Add your first point of interest'"
            icon="fas fa-map-marker-alt"
            :item-count="0"
            @click="handleAddPOI"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleShare">
          <i class="fas fa-share"></i>
          Share
        </button>
        <button class="btn btn-outline" @click="handleSaveDraft">
          <i class="fas fa-save"></i>
          Save Draft
        </button>
        <button class="btn btn-primary" @click="handlePublish">
          <i class="fas fa-paper-plane"></i>
          Publish
        </button>
      </div>
    </div>
  </div>
  <POIAccordion
    v-model="poiForm"
    :visible="showPOIForm"
    @close="handlePOIModalClose"
    @save="handlePOISave"
    @save-and-add="handlePOISaveAndAddAnother"
  />
  </div>
</template>

<script>
import PlaceField from './add-itineraries/components/PlaceField.vue'
import ThumbnailUpload from './add-itineraries/components/ThumbnailUpload.vue'
import POIAccordion from './add-itineraries/components/POIAccordion.vue'

export default {
  name: 'AddItinerary',
  components: {
    PlaceField,
    ThumbnailUpload,
    POIAccordion
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'publish', 'save-draft', 'share'],
  data() {
    return {
      formData: {
        thumbnail: null,
        pointsOfInterest: []
      },
      showPOIForm: false,
      poiForm: this.createEmptyPOIForm(),
      editingPoiIndex: null
    }
  },
  methods: {
    createEmptyPOIForm() {
      return {
        basic: {
          name: '',
          tagline: '',
          summary: '',
          country: '',
          region: '',
          landmark: '',
          pinAccuracy: '',
          latitude: '',
          longitude: ''
        },
        category: {},
        difficulty: {},
        pricing: {},
        regions: {},
        amenities: {},
        tips: {},
        media: {},
        experience: {}
      }
    },
    handleClose() {
      this.$emit('close')
    },
    handlePublish() {
      this.$emit('publish')
    },
    handleSaveDraft() {
      this.$emit('save-draft')
    },
    handleShare() {
      this.$emit('share')
    },
    handleOverlayClick() {
      this.handleClose()
    },
    handleAddPOI() {
      this.editingPoiIndex = null
      // this.poiForm = this.clonePOIData()
      this.showPOIForm = true
    },
    handlePOIModalClose() {
      this.showPOIForm = false
      this.editingPoiIndex = null
      // this.poiForm = this.clonePOIData()
    },
    handlePOISave(poiData = this.poiForm, options = {}) {
      const { keepOpen = false } = options
      const isEdit = this.editingPoiIndex !== null
      const existingEntry = isEdit ? this.formData.pointsOfInterest[this.editingPoiIndex] : null
      const payload = {
        id: existingEntry && existingEntry.id ? existingEntry.id : Date.now(),
        ...this.clonePOIData(poiData)
      }

      if (isEdit) {
        this.formData.pointsOfInterest.splice(this.editingPoiIndex, 1, payload)
      } else {
        this.formData.pointsOfInterest.push(payload)
      }

      this.editingPoiIndex = null
      this.poiForm = this.clonePOIData()
      this.showPOIForm = keepOpen
      if (!keepOpen) {
        this.showPOIForm = false
      }
    },
    handlePOISaveAndAddAnother(poiData) {
      this.handlePOISave(poiData, { keepOpen: true })
    },
    editPOI(index) {
      const existing = this.formData.pointsOfInterest[index] || this.createEmptyPOIForm()
      this.editingPoiIndex = index
      this.poiForm = this.clonePOIData(existing)
      this.showPOIForm = true
    },
    removePOI(index) {
      if (index < 0 || index >= this.formData.pointsOfInterest.length) return

      this.formData.pointsOfInterest.splice(index, 1)
      if (this.editingPoiIndex === index) {
        this.editingPoiIndex = null
      } else if (this.editingPoiIndex !== null && index < this.editingPoiIndex) {
        this.editingPoiIndex -= 1
      }
    },
    formatPOITitle(poi) {
      return (poi && poi.basic && poi.basic.name) || 'Untitled point'
    },
    formatPOICategory(poi) {
      return poi && poi.category && poi.category.placeType
    },
    formatPOIRegion(poi) {
      return poi && poi.regions && poi.regions.primaryRegion
    },
    clonePOIData(poi) {
      const source = poi || this.createEmptyPOIForm()
      try {
        return JSON.parse(JSON.stringify(source))
      } catch (error) {
        return this.createEmptyPOIForm()
      }
    }
  }
}

</script>

<style scoped>
.add-place-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  z-index: 10000;
  padding: var(--spacing-md);
  animation: fadeIn 0.2s ease-out;
  pointer-events: none;
}

.add-place-overlay > * {
  pointer-events: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.add-place-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  height: calc(100vh - var(--spacing-md) * 2 - var(--spacing-md));
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
  margin: var(--spacing-md);
  margin-bottom: calc(var(--spacing-md) + var(--spacing-sm));
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  width: 32px;
  height: 32px;
}

.close-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.poi-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.poi-card {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  transition: border-color var(--transition-normal), background var(--transition-normal);
}

.poi-card:hover {
  border-color: var(--border-medium);
  background: var(--bg-tertiary);
}

.poi-card-title {
  font-weight: 600;
  color: var(--text-primary);
}

.poi-card-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.poi-card-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.text-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  padding: var(--spacing-2xs) var(--spacing-xs);
}

.text-button.danger {
  color: #f87171;
}

.text-button:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
  flex-wrap: wrap;
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
  white-space: nowrap;
}

.btn i {
  font-size: var(--font-size-sm);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.btn-outline:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
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
  .add-place-modal {
    max-width: 100%;
    height: calc(100vh - var(--spacing-md) * 2 - var(--spacing-md));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    margin-bottom: calc(var(--spacing-md) + var(--spacing-sm));
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--spacing-md);
  }
}
</style>

