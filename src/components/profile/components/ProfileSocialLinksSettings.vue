<template>
  <div class="social-links-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Social Links"
        tool-id="social-links"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-link"></i> Social Links</h1>
        <p>Manage your social media profile links that appear on your public profile page.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ socials.length }}</span>
              <span class="stat-label">Total Links</span>
            </div>
          </div>
          <button class="add-btn" @click="openSocialModal()">
            <i class="fas fa-plus"></i> Add Social Link
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="socials.length === 0" class="empty-state">
          <i class="fab fa-instagram"></i>
          <h3>No social links added yet</h3>
          <p>Add your social media profile links to help visitors find you on other platforms</p>
          <button class="add-btn" @click="openSocialModal()">
            <i class="fas fa-plus"></i> Add First Link
          </button>
        </div>
        
        <div v-else class="items-list">
          <div v-for="social in socials" :key="social.id" class="list-item">
            <div class="item-icon" :class="social.platform">
              <i :class="getPlatformIcon(social.platform)"></i>
            </div>
            <div class="item-content">
              <span class="item-title">{{ formatPlatform(social.platform) }}</span>
              <span class="item-subtitle">{{ social.handle || social.url }}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn" @click="openSocialModal(social)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteSocial(social.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Social Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeSocialModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Add' }} Social Link</h3>
            <button class="close-btn" @click="closeSocialModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveSocial">
            <div class="form-group">
              <label>Platform *</label>
              <select v-model="modal.form.platform" class="form-input" required>
                <option value="">Select platform...</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL *</label>
              <input 
                v-model="modal.form.url" 
                type="url" 
                class="form-input" 
                placeholder="https://..." 
                required 
              />
              <p class="helper-text">The full URL to your profile on this platform</p>
            </div>
            <div class="form-group">
              <label>Handle (optional)</label>
              <input 
                v-model="modal.form.handle" 
                type="text" 
                class="form-input" 
                placeholder="@username" 
              />
              <p class="helper-text">Your username/handle (e.g., @username) - will be displayed instead of full URL</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeSocialModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modal.saving">
                <span v-if="modal.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modal.editId ? 'Update' : 'Add' }}</span>
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
  name: 'ProfileSocialLinksSettings',
  components: {
    DisabledFeatureBanner
  },
  data() {
    return {
      socials: [],
      loading: false,
      isEnabled: true,
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          platform: '',
          url: '',
          handle: ''
        }
      }
    }
  },
  mounted() {
    this.loadSocials()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  methods: {
    async loadSocials() {
      this.loading = true
      try {
        const result = await api.getInfluencerSocials()
        if (result.success) {
          this.socials = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load socials:', err)
        toast.error('Failed to load social links')
      } finally {
        this.loading = false
      }
    },
    async loadVisibilityStatus() {
      try {
        const result = await api.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          this.isEnabled = settings['social-links'] !== false
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'social-links') {
        this.isEnabled = data.enabled
      }
    },
    handleEnabled() {
      this.isEnabled = true
    },
    getPlatformIcon(platform) {
      const icons = {
        instagram: 'fab fa-instagram',
        youtube: 'fab fa-youtube',
        tiktok: 'fab fa-tiktok',
        twitter: 'fab fa-twitter',
        facebook: 'fab fa-facebook',
        linkedin: 'fab fa-linkedin'
      }
      return icons[platform] || 'fas fa-link'
    },
    formatPlatform(platform) {
      if (!platform) return ''
      // Handle special cases
      if (platform === 'twitter') return 'Twitter/X'
      return platform.charAt(0).toUpperCase() + platform.slice(1)
    },
    openSocialModal(social = null) {
      this.modal.editId = social?.id || null
      this.modal.form = social ? { ...social } : { platform: '', url: '', handle: '' }
      this.modal.visible = true
    },
    closeSocialModal() {
      this.modal.visible = false
      this.modal.editId = null
      this.modal.form = { platform: '', url: '', handle: '' }
    },
    async saveSocial() {
      this.modal.saving = true
      try {
        const data = this.modal.form
        const result = this.modal.editId
          ? await api.updateInfluencerSocial(this.modal.editId, data)
          : await api.createInfluencerSocial(data)
        if (result.success) {
          toast.success(this.modal.editId ? 'Social link updated' : 'Social link added')
          this.closeSocialModal()
          await this.loadSocials()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to save social link')
      } finally {
        this.modal.saving = false
      }
    },
    async deleteSocial(id) {
      if (!confirm('Delete this social link?')) return
      try {
        const result = await api.deleteInfluencerSocial(id)
        if (result.success) {
          toast.success('Social link deleted')
          await this.loadSocials()
        } else {
          toast.error(result.error || 'Failed to delete')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to delete social link')
      }
    }
  }
}
</script>

<style scoped>
.social-links-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 100vh;
}

.container {
  max-width: 1000px;
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

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.list-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--secondary-color);
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  flex-shrink: 0;
}

.item-icon.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.item-icon.youtube {
  background: #ff0000;
}

.item-icon.tiktok {
  background: #000;
}

.item-icon.twitter {
  background: #1da1f2;
}

.item-icon.facebook {
  background: #1877f2;
}

.item-icon.linkedin {
  background: #0077b5;
}

.item-icon.other {
  background: var(--secondary-color);
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.item-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.item-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  word-break: break-all;
}

.item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.icon-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.icon-btn.delete:hover {
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
  max-width: 500px;
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

.form-input {
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

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(var(--secondary-color-rgb), 0.1);
}

.helper-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
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
}
</style>

