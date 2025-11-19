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
          <div class="field-group">
            <label for="itinerary-title">Itinerary title <span>*</span></label>
            <input
              id="itinerary-title"
              type="text"
              v-model="formData.title"
              placeholder="Give this itinerary a name"
              :class="{ 'has-error': titleError }"
            />
            <p v-if="titleError" class="error-text">{{ titleError }}</p>
          </div>
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
  <transition name="fade">
    <div v-if="submissionState.active" class="submission-overlay">
      <div class="submission-card" role="status" aria-live="polite">
        <div
          class="submission-spinner"
          :class="{
            success: submissionState.success,
            error: !!submissionState.error
          }"
        >
          <span v-if="submissionState.success" class="spinner-icon">
            <i class="fas fa-check"></i>
          </span>
          <span v-else class="spinner-circle"></span>
        </div>
        <div class="submission-copy">
          <p class="submission-eyebrow">{{ submissionState.heading }}</p>
          <h3>{{ submissionState.message }}</h3>
          <p v-if="submissionState.detail">{{ submissionState.detail }}</p>
          <p v-if="submissionState.poiProgress" class="submission-progress">
            {{ submissionState.poiProgress }}
          </p>
          <p v-if="submissionState.error" class="submission-error">
            {{ submissionState.error }}
          </p>
        </div>
        <button
          v-if="submissionState.error"
          class="btn btn-outline submission-dismiss"
          @click="dismissSubmissionOverlay"
        >
          Close
        </button>
      </div>
    </div>
  </transition>
  </div>
</template>

<script>
import PlaceField from './add-itineraries/components/PlaceField.vue'
import ThumbnailUpload from './add-itineraries/components/ThumbnailUpload.vue'
import POIAccordion from './add-itineraries/components/POIAccordion.vue'
import apiService from '../../../services/api.js'
import { toast } from '../../../utils/toast.js'

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
    },
    initialItinerary: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'publish', 'save-draft', 'share'],
  data() {
    return {
      formData: {
        title: '',
        thumbnail: null,
        pointsOfInterest: []
      },
      showPOIForm: false,
      poiForm: this.createEmptyPOIForm(),
      editingPoiIndex: null,
      titleError: '',
      remoteItineraryId: null,
      pendingPoiDeletions: [],
      submissionState: {
        active: false,
        mode: null,
        heading: '',
        message: '',
        detail: '',
        poiProgress: '',
        error: null,
        success: false
      }
    }
  },
  watch: {
    initialItinerary: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.id) {
          this.hydrateFromItinerary(newValue)
        }
      }
    }
  },
  methods: {
    createEmptyPOIForm() {
      return {
        remoteId: null,
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
    hydrateFromItinerary(itinerary = {}) {
      const safeItinerary = itinerary || {}
      const pois = Array.isArray(safeItinerary.pois) ? safeItinerary.pois : []

      this.remoteItineraryId = safeItinerary.id || null
      this.formData.title = safeItinerary.title || ''
      this.formData.thumbnail = safeItinerary.thumbnailUrl || null
      this.titleError = ''
      this.pendingPoiDeletions = []
      this.editingPoiIndex = null

      this.formData.pointsOfInterest = pois.map((poi) => {
        const safePoi = poi || {}
        const cloneSection = (section) => this.deepClonePreservingFiles(section || {})

        return {
          id: safePoi.id,
          remoteId: safePoi.id,
          basic: cloneSection(safePoi.basic),
          category: cloneSection(safePoi.category),
          difficulty: cloneSection(safePoi.difficulty),
          pricing: cloneSection(safePoi.pricing),
          regions: cloneSection(safePoi.regions),
          amenities: cloneSection(safePoi.amenities),
          tips: cloneSection(safePoi.tips),
          media: cloneSection(safePoi.media),
          experience: cloneSection(safePoi.experience)
        }
      })

      this.resetPOIForm()
    },
    handleClose() {
      this.$emit('close')
    },
    async handlePublish() {
      if (!this.ensureTitleIsPresent()) return
      await this.submitItinerary({ mode: 'publish' })
    },
    async handleSaveDraft() {
      if (!this.ensureTitleIsPresent()) return
      await this.submitItinerary({ mode: 'draft' })
    },
    handleShare() {
      this.$emit('share')
    },
    handleOverlayClick() {
      this.handleClose()
    },
    handleAddPOI() {
      this.editingPoiIndex = null
      this.resetPOIForm()
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

      const [removedPoi] = this.formData.pointsOfInterest.splice(index, 1)
      if (removedPoi?.remoteId) {
        this.enqueuePoiDeletion(removedPoi.remoteId)
      }
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
        return this.deepClonePreservingFiles(source)
      } catch (error) {
        console.warn('Unable to clone POI data', error)
        return this.createEmptyPOIForm()
      }
    },
    resetPOIForm() {
      this.poiForm = this.clonePOIData()
    },
    ensureTitleIsPresent() {
      if (!this.formData.title.trim()) {
        this.titleError = 'Title is required'
        return false
      }
      this.titleError = ''
      return true
    },
    startSubmission(mode) {
      Object.assign(this.submissionState, {
        active: true,
        mode,
        heading: mode === 'publish' ? 'Publishing itinerary' : 'Saving draft',
        message: 'Preparing your itinerary…',
        detail: '',
        poiProgress: '',
        error: null,
        success: false
      })
    },
    updateSubmission(message, detail = '', poiProgress = '') {
      this.submissionState.message = message
      this.submissionState.detail = detail
      this.submissionState.poiProgress = poiProgress
    },
    dismissSubmissionOverlay() {
      Object.assign(this.submissionState, {
        active: false,
        mode: null,
        heading: '',
        message: '',
        detail: '',
        poiProgress: '',
        error: null,
        success: false
      })
    },
    handleSubmissionError(error) {
      const message = error?.message || 'Unable to save itinerary. Please try again.'
      Object.assign(this.submissionState, {
        error: message,
        detail: '',
        poiProgress: '',
        success: false
      })
      toast.error(message)
    },
    finishSubmission(mode) {
      const heading = mode === 'publish' ? 'Itinerary published' : 'Draft saved'
      const detail =
        mode === 'publish'
          ? 'Your itinerary and POIs are synced with My3PAI.'
          : 'We saved your progress. You can continue editing anytime.'
      Object.assign(this.submissionState, {
        success: true,
        message: heading,
        detail,
        poiProgress: '',
        error: null
      })
      toast.success(heading)
      if (mode === 'publish') {
        this.resetStateAfterPublish()
      }
      setTimeout(() => {
        this.dismissSubmissionOverlay()
      }, 1200)
    },
    async submitItinerary({ mode }) {
      if (this.submissionState.active) return false
      const trimmedTitle = (this.formData.title || '').trim()
      if (!trimmedTitle) {
        this.titleError = 'Title is required'
        return false
      }
      if (mode === 'publish' && !this.formData.pointsOfInterest.length) {
        toast.error('Add at least one point of interest before publishing.')
        return false
      }
      this.startSubmission(mode)
      try {
        const itineraryId = await this.ensureItineraryRecord(mode, trimmedTitle)
        await this.uploadItineraryThumbnailIfNeeded(itineraryId)
        await this.savePointsOfInterest(itineraryId)
        await this.flushPendingPoiDeletions()
        this.finishSubmission(mode)
        const payload = {
          itineraryId,
          mode,
          poiCount: this.formData.pointsOfInterest.length
        }
        this.$emit(mode === 'publish' ? 'publish' : 'save-draft', payload)
        return true
      } catch (error) {
        this.handleSubmissionError(error)
        return false
      }
    },
    async ensureItineraryRecord(mode, title) {
      const payload = { title }
      if (mode === 'publish') {
        payload.isPublished = true
      }
      if (!this.remoteItineraryId) {
        this.updateSubmission('Creating itinerary', 'Sending itinerary details')
        const response = await apiService.createItinerary(payload)
        const itinerary = this.extractItineraryFromResponse(response)
        if (!itinerary?.id) {
          throw new Error('Unable to create itinerary. Missing identifier.')
        }
        this.remoteItineraryId = itinerary.id
        return itinerary.id
      }
      this.updateSubmission(
        mode === 'publish' ? 'Publishing itinerary' : 'Updating itinerary',
        'Syncing itinerary details'
      )
      const response = await apiService.updateItinerary(this.remoteItineraryId, payload)
      const itinerary = this.extractItineraryFromResponse(response)
      if (!itinerary?.id) {
        throw new Error('Unable to update itinerary. Missing identifier.')
      }
      this.remoteItineraryId = itinerary.id
      return itinerary.id
    },
    async uploadItineraryThumbnailIfNeeded(itineraryId) {
      if (!(this.formData.thumbnail instanceof File)) {
        return
      }
      this.updateSubmission('Uploading thumbnail', 'Sending featured image')
      const response = await apiService.uploadItineraryThumbnail(itineraryId, this.formData.thumbnail)
      const itinerary = this.extractItineraryFromResponse(response)
      if (itinerary?.thumbnailUrl) {
        this.formData.thumbnail = itinerary.thumbnailUrl
      }
    },
    async savePointsOfInterest(itineraryId) {
      const points = this.formData.pointsOfInterest || []
      if (!points.length) return
      for (let index = 0; index < points.length; index += 1) {
        const poi = points[index]
        const label = this.formatPOITitle(poi)
        this.updateSubmission(
          `Saving ${label}`,
          'Syncing point of interest details',
          this.formatPoiProgressLabel(index + 1, points.length)
        )
        const payload = this.buildPoiPayload(poi)
        const isExisting = Boolean(poi.remoteId)
        const response = isExisting
          ? await apiService.updatePoi(itineraryId, poi.remoteId, payload)
          : await apiService.savePoi(itineraryId, payload)
        const remotePoi = this.extractPoiFromResponse(response)
        if (!remotePoi?.id) {
          throw new Error(`Unable to save ${label}. Missing identifier.`)
        }
        this.formData.pointsOfInterest[index].remoteId = remotePoi.id
        await this.uploadPoiMediaIfNeeded(this.formData.pointsOfInterest[index])
      }
    },
    buildPoiPayload(poi) {
      const source = this.clonePOIData(poi)
      const { id: _clientId, remoteId, ...rest } = source
      const payload = {
        ...rest,
        basic: this.normalizeBasicSection(rest.basic || {}),
        media: this.normalizeMediaSection(rest.media || {})
      }
      if (!Object.keys(payload.media || {}).length) {
        delete payload.media
      }
      delete payload.remoteId
      return payload
    },
    normalizeBasicSection(basic = {}) {
      const next = { ...basic }
      if ('latitude' in next) {
        next.latitude = this.toNullableNumber(next.latitude)
      }
      if ('longitude' in next) {
        next.longitude = this.toNullableNumber(next.longitude)
      }
      if (!next.pinAccuracy) {
        next.pinAccuracy = 'exact'
      }
      return next
    },
    normalizeMediaSection(media = {}) {
      const { images, ...rest } = media || {}
      return rest
    },
    toNullableNumber(value) {
      if (value === null || value === undefined || value === '') return null
      const number = Number(value)
      return Number.isFinite(number) ? number : null
    },
    formatPoiProgressLabel(current, total) {
      return `POI ${current} of ${total}`
    },
    async uploadPoiMediaIfNeeded(poi) {
      const files = this.getPoiMediaFiles(poi)
      if (!files.length || !poi.remoteId) {
        return
      }
      this.updateSubmission(
        `Uploading media for ${this.formatPOITitle(poi)}`,
        'Sending media assets'
      )
      const response = await apiService.uploadPoiMedia(poi.remoteId, files)
      this.ensureApiSuccess(response, 'Unable to upload media for this POI.')
    },
    getPoiMediaFiles(poi) {
      const images = poi?.media?.images || []
      return images.filter((file) => this.isFileLikeValue(file))
    },
    async flushPendingPoiDeletions() {
      if (!this.pendingPoiDeletions.length) return
      if (!this.remoteItineraryId) {
        console.warn('Cannot delete POIs without a remote itinerary id.')
        return
      }
      const queue = [...this.pendingPoiDeletions]
      this.pendingPoiDeletions = []
      for (let index = 0; index < queue.length; index += 1) {
        const poiId = queue[index]
        this.updateSubmission(
          'Removing POI',
          'Cleaning up deleted points of interest',
          `Deleting ${index + 1} of ${queue.length}`
        )
        const response = await apiService.deletePoi(this.remoteItineraryId, poiId)
        if (!response?.success) {
          this.pendingPoiDeletions.push(...queue.slice(index))
          throw new Error(response?.error || 'Unable to delete point of interest.')
        }
      }
    },
    enqueuePoiDeletion(remoteId) {
      if (!remoteId) return
      if (!this.pendingPoiDeletions.includes(remoteId)) {
        this.pendingPoiDeletions.push(remoteId)
      }
    },
    extractItineraryFromResponse(response) {
      if (!response?.success) {
        throw new Error(response?.error || 'Itinerary request failed.')
      }
      const payload = response.data || {}
      return payload.data?.itinerary || payload.itinerary || payload.data || payload
    },
    extractPoiFromResponse(response) {
      if (!response?.success) {
        throw new Error(response?.error || 'POI request failed.')
      }
      const payload = response.data || {}
      return payload.data?.poi || payload.poi || payload.data || payload
    },
    ensureApiSuccess(response, fallbackMessage) {
      if (response?.success) return response.data
      throw new Error(response?.error || fallbackMessage)
    },
    resetStateAfterPublish() {
      this.formData = {
        title: '',
        thumbnail: null,
        pointsOfInterest: []
      }
      this.remoteItineraryId = null
      this.pendingPoiDeletions = []
      this.editingPoiIndex = null
      this.showPOIForm = false
      this.resetPOIForm()
    },
    deepClonePreservingFiles(value) {
      if (value === null || typeof value !== 'object') {
        return value
      }
      if (this.isFileLikeValue(value)) {
        return value
      }
      if (Array.isArray(value)) {
        return value.map((entry) => this.deepClonePreservingFiles(entry))
      }
      const result = {}
      Object.keys(value || {}).forEach((key) => {
        result[key] = this.deepClonePreservingFiles(value[key])
      })
      return result
    },
    isFileLikeValue(value) {
      return (
        (typeof File !== 'undefined' && value instanceof File) ||
        (typeof Blob !== 'undefined' && value instanceof Blob)
      )
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

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.field-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.field-group label span {
  color: var(--error-color, #ef4444);
}

.field-group input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.field-group input.has-error {
  border-color: var(--error-color, #ef4444);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.15);
}

.error-text {
  color: var(--error-color, #ef4444);
  font-size: var(--font-size-xs);
  margin: 0;
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

/* Submission overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.submission-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 20, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  z-index: 12000;
}

.submission-card {
  width: min(420px, 100%);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
}

.submission-spinner {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  margin: 0 auto;
}

.submission-spinner .spinner-circle {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: submission-spin 0.9s linear infinite;
}

.submission-spinner.success {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
}

.submission-spinner.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.submission-spinner .spinner-icon {
  font-size: 24px;
}

.submission-copy h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.submission-copy p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.submission-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: var(--font-size-2xs);
  color: var(--text-light);
  margin-bottom: var(--spacing-xs);
}

.submission-progress {
  font-weight: 600;
  color: var(--text-primary);
  margin-top: var(--spacing-sm);
}

.submission-error {
  color: var(--error-color, #ef4444);
  font-weight: 600;
  margin-top: var(--spacing-sm);
}

.submission-dismiss {
  align-self: flex-end;
}

@keyframes submission-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

