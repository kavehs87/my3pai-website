<template>
  <div class="trip-editor">
    <Header />

    <div class="container">
      <div class="editor-card">
        <h1>{{ isEdit ? 'Edit Trip' : 'Create New Trip' }}</h1>

        <div class="form-grid">
          <div class="form-group">
            <label>Title</label>
            <input v-model="form.title" type="text" class="form-input" placeholder="Trip title" />
          </div>
          <div class="form-group">
            <label>Destination</label>
            <input v-model="form.destination" type="text" class="form-input" placeholder="City, Country" />
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input v-model="form.startDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input v-model="form.endDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Budget</label>
            <select v-model="form.budget" class="form-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        <div class="form-group">
          <label>Status</label>
          <select v-model="form.status" class="form-input">
            <option value="planning">Planning</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
          <div class="form-group">
            <label>Travelers</label>
            <input v-model.number="form.travelers" type="number" min="1" class="form-input" />
          </div>
        <div class="form-group full">
          <label>Notes</label>
          <textarea v-model="form.notes" rows="3" class="form-textarea" placeholder="Optional notes..." />
        </div>

        <div class="form-group full">
          <label>Tags</label>
          <input v-model="tagsInput" @keydown.enter.prevent="addTagFromInput" type="text" class="form-input" placeholder="Press Enter to add tag" />
          <div class="tags">
            <span v-for="(tag, idx) in form.tags" :key="idx" class="tag">
              {{ tag }}
              <button class="tag-remove" @click="removeTag(idx)" title="Remove">×</button>
            </span>
          </div>
        </div>

        <div class="form-group full">
          <label>Thumbnail <span class="req">*</span></label>
          <div class="thumb-controls">
            <button class="btn tertiary" type="button" @click="triggerThumbSelect"><i class="fas fa-image"></i> Upload Thumbnail</button>
            <input ref="thumbInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onThumbSelected" />
            <button v-if="form.thumbnail || thumbnailFile" type="button" class="btn danger" @click="removeThumbnail"><i class="fas fa-times"></i> Remove</button>
          </div>
          <div v-if="thumbnailPreview || form.thumbnail" class="thumb-preview">
            <img :src="thumbnailPreview || form.thumbnail" alt="Thumbnail preview" @error="onThumbError" />
          </div>
        </div>

        <div class="form-group full">
          <label>Video Links</label>
          <div class="video-row" v-for="(v, i) in form.videos" :key="i">
            <input v-model="v.url" type="url" class="form-input" placeholder="https://www.instagram.com/reel/... or https://youtube.com/shorts/... or https://www.tiktok.com/..." />
            <button class="remove-btn" @click="removeVideo(i)"><i class="fas fa-times"></i></button>
          </div>
          <button class="btn tertiary" @click="addVideo"><i class="fas fa-plus"></i> Add Video</button>
        </div>
        </div>

        <div class="actions">
          <button class="btn" @click="saveTrip" :disabled="isSaving">
            <i class="fas fa-save"></i>
            {{ isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Trip') }}
          </button>
          <button class="btn secondary" @click="openInStudio" :disabled="!savedTripId && isSaving">
            <i class="fas fa-magic"></i>
            Open in Studio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../Header.vue'
import apiService from '../../services/api.js'
import toast from '../../utils/toast.js'

export default {
  name: 'TripEditor',
  components: { Header },
  data() {
    const today = new Date().toISOString().slice(0,10)
    return {
      isEdit: !!this.$route.params.id,
      isSaving: false,
      savedTripId: null,
      tagsInput: '',
      thumbnailFile: null,
      thumbnailPreview: '',
      form: {
        title: '',
        destination: '',
        startDate: today,
        endDate: today,
        budget: 'medium',
        status: 'planning',
        travelers: 1,
        notes: '',
        tags: [],
        thumbnail: '',
        videos: []
      }
    }
  },
  async mounted() {
    if (this.isEdit) {
      await this.loadTrip()
    }
  },
  methods: {
    async loadTrip() {
      try {
        const id = this.$route.params.id
        const result = await apiService.getTrip(id)
        if (result.success) {
          const apiResponse = result.data
          const trip = (apiResponse && (apiResponse.data || apiResponse.trip || apiResponse)) || {}
          this.savedTripId = trip.id || id
          this.form.title = trip.title || ''
          this.form.destination = trip.destination || ''
          this.form.startDate = trip.startDate || trip.start_date || this.form.startDate
          this.form.endDate = trip.endDate || trip.end_date || this.form.endDate
          this.form.budget = trip.budget || 'medium'
          this.form.status = trip.status || 'planning'
          this.form.travelers = trip.travelers || 1
          this.form.notes = trip.notes || ''
          this.form.thumbnail = trip.thumbnail || ''
          // Normalize tags/videos
          this.form.tags = Array.isArray(trip.tags)
            ? [...trip.tags]
            : (typeof trip.tags === 'string' ? trip.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
          const videos = trip.videos || []
          this.form.videos = Array.isArray(videos) ? videos.map(v => (typeof v === 'string' ? { url: v } : { url: v.url || '' })) : []
        } else {
          toast.error(result.error || 'Failed to load trip')
        }
      } catch (e) {
        toast.error(`Error loading trip: ${e.message}`)
      }
    },
    addTagFromInput() {
      const value = (this.tagsInput || '').trim()
      if (!value) return
      if (!this.form.tags.includes(value)) this.form.tags.push(value)
      this.tagsInput = ''
    },
    removeTag(idx) {
      this.form.tags.splice(idx, 1)
    },
    addVideo() {
      this.form.videos.push({ url: '' })
    },
    removeVideo(i) {
      this.form.videos.splice(i, 1)
    },
    onThumbError(e) {
      e.target.style.display = 'none'
    },
    triggerThumbSelect() {
      this.$refs.thumbInput && this.$refs.thumbInput.click()
    },
    onThumbSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.thumbnailFile = file
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.thumbnailPreview = ev.target.result
      }
      reader.readAsDataURL(file)
    },
    removeThumbnail() {
      this.thumbnailFile = null
      this.thumbnailPreview = ''
      this.form.thumbnail = ''
      if (this.$refs.thumbInput) this.$refs.thumbInput.value = ''
    },
    async saveTrip() {
      if (!this.form.title || !this.form.destination) {
        toast.error('Please fill title and destination')
        return
      }
      if (new Date(this.form.endDate) < new Date(this.form.startDate)) {
        toast.error('End date cannot be before start date')
        return
      }
      // Enforce thumbnail presence: either existing URL or a selected file
      if (!this.thumbnailFile && !this.form.thumbnail) {
        toast.error('Please upload a thumbnail image')
        return
      }
      this.isSaving = true
      try {
        const payload = {
          title: this.form.title,
          destination: this.form.destination,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          budget: this.form.budget,
          status: this.form.status,
          travelers: this.form.travelers,
          notes: this.form.notes,
          tags: this.form.tags,
          videos: this.form.videos
        }
        
        // Only include thumbnail in payload if it's an existing URL (from editing)
        // For new file uploads, we upload separately after trip creation/update
        if (this.form.thumbnail && !this.thumbnailFile) {
          payload.thumbnail = this.form.thumbnail
        }
        const result = this.isEdit
          ? await apiService.updateTrip(this.$route.params.id, payload)
          : await apiService.createTrip(payload)
        if (result.success) {
          // Robustly extract created/updated trip id from various possible shapes
          // result.data -> API service wrapper
          // could be { data: { id } }, { data: { data: { id } } }, { data: { trip: { id } } }
          const apiResponse = result.data || {}
          const body = apiResponse.data !== undefined ? apiResponse.data : apiResponse
          const tripObj = (body && (body.trip || body)) || {}
          this.savedTripId = tripObj.id || this.savedTripId
          
          if (!this.savedTripId) {
            toast.error('Could not determine trip id after save. Please try again.')
            return
          }
          // If a thumbnail file is selected, upload it now
          if (this.thumbnailFile && this.savedTripId) {
            const up = await apiService.uploadTripThumbnail(this.savedTripId, this.thumbnailFile)
            if (up.success) {
              // Support {data: {thumbnail: url}} or {thumbnail: url}
              const d = up.data && (up.data.data || up.data)
              this.form.thumbnail = d.thumbnail || this.form.thumbnail
            } else {
              toast.error(up.error || 'Failed to upload thumbnail')
            }
          }
          toast.success(this.isEdit ? 'Trip updated successfully' : 'Trip created successfully')
          // Navigate to trips list in profile
          this.$router.push({ name: 'profile', query: { tab: 'trips' } })
        } else {
          toast.error(result.error || 'Failed to save trip')
        }
      } catch (e) {
        toast.error(`Error saving trip: ${e.message}`)
      } finally {
        this.isSaving = false
      }
    },
    openInStudio() {
      if (!this.form.thumbnail && !this.thumbnailFile) {
        toast.error('Please upload a thumbnail before opening in Studio')
        return
      }
      // Ensure saved first; if not saved, attempt save then navigate
      const go = () => this.$router.push({ name: 'studio', query: { tripId: this.savedTripId || 'new' } })
      if (!this.savedTripId) {
        this.saveTrip().then(() => {
          if (this.savedTripId) go()
        })
      } else {
        go()
      }
    }
  }
}
</script>

<style scoped>
.trip-editor { background: var(--bg-secondary); min-height: 100vh; }
.container { max-width: 960px; margin: 0 auto; padding: var(--spacing-xl) var(--spacing-lg); }
.editor-card { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: var(--spacing-xl); box-shadow: var(--shadow-light); }
.editor-card h1 { margin: 0 0 var(--spacing-lg); }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-lg); }
.form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.form-group.full { grid-column: 1 / -1; }
.form-input, .form-textarea, select { width: 100%; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--border-light); border-radius: var(--radius-md); background: var(--bg-secondary); font-size: var(--font-size-base); }
.actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg); }
.btn { background: var(--primary-color); color: #fff; border: none; border-radius: var(--radius-md); padding: var(--spacing-sm) var(--spacing-md); cursor: pointer; font-weight: 600; }
.btn.secondary { background: var(--secondary-color); color: var(--bg-primary); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
