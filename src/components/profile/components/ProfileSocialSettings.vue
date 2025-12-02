<template>
  <div class="social-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Social Posts"
        tool-id="social"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-share-alt"></i> Social Posts</h1>
        <p>Manage your social media posts shown on your public profile. Add YouTube videos, Instagram Reels, TikTok videos, and more.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ allPosts.length }}</span>
              <span class="stat-label">Total Posts</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ youtubeCount }}</span>
              <span class="stat-label">YouTube</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ shortFormCount }}</span>
              <span class="stat-label">Short-Form</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ publishedCount }}</span>
              <span class="stat-label">Published</span>
            </div>
          </div>
          <button class="add-btn" @click="openPostModal()">
            <i class="fas fa-plus"></i> New Post
          </button>
        </div>
        
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button 
            :class="['tab-btn', { active: activeFilter === 'all' }]"
            @click="activeFilter = 'all'"
          >
            All Posts
          </button>
          <button 
            :class="['tab-btn', { active: activeFilter === 'youtube' }]"
            @click="activeFilter = 'youtube'"
          >
            YouTube
          </button>
          <button 
            :class="['tab-btn', { active: activeFilter === 'short-form' }]"
            @click="activeFilter = 'short-form'"
          >
            Short-Form
          </button>
          <button 
            :class="['tab-btn', { active: activeFilter === 'draft' }]"
            @click="activeFilter = 'draft'"
          >
            Drafts
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="filteredPosts.length === 0" class="empty-state">
          <i class="fas fa-share-alt"></i>
          <h3>No social posts yet</h3>
          <p>Create your first social post to showcase your content</p>
          <button class="add-btn" @click="openPostModal()">
            <i class="fas fa-plus"></i> Create First Post
          </button>
        </div>
        
        <div v-else class="posts-grid">
          <article v-for="post in filteredPosts" :key="post.id" class="post-card">
            <div class="post-image">
              <img 
                :src="post.thumbnail || '/media-placeholder.jpg'" 
                :alt="post.title || post.caption"
                @error="handleImageError"
              />
              <div class="post-badges">
                <span :class="['badge', post.status === 'published' ? 'published' : 'draft']">
                  {{ post.status === 'published' ? 'Published' : 'Draft' }}
                </span>
                <span class="badge platform" :class="getPlatformClass(post.platform)">
                  {{ post.platform }}
                </span>
              </div>
            </div>
            <div class="post-content">
              <h3 v-if="post.title">{{ post.title }}</h3>
              <p v-if="post.caption" class="post-caption">{{ post.caption }}</p>
              <div class="post-meta">
                <span v-if="post.views"><i class="fas fa-eye"></i> {{ post.views }}</span>
                <span v-if="post.duration"><i class="fas fa-clock"></i> {{ post.duration }}</span>
                <span v-if="post.published_at">{{ formatDate(post.published_at) }}</span>
              </div>
            </div>
            <div class="post-actions">
              <button class="action-btn" @click="openPostModal(post)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="deletePost(post.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Post Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Create' }} Social Post</h3>
            <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="savePost">
            <div class="form-group">
              <label>Type *</label>
              <select v-model="modal.form.type" class="form-input" required @change="handleTypeChange">
                <option value="">Select type...</option>
                <option value="youtube">YouTube Video</option>
                <option value="short-form">Short-Form Content</option>
              </select>
            </div>

            <div v-if="modal.form.type === 'short-form'" class="form-group">
              <label>Platform *</label>
              <select v-model="modal.form.platform" class="form-input" required>
                <option value="">Select platform...</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
              </select>
            </div>

            <div v-if="modal.form.type === 'youtube'" class="form-group">
              <label>Title *</label>
              <input 
                v-model="modal.form.title" 
                type="text" 
                class="form-input" 
                placeholder="Video title" 
                required 
                maxlength="255" 
              />
            </div>

            <div v-if="modal.form.type === 'short-form'" class="form-group">
              <label>Caption</label>
              <textarea 
                v-model="modal.form.caption" 
                class="form-input" 
                rows="3" 
                placeholder="Post caption..."
                maxlength="500"
              ></textarea>
              <span class="char-count">{{ (modal.form.caption || '').length }}/500</span>
            </div>

            <div class="form-group">
              <label>Thumbnail URL *</label>
              <input 
                v-model="modal.form.thumbnail" 
                type="url" 
                class="form-input" 
                placeholder="https://..." 
                required 
              />
              <p class="helper-text">Enter the URL of the thumbnail/preview image</p>
              <img v-if="modal.form.thumbnail" :src="modal.form.thumbnail" alt="Preview" class="thumbnail-preview" @error="handlePreviewError" />
            </div>

            <div class="form-group">
              <label>Post URL *</label>
              <input 
                v-model="modal.form.url" 
                type="url" 
                class="form-input" 
                placeholder="https://..." 
                required 
              />
              <p class="helper-text">Link to the video/post on the platform</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Views</label>
                <input 
                  v-model="modal.form.views" 
                  type="text" 
                  class="form-input" 
                  placeholder="125K"
                />
                <p class="helper-text">Display format (e.g., "125K", "1.2M")</p>
              </div>
              <div v-if="modal.form.type === 'youtube'" class="form-group">
                <label>Duration</label>
                <input 
                  v-model="modal.form.duration" 
                  type="text" 
                  class="form-input" 
                  placeholder="14:20"
                />
                <p class="helper-text">Video length (e.g., "14:20")</p>
              </div>
            </div>

            <div class="form-row">
              <label class="checkbox-label">
                <input v-model="modal.form.status" type="checkbox" true-value="published" false-value="draft" class="checkbox-input" />
                <span><i class="fas fa-globe text-green"></i> Published (Visible to public)</span>
              </label>
            </div>

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
import DisabledFeatureBanner from './DisabledFeatureBanner.vue'
import eventBus from '@/utils/eventBus'

export default {
  name: 'ProfileSocialSettings',
  components: {
    DisabledFeatureBanner
  },
  data() {
    return {
      socialPosts: [],
      loading: false,
      isEnabled: true,
      activeFilter: 'all',
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          type: '',
          platform: '',
          title: '',
          caption: '',
          thumbnail: '',
          url: '',
          views: '',
          duration: '',
          status: 'published'
        }
      }
    }
  },
  computed: {
    allPosts() {
      return this.socialPosts
    },
    youtubeCount() {
      return this.socialPosts.filter(p => p.type === 'youtube').length
    },
    shortFormCount() {
      return this.socialPosts.filter(p => p.type === 'short-form').length
    },
    publishedCount() {
      return this.socialPosts.filter(p => p.status === 'published').length
    },
    filteredPosts() {
      if (this.activeFilter === 'all') {
        return this.socialPosts
      } else if (this.activeFilter === 'youtube') {
        return this.socialPosts.filter(p => p.type === 'youtube')
      } else if (this.activeFilter === 'short-form') {
        return this.socialPosts.filter(p => p.type === 'short-form')
      } else if (this.activeFilter === 'draft') {
        return this.socialPosts.filter(p => p.status === 'draft')
      }
      return this.socialPosts
    }
  },
  mounted() {
    this.loadSocialPosts()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  methods: {
    async loadSocialPosts() {
      this.loading = true
      try {
        const result = await api.getInfluencerSocialPosts()
        if (result.success) {
          // Combine YouTube videos and short-form content into one array
          const data = result.data?.data || result.data || {}
          const posts = []
          
          // Add YouTube videos
          if (data.youtube_videos && Array.isArray(data.youtube_videos)) {
            posts.push(...data.youtube_videos.map(v => ({ ...v, type: 'youtube' })))
          }
          
          // Add short-form content
          if (data.short_form_content && Array.isArray(data.short_form_content)) {
            posts.push(...data.short_form_content.map(p => ({ ...p, type: 'short-form' })))
          }
          
          // Sort by created_at or published_at (most recent first)
          posts.sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at || 0)
            const dateB = new Date(b.published_at || b.created_at || 0)
            return dateB - dateA
          })
          
          this.socialPosts = posts
        }
      } catch (err) {
        console.error('Failed to load social posts:', err)
        toast.error('Failed to load social posts')
      } finally {
        this.loading = false
      }
    },
    async loadVisibilityStatus() {
      try {
        const result = await api.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          this.isEnabled = settings.social !== false
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'social') {
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
    getPlatformClass(platform) {
      if (!platform) return ''
      const classes = {
        'YouTube': 'youtube',
        'Instagram': 'instagram',
        'TikTok': 'tiktok',
        'Facebook': 'facebook',
        'YouTube Shorts': 'youtube-shorts'
      }
      return classes[platform] || ''
    },
    handleImageError(event) {
      if (event.target.src !== '/media-placeholder.jpg' && !event.target.src.includes('media-placeholder')) {
        event.target.src = '/media-placeholder.jpg'
      }
    },
    handlePreviewError(event) {
      event.target.style.display = 'none'
    },
    handleTypeChange() {
      // Reset platform when type changes
      if (this.modal.form.type !== 'short-form') {
        this.modal.form.platform = ''
      }
      // Auto-set platform for YouTube
      if (this.modal.form.type === 'youtube') {
        this.modal.form.platform = 'YouTube'
      }
    },
    openPostModal(post = null) {
      this.modal.editId = post?.id || null
      this.modal.form = post
        ? {
            type: post.type || '',
            platform: post.platform || '',
            title: post.title || '',
            caption: post.caption || '',
            thumbnail: post.thumbnail || '',
            url: post.url || '',
            views: post.views || '',
            duration: post.duration || '',
            status: post.status || 'published'
          }
        : {
            type: '',
            platform: '',
            title: '',
            caption: '',
            thumbnail: '',
            url: '',
            views: '',
            duration: '',
            status: 'published'
          }
      this.modal.visible = true
    },
    closeModal() {
      this.modal.visible = false
      this.modal.editId = null
      this.modal.form = {
        type: '',
        platform: '',
        title: '',
        caption: '',
        thumbnail: '',
        url: '',
        views: '',
        duration: '',
        status: 'published'
      }
    },
    async savePost() {
      this.modal.saving = true
      try {
        const data = {
          type: this.modal.form.type,
          platform: this.modal.form.platform || (this.modal.form.type === 'youtube' ? 'YouTube' : null),
          title: this.modal.form.title || null,
          caption: this.modal.form.caption || null,
          thumbnail: this.modal.form.thumbnail,
          url: this.modal.form.url,
          views: this.modal.form.views || null,
          duration: this.modal.form.duration || null,
          status: this.modal.form.status || 'published'
        }

        // Remove null/empty fields
        Object.keys(data).forEach(key => {
          if (data[key] === null || data[key] === '') {
            delete data[key]
          }
        })

        const result = this.modal.editId
          ? await api.updateInfluencerSocialPost(this.modal.editId, data)
          : await api.createInfluencerSocialPost(data)
        
        if (result.success) {
          toast.success(this.modal.editId ? 'Social post updated' : 'Social post created')
          this.closeModal()
          await this.loadSocialPosts()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to save social post')
      } finally {
        this.modal.saving = false
      }
    },
    async deletePost(id) {
      if (!confirm('Delete this social post? This cannot be undone.')) return
      try {
        const result = await api.deleteInfluencerSocialPost(id)
        if (result.success) {
          toast.success('Social post deleted')
          await this.loadSocialPosts()
        } else {
          toast.error(result.error || 'Failed to delete')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to delete social post')
      }
    }
  }
}
</script>

<style scoped>
.social-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.settings-intro {
  margin-bottom: var(--spacing-xl);
}

.settings-intro h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-intro h1 i {
  color: var(--secondary-color);
}

.settings-intro p {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
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
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.add-btn {
  background: var(--secondary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.add-btn:hover {
  background: var(--secondary-hover);
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--border-light);
  padding-bottom: var(--spacing-sm);
}

.tab-btn {
  background: transparent;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--secondary-color);
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: calc(-1 * var(--spacing-sm) - 2px);
  left: 0;
  right: 0;
  height: 2px;
  background: var(--secondary-color);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.post-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--bg-secondary);
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-badges {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.badge {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.badge.published {
  background: rgba(34, 197, 94, 0.9);
}

.badge.draft {
  background: rgba(251, 191, 36, 0.9);
}

.badge.platform {
  background: rgba(59, 130, 246, 0.9);
}

.post-content {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-content h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-clamp: 2;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-caption {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-clamp: 2;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: auto;
}

.post-meta i {
  margin-right: 4px;
}

.post-actions {
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.action-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  flex: 1;
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background: #fee;
  border-color: #fcc;
  color: #c33;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: all var(--transition-normal);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(var(--secondary-color-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.char-count {
  display: block;
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.thumbnail-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
  object-fit: cover;
}

.helper-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
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
  
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

