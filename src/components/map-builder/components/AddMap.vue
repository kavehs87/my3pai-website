<template>
  <div class="add-map-root">
    <!-- Map Form Panel - shown when not editing POI -->
    <div v-if="!showPOIForm" class="add-map-panel">
      <div class="panel-header">
        <button class="back-button" @click="handleGoBack" aria-label="Back to maps">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-content">
          <h2 class="panel-title">{{ isEditingMap ? 'Edit Map' : 'Add Map' }}</h2>
        </div>
      </div>

      <div class="panel-content">
        <!-- Add map form content -->
        <div class="form-section">
          <div class="field-group">
            <label for="map-title">Map title <span>*</span></label>
            <input
              id="map-title"
              type="text"
              v-model="formData.title"
              placeholder="Give this map a name"
              :class="{ 'has-error': titleError }"
            />
            <p v-if="titleError" class="error-text">{{ titleError }}</p>
          </div>
          <ThumbnailUpload
            label="Thumbnail"
            placeholder="Upload map thumbnail"
            v-model="formData.thumbnail"
          />
          <div class="pricing-section">
            <div class="pricing-toggle-card">
              <div class="pricing-toggle-header">
                <div class="pricing-toggle-info">
                  <h3 class="pricing-toggle-title">Sell this map</h3>
                  <p class="pricing-toggle-subtitle">Allow users to purchase access to this map</p>
                </div>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="formData.isForSale"
                    class="toggle-switch-input"
                  />
                  <span class="toggle-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="formData.isForSale" class="field-group">
            <label for="map-price">Price <span>*</span></label>
            <div class="price-input-wrapper">
              <span class="price-currency">$</span>
              <input
                id="map-price"
                type="number"
                v-model.number="formData.price"
                placeholder="0.00"
                min="0"
                step="0.01"
                :class="{ 'has-error': priceError }"
                class="price-input"
              />
            </div>
            <p v-if="priceError" class="error-text">{{ priceError }}</p>
            <p v-else class="field-hint">Set the price users will pay to access this map</p>
          </div>
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

      <div class="panel-footer">
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

    <!-- POI Accordion Panel - shown when editing/adding POI -->
    <POIAccordion
      v-else
      v-model="poiForm"
      :visible="showPOIForm"
      :is-editing="editingPoiIndex !== null"
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
import PlaceField from './poi-form/components/PlaceField.vue'
import ThumbnailUpload from './poi-form/components/ThumbnailUpload.vue'
import POIAccordion from './poi-form/components/POIAccordion.vue'
import apiService from '../../../services/api.js'
import { toast } from '../../../utils/toast.js'

export default {
  name: 'AddMap',
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
    initialMap: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'publish', 'save-draft', 'share', 'pois-updated'],
  data() {
    return {
      formData: {
        title: '',
        thumbnail: null,
        pointsOfInterest: [],
        isForSale: false,
        price: null
      },
      originalThumbnailUrl: null,
      showPOIForm: false,
      poiForm: this.createEmptyPOIForm(),
      editingPoiIndex: null,
      titleError: '',
      priceError: '',
      remoteMapId: null,
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
  computed: {
    isEditingMap() {
      return Boolean(this.remoteMapId || this.initialMap?.id)
    }
  },
  watch: {
    initialMap: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.id) {
          this.hydrateFromMap(newValue)
        }
      }
    },
    'formData.pointsOfInterest': {
      deep: true,
      handler() {
        // Emit POI updates to parent (MapBuilder) so it can update markers
        this.$emit('pois-updated', this.formData.pointsOfInterest)
      }
    }
  },
  methods: {
    handleGoBack() {
      // Navigate back to profile maps page
      if (this.$router) {
        // Check if there's history to go back to
        if (window.history.length > 1) {
          this.$router.back()
        } else {
          // Fallback to profile maps page
          this.$router.push({ path: '/profile', query: { tab: 'maps' } })
        }
      } else {
        window.location.href = '/profile?tab=maps'
      }
    },
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
          longitude: '',
          audioFile: null,
          audioId: null,
          pdfFile: null,
          pdfId: null
        },
        category: {},
        difficulty: {},
        pricing: {},
        regions: {},
        amenities: {},
        tips: {},
        media: this.createEmptyMediaSection(),
        experience: {}
      }
    },
    createEmptyMediaSection() {
      return {
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
      }
    },
    hydrateFromMap(map = {}) {
      const safeMap = map || {}
      const pois = Array.isArray(safeMap.pois) ? safeMap.pois : []

      this.remoteMapId = safeMap.id || null
      this.formData.title = safeMap.title || ''
      this.formData.thumbnail = safeMap.thumbnailUrl || null
      this.originalThumbnailUrl = safeMap.thumbnailUrl || null
      this.formData.isForSale = safeMap.isForSale || false
      // Convert price string to number if it exists (backend returns as string)
      this.formData.price = safeMap.price ? parseFloat(safeMap.price) : null
      this.titleError = ''
      this.priceError = ''
      this.pendingPoiDeletions = []
      this.editingPoiIndex = null

      this.formData.pointsOfInterest = pois.map((poi) => {
        const safePoi = poi || {}
        const cloneSection = (section) => this.deepClonePreservingFiles(section || {})
        const basicSection = cloneSection(safePoi.basic)
        const mediaSection = cloneSection(safePoi.media)

        // Extract audio URL from media.audio if it exists
        if (mediaSection?.audio?.url) {
          basicSection.audioFile = mediaSection.audio.url
          basicSection.audioId = mediaSection.audio.id // Store ID to track if it needs to be replaced
        }

        // Extract PDF URL from media.pdf if it exists
        if (mediaSection?.pdf?.url) {
          basicSection.pdfFile = mediaSection.pdf.url
          basicSection.pdfId = mediaSection.pdf.id // Store ID to track if it needs to be replaced
        }

        return {
          id: safePoi.id,
          remoteId: safePoi.id,
          basic: basicSection,
          category: cloneSection(safePoi.category),
          difficulty: cloneSection(safePoi.difficulty),
          pricing: cloneSection(safePoi.pricing),
          regions: cloneSection(safePoi.regions),
          amenities: cloneSection(safePoi.amenities),
          tips: cloneSection(safePoi.tips),
          media: this.preparePoiMediaSection(mediaSection),
          experience: cloneSection(safePoi.experience)
        }
      })
      this.resetPOIForm()
      
      // Emit POI update after hydrating
      this.$nextTick(() => {
        this.$emit('pois-updated', this.formData.pointsOfInterest)
      })
    },
    preparePoiMediaSection(media = {}) {
      const base = this.createEmptyMediaSection()
      const merged = { ...base, ...(media || {}) }
      const remoteImages = Array.isArray(media?.images) ? media.images : []
      merged.images = remoteImages
        .map((image, index) => this.formatRemoteImageEntry(image, index))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      merged.imagesToDelete = []
      const orderedIds = merged.images
        .filter((img) => img.type === 'existing' && img.id)
        .map((img) => img.id)
      merged.originalImageOrder = [...orderedIds]
      merged.imagesOrder = [...orderedIds]
      return merged
    },
    formatRemoteImageEntry(image = {}, fallbackIndex = 0) {
      const remoteId = image.id ?? image.mediaId ?? image.remoteId ?? null
      const previewUrl = image.url || image.previewUrl || ''
      return {
        uid: remoteId ? `remote-${remoteId}` : `remote-fallback-${fallbackIndex}`,
        id: remoteId,
        type: 'existing',
        url: previewUrl,
        previewUrl,
        sortOrder: image.sort_order ?? image.sortOrder ?? fallbackIndex,
        name:
          image.name ||
          image.original_name ||
          image.filename ||
          this.deriveImageNameFromUrl(previewUrl) ||
          `Image ${fallbackIndex + 1}`
      }
    },
    deriveImageNameFromUrl(url = '') {
      if (!url) return ''
      try {
        const parsed = new URL(url)
        const parts = parsed.pathname.split('/')
        return parts.pop() || url
      } catch (error) {
        void error
        const segments = url.split('/')
        return segments.pop() || url
      }
    },
    extractImagesFromMediaResponse(response) {
      const payload = response?.data || {}
      return (
        payload?.images ||
        response?.images ||
        []
      )
    },
    mergeImageEntries(existingEntries = [], uploadedImages = []) {
      if (!uploadedImages?.length) {
        return existingEntries
      }
      const uploadedEntries = uploadedImages.map((image, index) =>
        this.formatRemoteImageEntry(image, existingEntries.length + index)
      )
      const map = new Map()
      existingEntries.forEach((entry) => {
        if (entry?.id) {
          map.set(entry.id, entry)
        } else if (entry?.uid) {
          map.set(entry.uid, entry)
        }
      })
      uploadedEntries.forEach((entry) => {
        if (entry?.id) {
          map.set(entry.id, entry)
        } else if (entry?.uid) {
          map.set(entry.uid, entry)
        }
      })
      return Array.from(map.values()).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    },
    haveSameOrder(a = [], b = []) {
      if (a.length !== b.length) return false
      return a.every((value, index) => value === b[index])
    },
    handleClose() {
      this.$emit('close')
    },
    async handlePublish() {
      console.log('[AddMap] handlePublish called')
      if (!this.ensureTitleIsPresent()) {
        console.log('[AddMap] handlePublish: title check failed')
        return
      }
      console.log('[AddMap] handlePublish: calling submitMap')
      await this.submitMap({ mode: 'publish' })
    },
    async handleSaveDraft() {
      if (!this.ensureTitleIsPresent()) return
      await this.submitMap({ mode: 'draft' })
    },
    handleShare() {
      this.$emit('share')
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
      console.log('[AddMap] handlePOISave called')
      console.log('[AddMap] handlePOISave: poiData.media:', poiData?.media)
      console.log('[AddMap] handlePOISave: poiData.media?.images:', poiData?.media?.images)
      console.log('[AddMap] handlePOISave: poiForm.media:', this.poiForm?.media)
      console.log('[AddMap] handlePOISave: poiForm.media?.images:', this.poiForm?.media?.images)
      const { keepOpen = false } = options
      const isEdit = this.editingPoiIndex !== null
      const existingEntry = isEdit ? this.formData.pointsOfInterest[this.editingPoiIndex] : null
      const payload = {
        id: existingEntry && existingEntry.id ? existingEntry.id : Date.now(),
        ...this.clonePOIData(poiData)
      }
      console.log('[AddMap] handlePOISave: payload.media:', payload?.media)
      console.log('[AddMap] handlePOISave: payload.media?.images:', payload?.media?.images)
      console.log('[AddMap] handlePOISave: payload.media?.imagesToDelete:', payload?.media?.imagesToDelete)

      if (isEdit) {
        this.formData.pointsOfInterest.splice(this.editingPoiIndex, 1, payload)
      } else {
        this.formData.pointsOfInterest.push(payload)
      }

      // Emit POIs update after POI is saved so map can show markers
      this.$nextTick(() => {
        console.log('[AddMap] Emitting pois-updated after POI save:', this.formData.pointsOfInterest.length, 'POIs')
        this.$emit('pois-updated', this.formData.pointsOfInterest)
      })

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
      // Emit POI update
      this.$emit('pois-updated', this.formData.pointsOfInterest)
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
      
      // Validate price if map is for sale
      if (this.formData.isForSale) {
        const price = this.formData.price
        if (price === null || price === undefined || price === '') {
          this.priceError = 'Price is required when map is for sale'
          return false
        }
        if (typeof price === 'number' && (price < 0 || !Number.isFinite(price))) {
          this.priceError = 'Price must be a valid positive number'
          return false
        }
        if (typeof price === 'string' && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
          this.priceError = 'Price must be a valid positive number'
          return false
        }
      }
      this.priceError = ''
      return true
    },
    startSubmission(mode) {
      Object.assign(this.submissionState, {
        active: true,
        mode,
        heading: mode === 'publish' ? 'Publishing map' : 'Saving draft',
        message: 'Preparing your map…',
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
      const message = error?.message || 'Unable to save map. Please try again.'
      Object.assign(this.submissionState, {
        error: message,
        detail: '',
        poiProgress: '',
        success: false
      })
      toast.error(message)
    },
    finishSubmission(mode) {
      const heading = mode === 'publish' ? 'Map published' : 'Draft saved'
      const detail =
        mode === 'publish'
          ? 'Your map and POIs are synced with My3PAI.'
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
    async submitMap({ mode }) {
      console.log('[AddMap] submitMap called, mode:', mode)
      if (this.submissionState.active) {
        console.log('[AddMap] submitMap: already active, returning')
        return false
      }
      const trimmedTitle = (this.formData.title || '').trim()
      if (!trimmedTitle) {
        console.log('[AddMap] submitMap: no title')
        this.titleError = 'Title is required'
        return false
      }
      if (mode === 'publish' && !this.formData.pointsOfInterest.length) {
        console.log('[AddMap] submitMap: no POIs for publish')
        toast.error('Add at least one point of interest before publishing.')
        return false
      }
      console.log('[AddMap] submitMap: starting submission, POI count:', this.formData.pointsOfInterest.length)
      this.startSubmission(mode)
      try {
        console.log('[AddMap] submitMap: calling ensureMapRecord')
        const mapId = await this.ensureMapRecord(mode, trimmedTitle)
        console.log('[AddMap] submitMap: got mapId:', mapId)
        console.log('[AddMap] submitMap: calling uploadMapThumbnailIfNeeded')
        await this.uploadMapThumbnailIfNeeded(mapId)
        console.log('[AddMap] submitMap: calling savePointsOfInterest')
        await this.savePointsOfInterest(mapId)
        console.log('[AddMap] submitMap: calling flushPendingPoiDeletions')
        await this.flushPendingPoiDeletions()
        console.log('[AddMap] submitMap: finishing submission')
        this.finishSubmission(mode)
        const payload = {
          mapId,
          mode,
          poiCount: this.formData.pointsOfInterest.length
        }
        console.log('[AddMap] submitMap: emitting event, payload:', payload)
        this.$emit(mode === 'publish' ? 'publish' : 'save-draft', payload)
        return true
      } catch (error) {
        console.error('[AddMap] submitMap: ERROR caught:', error)
        this.handleSubmissionError(error)
        return false
      }
    },
    async ensureMapRecord(mode, title) {
      const payload = { title }
      if (mode === 'publish') {
        payload.isPublished = true
      } else if (mode === 'draft') {
        payload.isPublished = false
      }
      // Add pricing information
      if (this.formData.isForSale) {
        payload.isForSale = true
        payload.price = this.formData.price ? parseFloat(this.formData.price) : null
      } else {
        payload.isForSale = false
        payload.price = null
      }
      if (!this.remoteMapId) {
        this.updateSubmission('Creating map', 'Sending map details')
        const response = await apiService.createMap(payload)
        const map = this.extractMapFromResponse(response)
        if (!map?.id) {
          throw new Error('Unable to create map. Missing identifier.')
        }
        this.remoteMapId = map.id
        return map.id
      }
      this.updateSubmission(
        mode === 'publish' ? 'Publishing map' : 'Updating map',
        'Syncing map details'
      )
      const response = await apiService.updateMap(this.remoteMapId, payload)
      const map = this.extractMapFromResponse(response)
      if (!map?.id) {
        throw new Error('Unable to update map. Missing identifier.')
      }
      this.remoteMapId = map.id
      return map.id
    },
    async uploadMapThumbnailIfNeeded(mapId) {
      const hasNewFile = this.formData.thumbnail instanceof File
      const shouldDelete =
        !this.formData.thumbnail &&
        this.originalThumbnailUrl &&
        typeof this.originalThumbnailUrl === 'string'

      if (!hasNewFile && !shouldDelete) {
        return
      }

      if (hasNewFile) {
      this.updateSubmission('Uploading thumbnail', 'Sending featured image')
      const response = await apiService.uploadMapThumbnail(mapId, this.formData.thumbnail)
      const map = this.extractMapFromResponse(response)
      if (map?.thumbnailUrl) {
        this.formData.thumbnail = map.thumbnailUrl
          this.originalThumbnailUrl = map.thumbnailUrl
        }
        return
      }

      if (shouldDelete) {
        this.updateSubmission('Removing thumbnail', 'Clearing featured image')
        await apiService.deleteMapThumbnail(mapId)
        this.originalThumbnailUrl = null
        this.formData.thumbnail = null
      }
    },
    async savePointsOfInterest(mapId) {
      console.log('[AddMap] savePointsOfInterest reached, mapId:', mapId)
      const points = this.formData.pointsOfInterest || []
      console.log('[AddMap] savePointsOfInterest: POI count:', points.length)
      if (!points.length) {
        console.log('[AddMap] savePointsOfInterest: no POIs, returning early')
        return
      }
      for (let index = 0; index < points.length; index += 1) {
        const poi = points[index]
        const label = this.formatPOITitle(poi)
        console.log(`[AddMap] savePointsOfInterest: processing POI ${index + 1}/${points.length}:`, label)
        console.log(`[AddMap] savePointsOfInterest: POI media images count:`, poi?.media?.images?.length || 0)
        if (poi?.media?.images?.length) {
          console.log(`[AddMap] savePointsOfInterest: POI media images:`, poi.media.images.map(img => ({
            type: img.type,
            hasFile: !!img.file,
            name: img.name
          })))
        }
        this.updateSubmission(
          `Saving ${label}`,
          'Syncing point of interest details',
          this.formatPoiProgressLabel(index + 1, points.length)
        )
        const payload = this.buildPoiPayload(poi)
        const isExisting = Boolean(poi.remoteId)
        console.log(`[AddMap] savePointsOfInterest: isExisting=${isExisting}, remoteId=${poi.remoteId}`)
        const response = isExisting
          ? await apiService.updatePoi(mapId, poi.remoteId, payload)
          : await apiService.savePoi(mapId, payload)
        const remotePoi = this.extractPoiFromResponse(response)
        console.log('[AddMap] savePointsOfInterest: remotePoi response:', remotePoi)
        if (!remotePoi?.id) {
          throw new Error(`Unable to save ${label}. Missing identifier.`)
        }
        console.log(`[AddMap] savePointsOfInterest: POI saved, remoteId=${remotePoi.id}`)
        this.formData.pointsOfInterest[index].remoteId = remotePoi.id
        const poiRef = this.formData.pointsOfInterest[index]
        console.log(`[AddMap] savePointsOfInterest: calling uploadPoiMediaIfNeeded for POI ${index + 1}`)
        console.log(`[AddMap] savePointsOfInterest: poiRef.media?.imagesToDelete before operations:`, poiRef?.media?.imagesToDelete)
        await this.uploadPoiMediaIfNeeded(poiRef)
        await this.deletePoiMediaIfNeeded(poiRef)
        await this.reorderPoiMediaIfNeeded(poiRef)
        await this.deletePoiAudioIfNeeded(poiRef)
        await this.uploadPoiAudioIfNeeded(poiRef)
        await this.deletePoiPdfIfNeeded(poiRef)
        await this.uploadPoiPdfIfNeeded(poiRef)
      }
      console.log('[AddMap] savePointsOfInterest: completed all POIs')
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
      const { audioFile, audioId, pdfFile, pdfId, ...rest } = basic || {}
      const next = { ...rest }
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
      const {
        images,
        imagesToDelete,
        imagesOrder,
        originalImageOrder,
        ...rest
      } = media || {}
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
      console.log('[AddMap] uploadPoiMediaIfNeeded called for POI:', this.formatPOITitle(poi))
      console.log('[AddMap] uploadPoiMediaIfNeeded: poi.remoteId:', poi?.remoteId)
      console.log('[AddMap] uploadPoiMediaIfNeeded: poi.media?.images:', poi?.media?.images)
      const files = this.getPoiMediaFiles(poi)
      console.log('[AddMap] uploadPoiMediaIfNeeded: extracted files count:', files.length)
      if (!files.length || !poi?.remoteId) {
        console.log('[AddMap] uploadPoiMediaIfNeeded: skipping upload - files.length:', files.length, 'remoteId:', poi?.remoteId)
        return
      }
      console.log('[AddMap] uploadPoiMediaIfNeeded: calling API with', files.length, 'files')
      this.updateSubmission(
        `Uploading media for ${this.formatPOITitle(poi)}`,
        'Sending media assets'
      )
      const response = await apiService.uploadPoiMedia(poi.remoteId, files)
      console.log('[AddMap] uploadPoiMediaIfNeeded: API response:', response)
      this.ensureApiSuccess(response, 'Unable to upload media for this POI.')
      console.log('[AddMap] uploadPoiMediaIfNeeded: upload successful')
      const uploadedImages = this.extractImagesFromMediaResponse(response)
      const existingEntries = (poi.media?.images || []).filter((image) => image?.type === 'existing')
      const mergedEntries = this.mergeImageEntries(existingEntries, uploadedImages)
      poi.media.images = mergedEntries
      poi.media.imagesOrder = mergedEntries
        .filter((image) => image.type === 'existing' && image.id)
        .map((image) => image.id)
      poi.media.originalImageOrder = [...poi.media.imagesOrder]
    },
    async deletePoiMediaIfNeeded(poi) {
      const ids = Array.isArray(poi?.media?.imagesToDelete) ? poi.media.imagesToDelete : []
      console.log('[AddMap] deletePoiMediaIfNeeded: poi.media?.imagesToDelete:', poi?.media?.imagesToDelete)
      console.log('[AddMap] deletePoiMediaIfNeeded: extracted ids:', ids)
      console.log('[AddMap] deletePoiMediaIfNeeded: poi.remoteId:', poi?.remoteId)
      if (!ids.length || !poi?.remoteId) {
        console.log('[AddMap] deletePoiMediaIfNeeded: skipping - no ids to delete or no remoteId')
        return
      }
      for (const mediaId of ids) {
        console.log('[AddMap] deletePoiMediaIfNeeded: deleting media ID:', mediaId)
        const response = await apiService.deletePoiMedia(poi.remoteId, mediaId)
        this.ensureApiSuccess(response, 'Unable to delete media for this POI.')
        poi.media.images = (poi.media.images || []).filter((image) => image.id !== mediaId)
      }
      // Don't clear imagesToDelete yet - reorderPoiMediaIfNeeded needs it
      // We'll clear it after reordering is done
      poi.media.imagesOrder = (poi.media.images || [])
        .filter((image) => image.type === 'existing' && image.id)
        .map((image) => image.id)
      // Update originalImageOrder to reflect deletions, but don't clear imagesToDelete yet
      poi.media.originalImageOrder = [...poi.media.imagesOrder]
      console.log('[AddMap] deletePoiMediaIfNeeded: after deletion, imagesOrder:', poi.media.imagesOrder)
    },
    async reorderPoiMediaIfNeeded(poi) {
      // Exclude images that are marked for deletion from the order
      const idsToDelete = new Set(Array.isArray(poi?.media?.imagesToDelete) ? poi.media.imagesToDelete : [])
      const desiredOrder = Array.isArray(poi?.media?.imagesOrder)
        ? poi.media.imagesOrder.filter((id) => Boolean(id) && !idsToDelete.has(id))
        : []
      const originalOrder = Array.isArray(poi?.media?.originalImageOrder)
        ? poi.media.originalImageOrder.filter((id) => !idsToDelete.has(id))
        : []
      console.log('[AddMap] reorderPoiMediaIfNeeded: desiredOrder:', desiredOrder, 'idsToDelete:', Array.from(idsToDelete))
      console.log('[AddMap] reorderPoiMediaIfNeeded: originalOrder:', originalOrder)
      if (!poi?.remoteId || !desiredOrder.length) {
        console.log('[AddMap] reorderPoiMediaIfNeeded: skipping - no remoteId or no desiredOrder')
        // Clear imagesToDelete if we're skipping
        if (poi?.media) {
          poi.media.imagesToDelete = []
        }
        return
      }
      if (this.haveSameOrder(desiredOrder, originalOrder)) {
        console.log('[AddMap] reorderPoiMediaIfNeeded: skipping - order unchanged')
        // Clear imagesToDelete if order is unchanged
        if (poi?.media) {
          poi.media.imagesToDelete = []
        }
        return
      }
      const response = await apiService.reorderPoiMedia(poi.remoteId, desiredOrder)
      this.ensureApiSuccess(response, 'Unable to reorder media for this POI.')
      poi.media.originalImageOrder = [...desiredOrder]
      // Now we can safely clear imagesToDelete after all operations are complete
      if (poi?.media) {
        poi.media.imagesToDelete = []
      }
      console.log('[AddMap] reorderPoiMediaIfNeeded: completed successfully')
    },
    async uploadPoiAudioIfNeeded(poi) {
      const audioFile = poi?.basic?.audioFile
      console.log('[AddMap] uploadPoiAudioIfNeeded called for POI:', this.formatPOITitle(poi))
      console.log('[AddMap] uploadPoiAudioIfNeeded: poi.remoteId:', poi?.remoteId)
      console.log('[AddMap] uploadPoiAudioIfNeeded: audioFile:', audioFile)
      
      if (!audioFile || !poi?.remoteId) {
        console.log('[AddMap] uploadPoiAudioIfNeeded: skipping - no audio file or no remoteId')
        return
      }

      // Check if it's a File object (new upload) or a string URL (existing)
      if (!this.isFileLikeValue(audioFile)) {
        console.log('[AddMap] uploadPoiAudioIfNeeded: skipping - audioFile is not a File object')
        return
      }

      console.log('[AddMap] uploadPoiAudioIfNeeded: calling API with audio file')
      this.updateSubmission(
        `Uploading audio for ${this.formatPOITitle(poi)}`,
        'Sending audio file'
      )
      
      const response = await apiService.uploadPoiAudio(poi.remoteId, audioFile)
      console.log('[AddMap] uploadPoiAudioIfNeeded: API response:', response)
      this.ensureApiSuccess(response, 'Unable to upload audio for this POI.')
      console.log('[AddMap] uploadPoiAudioIfNeeded: upload successful')
      
      // Update the audioFile with the URL from the response if provided
      if (response?.data?.audio?.url) {
        poi.basic.audioFile = response.data.audio.url
        poi.basic.audioId = response.data.audio.id // Store the new audio ID
      }
    },
    async deletePoiAudioIfNeeded(poi) {
      const audioFile = poi?.basic?.audioFile
      const audioId = poi?.basic?.audioId
      console.log('[AddMap] deletePoiAudioIfNeeded called for POI:', this.formatPOITitle(poi))
      console.log('[AddMap] deletePoiAudioIfNeeded: poi.remoteId:', poi?.remoteId)
      console.log('[AddMap] deletePoiAudioIfNeeded: audioFile:', audioFile, 'type:', typeof audioFile)
      console.log('[AddMap] deletePoiAudioIfNeeded: audioId:', audioId)
      
      // If audioFile is null/undefined/empty but audioId exists, it means user deleted the audio
      // audioFile can be null, undefined, empty string, or falsy - all mean "deleted"
      const hasNoAudioFile = !audioFile || audioFile === null || audioFile === undefined || audioFile === ''
      if (hasNoAudioFile && audioId && poi?.remoteId) {
        console.log('[AddMap] deletePoiAudioIfNeeded: deleting audio with ID:', audioId)
        this.updateSubmission(
          `Deleting audio for ${this.formatPOITitle(poi)}`,
          'Removing audio file'
        )
        
        const response = await apiService.deletePoiMedia(poi.remoteId, audioId)
        console.log('[AddMap] deletePoiAudioIfNeeded: API response:', response)
        this.ensureApiSuccess(response, 'Unable to delete audio for this POI.')
        console.log('[AddMap] deletePoiAudioIfNeeded: deletion successful')
        
        // Verify deletion from response - audio should be null in the response
        const deletedAudio = response?.data?.audio
        console.log('[AddMap] deletePoiAudioIfNeeded: response audio:', deletedAudio)
        
        // Clear both audioId and audioFile after successful deletion
        if (poi.basic) {
          poi.basic.audioId = null
          poi.basic.audioFile = null
          // Force reactivity update by reassigning the basic object
          poi.basic = { ...poi.basic }
        }
        console.log('[AddMap] deletePoiAudioIfNeeded: cleared audioId and audioFile')
        return
      }
      
      console.log('[AddMap] deletePoiAudioIfNeeded: skipping - no deletion needed')
    },
    async uploadPoiPdfIfNeeded(poi) {
      const pdfFile = poi?.basic?.pdfFile
      console.log('[AddMap] uploadPoiPdfIfNeeded called for POI:', this.formatPOITitle(poi))
      console.log('[AddMap] uploadPoiPdfIfNeeded: poi.remoteId:', poi?.remoteId)
      console.log('[AddMap] uploadPoiPdfIfNeeded: pdfFile:', pdfFile)
      
      if (!pdfFile || !poi?.remoteId) {
        console.log('[AddMap] uploadPoiPdfIfNeeded: skipping - no PDF file or no remoteId')
        return
      }

      // Check if it's a File object (new upload) or a string URL (existing)
      if (!this.isFileLikeValue(pdfFile)) {
        console.log('[AddMap] uploadPoiPdfIfNeeded: skipping - pdfFile is not a File object')
        return
      }

      console.log('[AddMap] uploadPoiPdfIfNeeded: calling API with PDF file')
      this.updateSubmission(
        `Uploading PDF for ${this.formatPOITitle(poi)}`,
        'Sending PDF file'
      )
      
      const response = await apiService.uploadPoiPdf(poi.remoteId, pdfFile)
      console.log('[AddMap] uploadPoiPdfIfNeeded: API response:', response)
      this.ensureApiSuccess(response, 'Unable to upload PDF for this POI.')
      console.log('[AddMap] uploadPoiPdfIfNeeded: upload successful')
      
      // Update the pdfFile with the URL from the response if provided
      if (response?.data?.pdf?.url) {
        poi.basic.pdfFile = response.data.pdf.url
        poi.basic.pdfId = response.data.pdf.id // Store the new PDF ID
      }
    },
    async deletePoiPdfIfNeeded(poi) {
      const pdfFile = poi?.basic?.pdfFile
      const pdfId = poi?.basic?.pdfId
      console.log('[AddMap] deletePoiPdfIfNeeded called for POI:', this.formatPOITitle(poi))
      console.log('[AddMap] deletePoiPdfIfNeeded: poi.remoteId:', poi?.remoteId)
      console.log('[AddMap] deletePoiPdfIfNeeded: pdfFile:', pdfFile, 'type:', typeof pdfFile)
      console.log('[AddMap] deletePoiPdfIfNeeded: pdfId:', pdfId)
      
      // If pdfFile is null/undefined/empty but pdfId exists, it means user deleted the PDF
      const hasNoPdfFile = !pdfFile || pdfFile === null || pdfFile === undefined || pdfFile === ''
      if (hasNoPdfFile && pdfId && poi?.remoteId) {
        console.log('[AddMap] deletePoiPdfIfNeeded: deleting PDF with ID:', pdfId)
        this.updateSubmission(
          `Deleting PDF for ${this.formatPOITitle(poi)}`,
          'Removing PDF file'
        )
        
        const response = await apiService.deletePoiMedia(poi.remoteId, pdfId)
        console.log('[AddMap] deletePoiPdfIfNeeded: API response:', response)
        this.ensureApiSuccess(response, 'Unable to delete PDF for this POI.')
        console.log('[AddMap] deletePoiPdfIfNeeded: deletion successful')
        
        // Clear both pdfId and pdfFile after successful deletion
        if (poi.basic) {
          poi.basic.pdfId = null
          poi.basic.pdfFile = null
          // Force reactivity update by reassigning the basic object
          poi.basic = { ...poi.basic }
        }
        console.log('[AddMap] deletePoiPdfIfNeeded: cleared pdfId and pdfFile')
        return
      }
      
      console.log('[AddMap] deletePoiPdfIfNeeded: skipping - no deletion needed')
    },
    getPoiMediaFiles(poi) {
      const images = poi?.media?.images || []
      console.log('[AddMap] getPoiMediaFiles: images array length:', images.length)
      const files = images
        .map((image, idx) => {
          console.log(`[AddMap] getPoiMediaFiles: image ${idx}:`, {
            type: image?.type,
            hasFile: !!image?.file,
            isFileLike: this.isFileLikeValue(image),
            isFileFileLike: image?.file ? this.isFileLikeValue(image.file) : false,
            name: image?.name
          })
          if (image && image.type === 'new' && this.isFileLikeValue(image.file)) {
            console.log(`[AddMap] getPoiMediaFiles: returning image.file for image ${idx}`)
            return image.file
          }
          if (this.isFileLikeValue(image)) {
            console.log(`[AddMap] getPoiMediaFiles: returning image itself for image ${idx}`)
            return image
          }
          console.log(`[AddMap] getPoiMediaFiles: skipping image ${idx}`)
          return null
        })
        .filter(Boolean)
      console.log('[AddMap] getPoiMediaFiles: final files count:', files.length)
      return files
    },
    async flushPendingPoiDeletions() {
      if (!this.pendingPoiDeletions.length) return
      if (!this.remoteMapId) {
        console.warn('Cannot delete POIs without a remote map id.')
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
        const response = await apiService.deletePoi(this.remoteMapId, poiId)
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
    extractMapFromResponse(response) {
      if (!response?.success) {
        throw new Error(response?.error || 'Map request failed.')
      }
      const payload = response.data || {}
      return payload.data?.map || payload.map || payload.data || payload
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
        pointsOfInterest: [],
        isForSale: false,
        price: null
      }
      this.originalThumbnailUrl = null
      this.remoteMapId = null
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
.add-map-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex children to allow scrolling */
}

.add-map-panel {
  background: var(--bg-primary);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* Important for flex children to allow scrolling */
  flex: 1; /* Take available space */
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.back-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

.header-content {
  flex: 1;
  min-width: 0;
}

.panel-title {
  margin: 0;
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

.panel-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* Important for flex children to allow scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
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

.pricing-section {
  margin: var(--spacing-md) 0;
}

.pricing-toggle-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.pricing-toggle-card:hover {
  border-color: var(--border-medium);
  background: var(--bg-tertiary);
}

.pricing-toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.pricing-toggle-info {
  flex: 1;
  min-width: 0;
}

.pricing-toggle-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.pricing-toggle-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-switch-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-medium);
  transition: all var(--transition-normal);
  border-radius: 28px;
}

.toggle-switch-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: all var(--transition-normal);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch-input:checked + .toggle-switch-slider {
  background-color: var(--primary-color);
}

.toggle-switch-input:checked + .toggle-switch-slider:before {
  transform: translateX(20px);
}

.toggle-switch-input:focus + .toggle-switch-slider {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.toggle-switch:hover .toggle-switch-slider {
  opacity: 0.9;
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.price-currency {
  position: absolute;
  left: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
}

.price-input {
  width: 100%;
  padding: var(--spacing-sm) !important;
  padding-left: 22px !important;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.price-input.has-error {
  border-color: var(--error-color, #ef4444);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.15);
}

.field-hint {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  margin: var(--spacing-xs) 0 0 0;
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

.panel-footer {
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

