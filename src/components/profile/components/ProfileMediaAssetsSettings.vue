<template>
  <div class="media-assets-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Digital Assets"
        tool-id="media-assets"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-photo-video"></i> Digital Assets & Stock</h1>
        <p>Create and manage your digital assets marketplace. Sell stock footage, photo packs, LUTs, presets, and more.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ mediaAssets.length }}</span>
              <span class="stat-label">Total Assets</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ activeCount }}</span>
              <span class="stat-label">Active</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalDownloads }}</span>
              <span class="stat-label">Downloads</span>
            </div>
          </div>
          <button class="add-btn" @click="openAssetModal()">
            <i class="fas fa-plus"></i> New Asset
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="mediaAssets.length === 0" class="empty-state">
          <i class="fas fa-photo-video"></i>
          <h3>No media assets yet</h3>
          <p>Create your first digital asset to sell to your audience</p>
          <button class="add-btn" @click="openAssetModal()">
            <i class="fas fa-plus"></i> Create First Asset
          </button>
        </div>
        
        <div v-else class="assets-grid">
          <article v-for="asset in mediaAssets" :key="asset.id" class="asset-card">
            <div class="asset-image" :style="asset.image ? { backgroundImage: `url(${asset.image})` } : {}">
              <div v-if="!asset.image" class="asset-image-placeholder">
                <i class="fas fa-image"></i>
              </div>
              <div class="asset-badges">
                <span :class="['badge', asset.isActive ? 'active' : 'draft']">
                  {{ asset.isActive ? 'Active' : 'Draft' }}
                </span>
                <span class="badge type">{{ asset.type }}</span>
              </div>
            </div>
            <div class="asset-content">
              <h3>{{ asset.title }}</h3>
              <p v-if="asset.description" class="asset-description">{{ asset.description }}</p>
              <div class="asset-meta">
                <span v-if="asset.price" class="price">{{ formatPrice(asset.price, asset.currency) }}</span>
                <span v-if="asset.downloadCount !== undefined">
                  <i class="fas fa-download"></i> {{ asset.downloadCount }}
                </span>
                <span v-if="asset.fileFormat" class="format">{{ asset.fileFormat.toUpperCase() }}</span>
              </div>
            </div>
            <div class="asset-actions">
              <button class="action-btn" @click="openAssetModal(asset)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="deleteAsset(asset.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Asset Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Create' }} Media Asset</h3>
            <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveAsset">
            <div class="form-group">
              <label>Title *</label>
              <input v-model="modal.form.title" type="text" class="form-input" placeholder="Asset title" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Description *</label>
              <textarea v-model="modal.form.description" class="form-input" rows="3" placeholder="Describe your asset..." required maxlength="1000"></textarea>
              <span class="char-count">{{ (modal.form.description || '').length }}/1000</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type *</label>
                <select v-model="modal.form.type" class="form-input" required>
                  <option value="Video">Video</option>
                  <option value="Photo">Photo</option>
                  <option value="Preset">Preset</option>
                  <option value="Audio">Audio</option>
                  <option value="Template">Template</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Price *</label>
                <div class="price-input-group">
                  <input v-model.number="modal.form.price" type="number" step="0.01" min="0" class="form-input" placeholder="0.00" required />
                  <select v-model="modal.form.currency" class="form-input currency-select">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="form-row">
              <label class="checkbox-label">
                <input v-model="modal.form.isActive" type="checkbox" class="checkbox-input" />
                <span><i class="fas fa-globe text-green"></i> Active (Visible to public)</span>
              </label>
            </div>
            <div v-if="modal.editId" class="form-group">
              <label>Preview Image</label>
              <div class="file-upload-area">
                <input type="file" accept="image/*" class="file-input" @change="handleImageUpload" />
                <div class="file-upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Click or drag to upload preview image</span>
                </div>
              </div>
              <img v-if="modal.form.image" :src="modal.form.image" alt="Preview" class="image-preview" />
            </div>
            <div v-if="modal.editId" class="form-group">
              <label>Asset File</label>
              <div class="file-upload-area">
                <input type="file" class="file-input" @change="handleFileUpload" />
                <div class="file-upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span>Click or drag to upload asset file (zip, mp4, etc.)</span>
                </div>
              </div>
              <div v-if="modal.form.fileUrl" class="file-info">
                <i class="fas fa-file"></i>
                <span>File uploaded: {{ modal.form.fileFormat }} ({{ formatFileSize(modal.form.fileSize) }})</span>
              </div>
            </div>
            <p v-if="!modal.editId" class="helper-text">
              <i class="fas fa-info-circle"></i> Save the asset first, then you can upload preview image and file.
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
import DisabledFeatureBanner from './DisabledFeatureBanner.vue'
import eventBus from '@/utils/eventBus'

export default {
  name: 'ProfileMediaAssetsSettings',
  components: {
    DisabledFeatureBanner
  },
  data() {
    return {
      mediaAssets: [],
      loading: false,
      isEnabled: true,
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          title: '',
          description: '',
          type: 'Video',
          price: 0,
          currency: 'USD',
          isActive: true,
          image: null,
          fileUrl: null,
          fileSize: null,
          fileFormat: null,
        }
      }
    }
  },
  computed: {
    activeCount() {
      return this.mediaAssets.filter(a => a.isActive).length
    },
    totalDownloads() {
      return this.mediaAssets.reduce((sum, a) => sum + (a.downloadCount || 0), 0)
    }
  },
  mounted() {
    this.loadMediaAssets()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  methods: {
    async loadMediaAssets() {
      this.loading = true
      try {
        const result = await api.getMyMediaAssets()
        if (result.success && result.data) {
          // Handle nested response structure: { success: true, data: { data: [...], meta: {...} } }
          const responseData = result.data.data || result.data
          this.mediaAssets = Array.isArray(responseData) ? responseData : (responseData?.data || [])
        }
      } catch (err) {
        console.error('Failed to load media assets:', err)
        toast.error('Failed to load media assets')
      } finally {
        this.loading = false
      }
    },
    async loadVisibilityStatus() {
      try {
        const result = await api.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          // API uses 'media-assets' with hyphen
          this.isEnabled = settings['media-assets'] !== false // Default to true if not set
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'media-assets') {
        this.isEnabled = data.enabled
      }
    },
    handleEnabled() {
      this.isEnabled = true
    },
    formatPrice(price, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(price)
    },
    formatFileSize(bytes) {
      if (!bytes) return 'N/A'
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    },
    openAssetModal(asset = null) {
      this.modal.editId = asset?.id || null
      this.modal.form = asset
        ? {
            title: asset.title,
            description: asset.description || '',
            type: asset.type || 'Video',
            price: asset.price || 0,
            currency: asset.currency || 'USD',
            isActive: asset.isActive !== false,
            image: asset.image || null,
            fileUrl: asset.fileUrl || null,
            fileSize: asset.fileSize || null,
            fileFormat: asset.fileFormat || null,
          }
        : { title: '', description: '', type: 'Video', price: 0, currency: 'USD', isActive: true, image: null, fileUrl: null, fileSize: null, fileFormat: null }
      this.modal.visible = true
    },
    closeModal() {
      this.modal.visible = false
    },
    async saveAsset() {
      this.modal.saving = true
      try {
        const data = {
          title: this.modal.form.title,
          description: this.modal.form.description,
          type: this.modal.form.type,
          price: parseFloat(this.modal.form.price) || 0,
          currency: this.modal.form.currency,
          isActive: this.modal.form.isActive
        }
        const result = this.modal.editId
          ? await api.updateMediaAsset(this.modal.editId, data)
          : await api.createMediaAsset(data)
        if (result.success) {
          toast.success(this.modal.editId ? 'Media asset updated' : 'Media asset created')
          this.closeModal()
          await this.loadMediaAssets()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modal.saving = false
      }
    },
    async deleteAsset(id) {
      if (!confirm('Delete this media asset? This cannot be undone.')) return
      try {
        const result = await api.deleteMediaAsset(id)
        if (result.success) {
          toast.success('Media asset deleted')
          await this.loadMediaAssets()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },
    async handleImageUpload(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      try {
        toast.info('Uploading preview image...')
        const result = await api.uploadMediaAssetImage(this.modal.editId, file)
        if (result.success) {
          this.modal.form.image = result.data?.data?.image || result.data?.image
          toast.success('Preview image uploaded')
          await this.loadMediaAssets()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      try {
        toast.info('Uploading asset file...')
        const result = await api.uploadMediaAssetFile(this.modal.editId, file)
        if (result.success) {
          const data = result.data?.data || result.data
          this.modal.form.fileUrl = data.fileUrl
          this.modal.form.fileSize = data.fileSize
          this.modal.form.fileFormat = data.fileFormat
          toast.success('Asset file uploaded')
          await this.loadMediaAssets()
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
.media-assets-settings {
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
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  white-space: nowrap;
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

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.asset-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.asset-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.asset-image {
  height: 140px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  background-size: cover;
  background-position: center;
  position: relative;
}

.asset-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 2rem;
  opacity: 0.3;
}

.asset-badges {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.badge {
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.active {
  background: #22c55e;
  color: white;
}

.badge.draft {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.badge.type {
  background: var(--secondary-color);
  color: white;
}

.asset-content {
  padding: var(--spacing-md);
}

.asset-content h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.asset-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.asset-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  align-items: center;
  flex-wrap: wrap;
}

.asset-meta .price {
  font-weight: 700;
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
}

.asset-actions {
  display: flex;
  border-top: 1px solid var(--border-light);
}

.action-btn {
  flex: 1;
  padding: var(--spacing-sm);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  background: var(--error-color);
  color: white;
}

.action-btn + .action-btn {
  border-left: 1px solid var(--border-light);
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
  width: min(900px, 95%);
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
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.form-row .form-group {
  flex: 1;
  min-width: 200px;
}

.price-input-group {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-sm);
}

.currency-select {
  min-width: 100px;
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

.text-green {
  color: #22c55e;
}

.file-upload-area {
  position: relative;
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.file-upload-area:hover {
  border-color: var(--secondary-color);
  background: var(--secondary-light);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.file-upload-content i {
  font-size: 2rem;
  color: var(--text-tertiary);
}

.image-preview {
  margin-top: var(--spacing-md);
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
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
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.modal-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.modal-btn.ghost {
  background: transparent;
  color: var(--text-secondary);
}

.modal-btn.ghost:hover {
  background: var(--bg-secondary);
}

.modal-btn.primary {
  background: var(--secondary-color);
  color: white;
}

.modal-btn.primary:hover:not(:disabled) {
  background: var(--secondary-hover);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

