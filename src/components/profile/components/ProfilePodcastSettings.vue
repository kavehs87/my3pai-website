<template>
  <div class="podcast-settings">
    <div class="container">
      <div class="settings-intro">
        <h1><i class="fas fa-podcast"></i> Podcast Episodes</h1>
        <p>Create and manage your podcast episodes. Premium episodes require a subscription to listen.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ podcastEpisodes.length }}</span>
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
        
        <div v-else-if="podcastEpisodes.length === 0" class="empty-state">
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
              <div class="file-upload-area">
                <input type="file" accept="image/*" class="file-input" @change="handleCoverUpload" />
                <div class="file-upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Click or drag to upload cover image</span>
                </div>
              </div>
              <img v-if="modal.form.coverImage" :src="modal.form.coverImage" alt="Cover" class="cover-preview" />
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
  </div>
</template>

<script>
import api from '@/services/api'
import toast from '@/utils/toast'

export default {
  name: 'ProfilePodcastSettings',
  data() {
    return {
      podcastEpisodes: [],
      loading: false,
      audioUploading: false,
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
      }
    }
  },
  computed: {
    publishedCount() {
      return this.podcastEpisodes.filter(e => e.isPublished).length
    },
    premiumCount() {
      return this.podcastEpisodes.filter(e => e.isPremium).length
    },
    totalPlays() {
      return this.podcastEpisodes.reduce((sum, e) => sum + (e.playsCount || 0), 0)
    }
  },
  mounted() {
    this.loadPodcastEpisodes()
  },
  methods: {
    async loadPodcastEpisodes() {
      this.loading = true
      try {
        const result = await api.getMyPodcastEpisodes()
        if (result.success) {
          this.podcastEpisodes = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load podcast episodes:', err)
        toast.error('Failed to load podcast episodes')
      } finally {
        this.loading = false
      }
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
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
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
    async handleCoverUpload(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      try {
        toast.info('Uploading cover image...')
        const result = await api.uploadPodcastCover(this.modal.editId, file)
        if (result.success) {
          this.modal.form.coverImage = result.data?.data?.coverImage || result.data?.coverImage
          toast.success('Cover image uploaded')
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
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

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

.cover-preview {
  max-width: 100%;
  max-height: 150px;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
  object-fit: cover;
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
</style>

