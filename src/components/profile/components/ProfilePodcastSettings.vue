<template>
  <div class="podcast-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Podcast"
        tool-id="podcast"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-podcast"></i> Podcast</h1>
        <p>Create and manage your podcast episodes and settings.</p>
      </div>

      <!-- Tabs -->
      <div class="podcast-tabs">
        <button
          :class="['tab-button', { active: activeSubTab === 'content' }]"
          @click="activeSubTab = 'content'"
        >
          <i class="fas fa-list"></i> Episodes
        </button>
        <button
          :class="['tab-button', { active: activeSubTab === 'settings' }]"
          @click="activeSubTab = 'settings'"
        >
          <i class="fas fa-cog"></i> Settings
        </button>
      </div>

      <!-- Settings Tab Content -->
      <div v-if="activeSubTab === 'settings'" class="tab-content">
      <!-- Podcast Title Settings -->
      <div class="settings-section">
        <h3 class="section-title"><i class="fas fa-heading"></i> Podcast Title</h3>
        <p class="section-description">Custom title for your podcast section (e.g., "My Travel Podcast", "Adventure Stories", etc.)</p>
        <div class="form-group">
          <input 
            v-model="podcastTitle" 
            type="text" 
            class="form-input" 
            placeholder="Enter podcast title (optional)"
            maxlength="255"
            @blur="savePodcastSettings"
            @keyup.enter="savePodcastSettings"
          />
          <span class="char-count">{{ (podcastTitle || '').length }}/255</span>
          <p v-if="titleSaving" class="saving-indicator">
            <i class="fas fa-spinner fa-spin"></i> Saving...
          </p>
          <p v-if="titleSaved" class="saved-indicator">
            <i class="fas fa-check"></i> Saved
          </p>
        </div>
      </div>

      <!-- Podcast Description Settings -->
      <div class="settings-section">
        <h3 class="section-title"><i class="fas fa-align-left"></i> Podcast Description</h3>
        <p class="section-description">Description for your podcast section that appears on the public page (e.g., "Weekly episodes covering solo travel safety, budgeting, and creator tips.")</p>
        <div class="form-group">
          <textarea 
            v-model="podcastDescription" 
            class="form-input" 
            placeholder="Enter podcast description (optional)"
            maxlength="1000"
            rows="3"
            @blur="savePodcastSettings"
          ></textarea>
          <span class="char-count">{{ (podcastDescription || '').length }}/1000</span>
          <p v-if="descriptionSaving" class="saving-indicator">
            <i class="fas fa-spinner fa-spin"></i> Saving...
          </p>
          <p v-if="descriptionSaved" class="saved-indicator">
            <i class="fas fa-check"></i> Saved
          </p>
        </div>
      </div>

      <!-- Podcast URLs Settings -->
      <div class="settings-section">
        <h3 class="section-title"><i class="fas fa-link"></i> Podcast Platform Links</h3>
        <p class="section-description">Add links to your podcast on Apple Podcasts and Spotify. These will appear as buttons on your public podcast page.</p>
        
        <div class="form-group">
          <label for="spotifyUrl" class="form-label">
            <i class="fab fa-spotify" style="color: #1DB954;"></i> Spotify URL
          </label>
          <input 
            id="spotifyUrl"
            v-model="spotifyUrl" 
            type="url" 
            class="form-input" 
            placeholder="https://open.spotify.com/show/..."
            maxlength="500"
            @blur="savePodcastSettings"
          />
          <span class="char-count">{{ (spotifyUrl || '').length }}/500</span>
        </div>

        <div class="form-group">
          <label for="applePodcastUrl" class="form-label">
            <i class="fab fa-apple"></i> Apple Podcasts URL
          </label>
          <input 
            id="applePodcastUrl"
            v-model="applePodcastUrl" 
            type="url" 
            class="form-input" 
            placeholder="https://podcasts.apple.com/..."
            maxlength="500"
            @blur="savePodcastSettings"
          />
          <span class="char-count">{{ (applePodcastUrl || '').length }}/500</span>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <p v-if="urlsSaving" class="saving-indicator">
            <i class="fas fa-spinner fa-spin"></i> Saving...
          </p>
          <p v-if="urlsSaved" class="saved-indicator">
            <i class="fas fa-check"></i> Saved
          </p>
        </div>
      </div>
      </div>

      <!-- Content Tab (Episodes) -->
      <div v-if="activeSubTab === 'content'" class="tab-content">
        <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ Array.isArray(podcastEpisodes) ? podcastEpisodes.length : 0 }}</span>
              <span class="stat-label">Total Episodes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ publishedCount }}</span>
              <span class="stat-label">Published</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ premiumCount }}</span>
              <span class="stat-label">Premium</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalPlays }}</span>
              <span class="stat-label">Total Plays</span>
            </div>
          </div>
          <button class="add-btn" @click="openPodcastModal()">
            <i class="fas fa-plus"></i> New Episode
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="!Array.isArray(podcastEpisodes) || podcastEpisodes.length === 0" class="empty-state">
          <i class="fas fa-microphone"></i>
          <h3>No podcast episodes yet</h3>
          <p>Create your first episode to share with your listeners</p>
          <button class="add-btn" @click="openPodcastModal()">
            <i class="fas fa-plus"></i> Create First Episode
          </button>
        </div>
        
        <div v-else class="episodes-list">
          <article v-for="(episode, index) in podcastEpisodes" :key="episode.id" class="episode-card">
            <div class="episode-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="episode-cover" :style="episode.coverImage ? { backgroundImage: `url(${episode.coverImage})` } : {}">
              <div v-if="!episode.coverImage" class="episode-cover-placeholder">
                <i class="fas fa-headphones"></i>
              </div>
              <div v-if="episode.audioUrl" class="play-indicator">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="episode-content">
              <div class="episode-badges">
                <span v-if="episode.isPremium" class="badge premium">
                  <i class="fas fa-crown"></i> Premium
                </span>
                <span :class="['badge', episode.isPublished ? 'published' : 'draft']">
                  {{ episode.isPublished ? 'Published' : 'Draft' }}
                </span>
                <span v-if="!episode.audioUrl" class="badge no-audio">
                  <i class="fas fa-exclamation-triangle"></i> No Audio
                </span>
              </div>
              <h3>{{ episode.title }}</h3>
              <p v-if="episode.description" class="episode-description">{{ episode.description }}</p>
              <div class="episode-meta">
                <span v-if="episode.duration"><i class="fas fa-clock"></i> {{ episode.duration }}</span>
                <span v-if="episode.playsCount"><i class="fas fa-play"></i> {{ episode.playsCount }} plays</span>
                <span v-if="episode.publishedAt">{{ formatDate(episode.publishedAt) }}</span>
              </div>
            </div>
            <div class="episode-actions">
              <button class="action-btn" @click="openPodcastModal(episode)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="deletePodcastEpisode(episode.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </article>
        </div>
        </div>
      </div>
    </div>

    <!-- Podcast Episode Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Create' }} Podcast Episode</h3>
            <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="savePodcastEpisode">
            <div class="form-group">
              <label>Title *</label>
              <input v-model="modal.form.title" type="text" class="form-input" placeholder="Episode title" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="modal.form.description" class="form-input" rows="4" placeholder="Episode description" maxlength="2000"></textarea>
              <span class="char-count">{{ (modal.form.description || '').length }}/2000</span>
            </div>
            <div class="form-group">
              <label>Duration</label>
              <input v-model="modal.form.duration" type="text" class="form-input" placeholder="e.g., 45 min or 1:23:45" maxlength="32" />
            </div>
            <div class="form-row">
              <label class="checkbox-label">
                <input v-model="modal.form.isPremium" type="checkbox" class="checkbox-input" />
                <span><i class="fas fa-crown text-amber"></i> Premium Content</span>
              </label>
              <label class="checkbox-label">
                <input v-model="modal.form.isPublished" type="checkbox" class="checkbox-input" />
                <span><i class="fas fa-globe text-green"></i> Published</span>
              </label>
            </div>
            
            <div v-if="modal.editId" class="upload-section">
              <h4><i class="fas fa-music"></i> Audio File</h4>
              <div class="file-upload-area" :class="{ 'has-file': modal.form.audioUrl }">
                <input type="file" accept="audio/*" class="file-input" @change="handleAudioUpload" />
                <div class="file-upload-content">
                  <i :class="modal.form.audioUrl ? 'fas fa-check-circle text-green' : 'fas fa-cloud-upload-alt'"></i>
                  <span v-if="modal.form.audioUrl">Audio uploaded • Click to replace</span>
                  <span v-else>Click or drag to upload audio (MP3, M4A, WAV)</span>
                  <small>Max 500MB</small>
                </div>
              </div>
              <div v-if="audioUploading" class="upload-progress">
                <i class="fas fa-spinner fa-spin"></i> Uploading audio file...
              </div>
            </div>

            <div v-if="modal.editId" class="upload-section">
              <h4><i class="fas fa-image"></i> Cover Image</h4>
              <div class="file-upload-area" :class="{ 'has-image': modal.form.coverImage }">
                <input type="file" accept="image/*" class="file-input" @change="handleCoverFileSelect" />
                <div class="file-upload-content">
                  <i :class="modal.form.coverImage ? 'fas fa-check-circle text-green' : 'fas fa-cloud-upload-alt'"></i>
                  <span v-if="modal.form.coverImage">Cover uploaded • Click to replace</span>
                  <span v-else>Click or drag to upload cover image</span>
                </div>
              </div>
              <div v-if="modal.form.coverImage" class="cover-preview-wrapper">
                <img :src="modal.form.coverImage" alt="Cover" class="cover-preview" crossorigin="anonymous" />
                <button type="button" class="crop-btn" @click="openCoverCropper" title="Crop image">
                  <i class="fas fa-crop-alt"></i> Crop
                </button>
              </div>
            </div>

            <p v-if="!modal.editId" class="helper-text">
              <i class="fas fa-info-circle"></i> Save the episode first, then you can upload audio and cover image.
            </p>

            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modal.saving">
                <span v-if="modal.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modal.editId ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Image Cropper Modal -->
    <Teleport to="body">
      <div v-if="cropper.visible" class="cropper-overlay" @click.self="cancelCrop">
        <div class="cropper-modal">
          <div class="cropper-header">
            <h3>Crop Cover Image</h3>
            <p>Drag to pan, scroll or pinch to zoom</p>
          </div>
          
          <div class="cropper-container" ref="cropperContainer">
            <div 
              class="cropper-image-wrapper"
              ref="imageWrapper"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
            >
              <img 
                ref="cropperImage"
                :src="cropper.imageData"
                :style="imageTransformStyle"
                @load="onImageLoad"
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
              <button class="zoom-btn" @click="zoomOut" :disabled="cropper.scale <= cropper.minScale">
                <i class="fas fa-minus"></i>
              </button>
              <div class="zoom-slider-container">
                <input 
                  type="range" 
                  class="zoom-slider"
                  :min="cropper.minScale" 
                  :max="cropper.maxScale" 
                  :step="0.01"
                  v-model.number="cropper.scale"
                />
              </div>
              <button class="zoom-btn" @click="zoomIn" :disabled="cropper.scale >= cropper.maxScale">
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
  </div>
</template>

<script>
import api from '@/services/api'
import toast from '@/utils/toast'
import DisabledFeatureBanner from './DisabledFeatureBanner.vue'
import eventBus from '@/utils/eventBus'

export default {
  name: 'ProfilePodcastSettings',
  components: {
    DisabledFeatureBanner
  },
  data() {
    return {
      activeSubTab: 'content', // 'content' or 'settings'
      podcastEpisodes: [],
      podcastTitle: null,
      podcastDescription: null,
      applePodcastUrl: null,
      spotifyUrl: null,
      loading: false,
      isEnabled: true,
      audioUploading: false,
      coverUploading: false,
      titleSaving: false,
      titleSaved: false,
      descriptionSaving: false,
      descriptionSaved: false,
      urlsSaving: false,
      urlsSaved: false,
      cropperEventListeners: null,
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          title: '',
          description: '',
          duration: '',
          isPremium: false,
          isPublished: false,
          audioUrl: null,
          coverImage: null
        }
      },
      cropper: {
        visible: false,
        imageData: null,
        originalFile: null,
        scale: 1,
        minScale: 0.5,
        maxScale: 3,
        translateX: 0,
        translateY: 0,
        isDraggingImage: false,
        dragStartX: 0,
        dragStartY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0,
        lastTouchDistance: 0,
        imageWidth: 0,
        imageHeight: 0,
        containerWidth: 0,
        containerHeight: 0,
        cropAreaWidth: 0,
        cropAreaHeight: 0
      }
    }
  },
  computed: {
    publishedCount() {
      if (!Array.isArray(this.podcastEpisodes)) return 0
      return this.podcastEpisodes.filter(e => e.isPublished).length
    },
    premiumCount() {
      if (!Array.isArray(this.podcastEpisodes)) return 0
      return this.podcastEpisodes.filter(e => e.isPremium).length
    },
    totalPlays() {
      if (!Array.isArray(this.podcastEpisodes)) return 0
      return this.podcastEpisodes.reduce((sum, e) => sum + (e.playsCount || 0), 0)
    },
    imageTransformStyle() {
      return {
        transform: `translate(${this.cropper.translateX}px, ${this.cropper.translateY}px) scale(${this.cropper.scale})`,
        transformOrigin: 'center center'
      }
    },
    cropAreaStyle() {
      return {
        width: `${this.cropper.cropAreaWidth}px`,
        height: `${this.cropper.cropAreaHeight}px`
      }
    }
  },
  mounted() {
    this.loadPodcastEpisodes()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
    this.cleanupCropperEventListeners()
  },
  methods: {
    async loadPodcastEpisodes() {
      this.loading = true
      try {
        const result = await api.getMyPodcastEpisodes()
        console.log('[PodcastSettings] Full API result:', JSON.stringify(result, null, 2))
        
        if (result.success && result.data) {
          // Handle different response structures:
          // - Double-wrapped: { data: { data: { episodes: [...] } } }
          // - Single-wrapped: { data: { episodes: [...] } }
          // - Old: { data: { data: [...] } } or { data: [...] }
          const responseData = result.data
          console.log('[PodcastSettings] Response data structure:', {
            hasEpisodes: !!responseData.episodes,
            episodesIsArray: Array.isArray(responseData.episodes),
            hasData: !!responseData.data,
            dataIsArray: Array.isArray(responseData.data),
            hasNestedData: !!(responseData.data && responseData.data.data),
            hasNestedEpisodes: !!(responseData.data && responseData.data.episodes),
            isDirectArray: Array.isArray(responseData),
            keys: Object.keys(responseData || {})
          })
          
          let episodes = []
          
          // Check for episodes array in various locations (deepest first)
          if (responseData.data?.episodes && Array.isArray(responseData.data.episodes)) {
            // Double-wrapped: { data: { data: { episodes: [...] } } }
            episodes = responseData.data.episodes
            console.log('[PodcastSettings] ✓ Found episodes in data.data.episodes:', episodes.length)
          } else if (responseData.episodes && Array.isArray(responseData.episodes)) {
            // Single-wrapped: { data: { episodes: [...] } }
            episodes = responseData.episodes
            console.log('[PodcastSettings] ✓ Found episodes in data.episodes:', episodes.length)
          } else if (responseData.data && Array.isArray(responseData.data)) {
            // Old structure: { data: { data: [...] } }
            episodes = responseData.data
            console.log('[PodcastSettings] ✓ Found episodes in data.data:', episodes.length)
          } else if (Array.isArray(responseData)) {
            // Direct array: { data: [...] }
            episodes = responseData
            console.log('[PodcastSettings] ✓ Found episodes as direct array:', episodes.length)
          } else {
            console.warn('[PodcastSettings] ✗ No episodes found. Response structure:', responseData)
            episodes = []
          }
          
          // Ensure we always set an array (Vue 3 reactivity handles this automatically)
          this.podcastEpisodes = episodes
          
          // Extract podcast title and description from response
          if (responseData.data?.podcastTitle !== undefined) {
            this.podcastTitle = responseData.data.podcastTitle
          } else if (responseData.podcastTitle !== undefined) {
            this.podcastTitle = responseData.podcastTitle
          }
          
          if (responseData.data?.podcastDescription !== undefined) {
            this.podcastDescription = responseData.data.podcastDescription
          } else if (responseData.podcastDescription !== undefined) {
            this.podcastDescription = responseData.podcastDescription
          }
          
          if (responseData.data?.applePodcastUrl !== undefined) {
            this.applePodcastUrl = responseData.data.applePodcastUrl
          } else if (responseData.applePodcastUrl !== undefined) {
            this.applePodcastUrl = responseData.applePodcastUrl
          }
          
          if (responseData.data?.spotifyUrl !== undefined) {
            this.spotifyUrl = responseData.data.spotifyUrl
          } else if (responseData.spotifyUrl !== undefined) {
            this.spotifyUrl = responseData.spotifyUrl
          }
          
          console.log('[PodcastSettings] Set podcastEpisodes to:', {
            length: this.podcastEpisodes.length,
            isArray: Array.isArray(this.podcastEpisodes),
            firstEpisode: this.podcastEpisodes[0],
            podcastTitle: this.podcastTitle
          })
        } else {
          console.error('[PodcastSettings] API call failed or no data:', {
            success: result.success,
            error: result.error,
            data: result.data
          })
          this.podcastEpisodes = []
        }
      } catch (err) {
        console.error('[PodcastSettings] Exception loading podcast episodes:', err)
        toast.error('Failed to load podcast episodes')
        this.podcastEpisodes = []
      } finally {
        this.loading = false
      }
    },
    async loadVisibilityStatus() {
      try {
        const result = await api.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          this.isEnabled = settings.podcast !== false // Default to true if not set
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'podcast') {
        this.isEnabled = data.enabled
      }
    },
    handleEnabled() {
      this.isEnabled = true
    },
    formatDate(dateString) {
      if (!dateString) return ''
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      } catch {
        return dateString
      }
    },
    openPodcastModal(episode = null) {
      this.modal.editId = episode?.id || null
      this.modal.form = episode
        ? {
            title: episode.title,
            description: episode.description || '',
            duration: episode.duration || '',
            isPremium: episode.isPremium || false,
            isPublished: episode.isPublished || false,
            audioUrl: episode.audioUrl || null,
            coverImage: episode.coverImage || null
          }
        : { title: '', description: '', duration: '', isPremium: false, isPublished: false, audioUrl: null, coverImage: null }
      this.modal.visible = true
    },
    closeModal() {
      this.modal.visible = false
    },
    async savePodcastEpisode() {
      this.modal.saving = true
      try {
        const data = {
          title: this.modal.form.title,
          description: this.modal.form.description,
          duration: this.modal.form.duration,
          isPremium: this.modal.form.isPremium,
          isPublished: this.modal.form.isPublished
        }
        const result = this.modal.editId
          ? await api.updatePodcastEpisode(this.modal.editId, data)
          : await api.createPodcastEpisode(data)
        if (result.success) {
          toast.success(this.modal.editId ? 'Episode updated' : 'Episode created')
          this.closeModal()
          await this.loadPodcastEpisodes()
        } else {
          // Check for slug conflict error
          const errorMsg = result.error || 'Failed to save'
          if (errorMsg.includes('UNIQUE constraint') || errorMsg.includes('slug')) {
            toast.error('A podcast episode with this title already exists. Please use a different title.')
          } else {
            toast.error(errorMsg)
          }
        }
      } catch (err) {
        // Check for slug conflict error in exception
        const errorMsg = err.message || 'Failed to save episode'
        if (errorMsg.includes('UNIQUE constraint') || errorMsg.includes('slug') || (err.data && err.data.message && err.data.message.includes('slug'))) {
          toast.error('A podcast episode with this title already exists. Please use a different title.')
        } else {
          toast.error(errorMsg)
        }
      } finally {
        this.modal.saving = false
      }
    },
    async deletePodcastEpisode(id) {
      if (!confirm('Delete this podcast episode? This cannot be undone.')) return
      try {
        const result = await api.deletePodcastEpisode(id)
        if (result.success) {
          toast.success('Episode deleted')
          await this.loadPodcastEpisodes()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },
    async handleAudioUpload(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      
      // Check file size (500MB max)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Audio file must be less than 500MB')
        return
      }
      
      this.audioUploading = true
      try {
        toast.info('Uploading audio file... This may take a moment.')
        const result = await api.uploadPodcastAudio(this.modal.editId, file)
        if (result.success) {
          this.modal.form.audioUrl = result.data?.data?.audioUrl || result.data?.audioUrl
          toast.success('Audio file uploaded successfully')
        } else {
          toast.error(result.error || 'Failed to upload audio')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.audioUploading = false
      }
    },
    handleCoverFileSelect(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      this.loadImageForCropping(file)
    },
    loadImageForCropping(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.cropper.imageData = e.target.result
        this.cropper.originalFile = file
        this.resetTransform()
        this.cropper.visible = true
        // Setup event listeners when cropper opens
        this.$nextTick(() => {
          this.setupCropperEventListeners()
        })
      }
      reader.readAsDataURL(file)
    },
    setupCropperEventListeners() {
      const wrapper = this.$refs.imageWrapper
      if (!wrapper || this.cropperEventListeners) return
      
      // Use native addEventListener with explicit passive options to avoid warnings
      const touchStartHandler = (e) => this.handleTouchStart(e)
      const touchMoveHandler = (e) => {
        if (e.touches.length === 1 && this.cropper.isDraggingImage) {
          e.preventDefault()
        } else if (e.touches.length === 2) {
          e.preventDefault()
        }
        this.handleTouchMove(e)
      }
      const touchEndHandler = (e) => this.handleTouchEnd(e)
      const wheelHandler = (e) => {
        e.preventDefault()
        this.handleWheel(e)
      }
      
      wrapper.addEventListener('touchstart', touchStartHandler, { passive: true })
      wrapper.addEventListener('touchmove', touchMoveHandler, { passive: false })
      wrapper.addEventListener('touchend', touchEndHandler, { passive: true })
      wrapper.addEventListener('wheel', wheelHandler, { passive: false })
      
      this.cropperEventListeners = {
        touchstart: touchStartHandler,
        touchmove: touchMoveHandler,
        touchend: touchEndHandler,
        wheel: wheelHandler,
        element: wrapper
      }
    },
    cleanupCropperEventListeners() {
      if (this.cropperEventListeners) {
        const { element, touchstart, touchmove, touchend, wheel } = this.cropperEventListeners
        if (element) {
          element.removeEventListener('touchstart', touchstart)
          element.removeEventListener('touchmove', touchmove)
          element.removeEventListener('touchend', touchend)
          element.removeEventListener('wheel', wheel)
        }
        this.cropperEventListeners = null
      }
    },
    openCoverCropper() {
      if (this.modal.form.coverImage) {
        // Load existing image for cropping
        this.loadImageFromUrl(this.modal.form.coverImage)
      }
    },
    async loadImageFromUrl(url) {
      try {
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) throw new Error('Failed to fetch image')
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = (e) => {
          this.cropper.imageData = e.target.result
          this.cropper.originalFile = new File([blob], 'cover.jpg', { type: blob.type || 'image/jpeg' })
          this.resetTransform()
          this.cropper.visible = true
        }
        reader.readAsDataURL(blob)
      } catch (err) {
        console.error('Failed to load image:', err)
        toast.error('Could not load image for cropping. Please upload a new image.')
      }
    },
    cancelCrop() {
      this.cropper.visible = false
      this.cropper.imageData = null
      this.cropper.originalFile = null
      this.cleanupCropperEventListeners()
    },
    onImageLoad() {
      this.$nextTick(() => {
        const img = this.$refs.cropperImage
        if (img) {
          this.cropper.imageWidth = img.naturalWidth
          this.cropper.imageHeight = img.naturalHeight
          this.calculateCropArea()
          this.fitImageToCropArea()
        }
      })
    },
    calculateCropArea() {
      const container = this.$refs.cropperContainer
      if (!container) return
      
      this.cropper.containerWidth = container.clientWidth
      this.cropper.containerHeight = container.clientHeight
      
      // Podcast cover aspect ratio (typically square or 1:1 for podcast covers)
      const targetAspect = 1
      const padding = 40
      const availableWidth = this.cropper.containerWidth - padding * 2
      const availableHeight = this.cropper.containerHeight - padding * 2
      
      if (targetAspect > availableWidth / availableHeight) {
        this.cropper.cropAreaWidth = availableWidth
        this.cropper.cropAreaHeight = availableWidth / targetAspect
      } else {
        this.cropper.cropAreaHeight = availableHeight
        this.cropper.cropAreaWidth = availableHeight * targetAspect
      }
    },
    fitImageToCropArea() {
      if (!this.cropper.imageWidth || !this.cropper.imageHeight || !this.cropper.cropAreaWidth || !this.cropper.cropAreaHeight) return
      
      const imageAspect = this.cropper.imageWidth / this.cropper.imageHeight
      const cropAspect = this.cropper.cropAreaWidth / this.cropper.cropAreaHeight
      
      if (imageAspect > cropAspect) {
        this.cropper.scale = this.cropper.cropAreaHeight / this.cropper.imageHeight
      } else {
        this.cropper.scale = this.cropper.cropAreaWidth / this.cropper.imageWidth
      }
      
      this.cropper.minScale = this.cropper.scale * 0.5
      this.cropper.scale = Math.max(this.cropper.scale, this.cropper.minScale)
      this.cropper.translateX = 0
      this.cropper.translateY = 0
    },
    resetTransform() {
      this.cropper.scale = 1
      this.cropper.translateX = 0
      this.cropper.translateY = 0
      this.$nextTick(() => {
        this.fitImageToCropArea()
      })
    },
    startDrag(event) {
      event.preventDefault()
      this.cropper.isDraggingImage = true
      this.cropper.dragStartX = event.clientX
      this.cropper.dragStartY = event.clientY
      this.cropper.lastTranslateX = this.cropper.translateX
      this.cropper.lastTranslateY = this.cropper.translateY
    },
    onDrag(event) {
      if (!this.cropper.isDraggingImage) return
      const deltaX = event.clientX - this.cropper.dragStartX
      const deltaY = event.clientY - this.cropper.dragStartY
      this.cropper.translateX = this.cropper.lastTranslateX + deltaX
      this.cropper.translateY = this.cropper.lastTranslateY + deltaY
      this.constrainPosition()
    },
    endDrag() {
      this.cropper.isDraggingImage = false
    },
    handleTouchStart(event) {
      if (event.touches.length === 1) {
        this.cropper.isDraggingImage = true
        this.cropper.dragStartX = event.touches[0].clientX
        this.cropper.dragStartY = event.touches[0].clientY
        this.cropper.lastTranslateX = this.cropper.translateX
        this.cropper.lastTranslateY = this.cropper.translateY
      } else if (event.touches.length === 2) {
        this.cropper.lastTouchDistance = this.getTouchDistance(event.touches)
      }
    },
    handleTouchMove(event) {
      if (event.touches.length === 1 && this.cropper.isDraggingImage) {
        event.preventDefault()
        const deltaX = event.touches[0].clientX - this.cropper.dragStartX
        const deltaY = event.touches[0].clientY - this.cropper.dragStartY
        this.cropper.translateX = this.cropper.lastTranslateX + deltaX
        this.cropper.translateY = this.cropper.lastTranslateY + deltaY
        this.constrainPosition()
      } else if (event.touches.length === 2) {
        event.preventDefault()
        const currentDistance = this.getTouchDistance(event.touches)
        const scaleDelta = currentDistance / this.cropper.lastTouchDistance
        const newScale = Math.min(Math.max(this.cropper.scale * scaleDelta, this.cropper.minScale), this.cropper.maxScale)
        this.cropper.scale = newScale
        this.cropper.lastTouchDistance = currentDistance
        this.constrainPosition()
      }
    },
    handleTouchEnd() {
      this.cropper.isDraggingImage = false
      this.cropper.lastTouchDistance = 0
    },
    getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    },
    handleWheel(event) {
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.min(Math.max(this.cropper.scale + delta, this.cropper.minScale), this.cropper.maxScale)
      this.cropper.scale = newScale
      this.constrainPosition()
    },
    zoomIn() {
      this.cropper.scale = Math.min(this.cropper.scale + 0.1, this.cropper.maxScale)
      this.constrainPosition()
    },
    zoomOut() {
      this.cropper.scale = Math.max(this.cropper.scale - 0.1, this.cropper.minScale)
      this.constrainPosition()
    },
    constrainPosition() {
      const scaledWidth = this.cropper.imageWidth * this.cropper.scale
      const scaledHeight = this.cropper.imageHeight * this.cropper.scale
      const maxX = Math.max(0, (scaledWidth - this.cropper.cropAreaWidth) / 2)
      const maxY = Math.max(0, (scaledHeight - this.cropper.cropAreaHeight) / 2)
      this.cropper.translateX = Math.max(-maxX, Math.min(maxX, this.cropper.translateX))
      this.cropper.translateY = Math.max(-maxY, Math.min(maxY, this.cropper.translateY))
    },
    async applyCrop() {
      try {
        const croppedFile = await this.generateCroppedImage()
        if (croppedFile) {
          await this.uploadCroppedCover(croppedFile)
        }
        this.cropper.visible = false
        this.cleanupCropperEventListeners()
      } catch (error) {
        console.error('Error applying crop:', error)
        toast.error('Failed to crop image. Please try again.')
        this.cleanupCropperEventListeners()
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
        const outputWidth = 800
        const outputHeight = 800
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        const scaledWidth = this.cropper.imageWidth * this.cropper.scale
        const scaledHeight = this.cropper.imageHeight * this.cropper.scale
        const imageCenterX = this.cropper.containerWidth / 2 + this.cropper.translateX
        const imageCenterY = this.cropper.containerHeight / 2 + this.cropper.translateY
        const cropLeft = (this.cropper.containerWidth - this.cropper.cropAreaWidth) / 2
        const cropTop = (this.cropper.containerHeight - this.cropper.cropAreaHeight) / 2
        
        const sourceX = ((cropLeft - imageCenterX + scaledWidth / 2) / this.cropper.scale)
        const sourceY = ((cropTop - imageCenterY + scaledHeight / 2) / this.cropper.scale)
        const sourceWidth = this.cropper.cropAreaWidth / this.cropper.scale
        const sourceHeight = this.cropper.cropAreaHeight / this.cropper.scale
        
        try {
          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight)
          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = this.cropper.originalFile?.name || 'cover.jpg'
              const file = new File([blob], fileName, { type: 'image/jpeg' })
              resolve(file)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, 'image/jpeg', 0.9)
        } catch (error) {
          reject(error)
        }
      })
    },
    async uploadCroppedCover(file) {
      if (!this.modal.editId) return
      this.coverUploading = true
      try {
        toast.info('Uploading cropped cover image...')
        const result = await api.uploadPodcastCover(this.modal.editId, file)
        if (result.success) {
          const newCoverImage = result.data?.data?.coverImage || result.data?.coverImage
          // Add cache-busting parameter to force image refresh
          const imageUrl = newCoverImage ? `${newCoverImage}${newCoverImage.includes('?') ? '&' : '?'}t=${Date.now()}` : null
          
          this.modal.form.coverImage = imageUrl || newCoverImage
          
          // Update the episode in the list to refresh the image
          const episodeIndex = this.podcastEpisodes.findIndex(e => e.id === this.modal.editId)
          if (episodeIndex !== -1) {
            // Use Vue 3 reactivity - create new array to trigger update
            this.podcastEpisodes = this.podcastEpisodes.map((ep, idx) => 
              idx === episodeIndex 
                ? { ...ep, coverImage: imageUrl || newCoverImage }
                : ep
            )
          }
          
          toast.success('Cover image uploaded')
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.coverUploading = false
      }
    },
    async savePodcastSettings() {
      // Debounce: only save if not already saving
      if (this.titleSaving || this.descriptionSaving || this.urlsSaving) return
      
      this.titleSaving = true
      this.descriptionSaving = true
      this.urlsSaving = true
      this.titleSaved = false
      this.descriptionSaved = false
      this.urlsSaved = false
      
      try {
        const result = await api.updatePodcastSettings({
          podcastTitle: this.podcastTitle || null,
          podcastDescription: this.podcastDescription || null,
          applePodcastUrl: this.applePodcastUrl || null,
          spotifyUrl: this.spotifyUrl || null
        })
        if (result.success) {
          this.titleSaved = true
          this.descriptionSaved = true
          this.urlsSaved = true
          toast.success('Podcast settings saved')
          // Hide saved indicators after 2 seconds
          setTimeout(() => {
            this.titleSaved = false
            this.descriptionSaved = false
            this.urlsSaved = false
          }, 2000)
        } else {
          toast.error(result.error || 'Failed to save podcast settings')
        }
      } catch (err) {
        console.error('Failed to save podcast settings:', err)
        toast.error(err.message || 'Failed to save podcast settings')
      } finally {
        this.titleSaving = false
        this.descriptionSaving = false
        this.urlsSaving = false
      }
    }
  }
}
</script>

<style scoped>
.podcast-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.podcast-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--border-light);
}

.podcast-tabs .tab-button {
  padding: var(--spacing-md) var(--spacing-xl);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.podcast-tabs .tab-button:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.podcast-tabs .tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.podcast-tabs .tab-button i {
  font-size: var(--font-size-sm);
}

.tab-content {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-intro {
  margin-bottom: var(--spacing-xl);
}

.settings-intro h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-intro h1 i {
  color: var(--secondary-color);
}

.settings-intro p {
  color: var(--text-secondary);
  margin: 0;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title i {
  color: var(--secondary-color);
}

.section-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--spacing-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.stats-row {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.add-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.add-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-1px);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.2;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-state p {
  margin: 0 0 var(--spacing-lg) 0;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.episode-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.episode-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.episode-number {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-secondary);
  font-family: monospace;
  width: 24px;
  text-align: center;
}

.episode-cover {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-hover));
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
}

.episode-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  opacity: 0.7;
}

.play-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-size: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.episode-content {
  flex: 1;
  min-width: 0;
}

.episode-badges {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.badge {
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.premium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge.published {
  background: #22c55e;
  color: white;
}

.badge.draft {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.badge.no-audio {
  background: #ef4444;
  color: white;
}

.episode-content h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
}

.episode-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.episode-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.episode-meta i {
  margin-right: 4px;
}

.episode-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.action-btn {
  width: 36px;
  height: 36px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.action-btn.delete:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: var(--spacing-md);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: min(600px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px var(--secondary-light);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
}

.saving-indicator,
.saved-indicator {
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.saving-indicator {
  color: var(--secondary-color);
}

.saved-indicator {
  color: var(--success-color);
}

.form-row {
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--secondary-color);
}

.text-amber {
  color: #f59e0b;
}

.text-green {
  color: #22c55e;
}

.upload-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.upload-section h4 {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.upload-section h4 i {
  color: var(--secondary-color);
}

.file-upload-area {
  position: relative;
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--bg-primary);
}

.file-upload-area:hover {
  border-color: var(--secondary-color);
  background: var(--secondary-light);
}

.file-upload-area.has-file {
  border-color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
}

.file-upload-content i {
  font-size: 1.5rem;
  opacity: 0.5;
}

.file-upload-content small {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.upload-progress {
  margin-top: var(--spacing-sm);
  text-align: center;
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
}

.cover-preview-wrapper {
  position: relative;
  margin-top: var(--spacing-sm);
  display: inline-block;
}

.cover-preview {
  max-width: 100%;
  max-height: 150px;
  border-radius: var(--radius-md);
  object-fit: cover;
  display: block;
}

.crop-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.crop-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.helper-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.modal-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-xl);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.modal-btn.ghost {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
}

.modal-btn.primary {
  background: var(--secondary-color);
  color: #fff;
}

.modal-btn.primary:hover {
  background: var(--secondary-hover);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .settings-section {
    padding: var(--spacing-md);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-row {
    flex-wrap: wrap;
  }
  
  .episode-card {
    flex-wrap: wrap;
  }
  
  .episode-number {
    display: none;
  }
  
  .episode-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}

/* Cropper Modal Styles */
.cropper-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-md);
}

.cropper-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: min(90vw, 800px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.cropper-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
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
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-image-wrapper {
  position: relative;
  cursor: move;
  user-select: none;
  touch-action: none;
}

.cropper-image-wrapper img {
  max-width: none;
  max-height: none;
  display: block;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crop-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.crop-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid white;
  background: var(--secondary-color);
}

.crop-corner.top-left {
  top: -10px;
  left: -10px;
  border-right: none;
  border-bottom: none;
}

.crop-corner.top-right {
  top: -10px;
  right: -10px;
  border-left: none;
  border-bottom: none;
}

.crop-corner.bottom-left {
  bottom: -10px;
  left: -10px;
  border-right: none;
  border-top: none;
}

.crop-corner.bottom-right {
  bottom: -10px;
  right: -10px;
  border-left: none;
  border-top: none;
}

.crop-grid {
  position: absolute;
  inset: 0;
}

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  top: 33.33%;
}

.grid-line.horizontal:last-of-type {
  top: 66.66%;
}

.grid-line.vertical {
  height: 100%;
  width: 1px;
  left: 33.33%;
}

.grid-line.vertical:last-of-type {
  left: 66.66%;
}

.cropper-controls {
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 200px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.zoom-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-slider-container {
  flex: 1;
  min-width: 100px;
}

.zoom-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-secondary);
  outline: none;
  -webkit-appearance: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--secondary-color);
  cursor: pointer;
}

.zoom-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--secondary-color);
  cursor: pointer;
  border: none;
}

.reset-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.reset-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

.cropper-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.btn-primary {
  background: var(--secondary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--secondary-hover);
}

@media (max-width: 768px) {
  .cropper-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .cropper-container {
    height: 300px;
  }

  .cropper-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .zoom-controls {
    width: 100%;
  }
}
</style>

