<template>
  <div class="masterclass-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Training & Masterclasses"
        tool-id="masterclass"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-graduation-cap"></i> Training & Masterclasses</h1>
        <p>Create and manage your training courses and masterclasses. Premium courses require purchase.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ masterclasses.length }}</span>
              <span class="stat-label">Total Courses</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ publishedCount }}</span>
              <span class="stat-label">Published</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ premiumCount }}</span>
              <span class="stat-label">Premium</span>
            </div>
          </div>
          <button class="add-btn" @click="openMasterclassModal()">
            <i class="fas fa-plus"></i> New Course
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="masterclasses.length === 0" class="empty-state">
          <i class="fas fa-graduation-cap"></i>
          <h3>No masterclasses yet</h3>
          <p>Create your first training course or masterclass to share with your audience</p>
          <button class="add-btn" @click="openMasterclassModal()">
            <i class="fas fa-plus"></i> Create First Course
          </button>
        </div>
        
        <div v-else class="courses-grid">
          <article v-for="course in masterclasses" :key="course.id" class="course-card">
            <div class="course-image" :style="course.coverImage ? { backgroundImage: `url(${course.coverImage})` } : {}">
              <div v-if="!course.coverImage" class="course-image-placeholder">
                <i class="fas fa-image"></i>
              </div>
              <div class="course-badges">
                <span v-if="course.isPremium" class="badge premium">
                  <i class="fas fa-crown"></i> Premium
                </span>
                <span :class="['badge', course.isPublished ? 'published' : 'draft']">
                  {{ course.isPublished ? 'Published' : 'Draft' }}
                </span>
                <span class="badge type">{{ course.type }}</span>
              </div>
            </div>
            <div class="course-content">
              <h3>{{ course.title }}</h3>
              <p v-if="course.description" class="course-description">{{ course.description }}</p>
              <div class="course-meta">
                <span v-if="course.price" class="price">${{ course.price }}</span>
                <span v-if="course.publishedAt">{{ formatDate(course.publishedAt) }}</span>
                <span v-if="course.viewsCount"><i class="fas fa-eye"></i> {{ course.viewsCount }}</span>
                <span v-if="course.rating"><i class="fas fa-star"></i> {{ course.rating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="course-actions">
              <button class="action-btn" @click="openMasterclassModal(course)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="deleteMasterclass(course.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Masterclass Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Create' }} Masterclass</h3>
            <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveMasterclass">
            <div class="form-group">
              <label>Title *</label>
              <input v-model="modal.form.title" type="text" class="form-input" placeholder="Masterclass title" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="modal.form.description" class="form-input" rows="3" placeholder="Short description shown in listings" maxlength="2000"></textarea>
              <span class="char-count">{{ (modal.form.description || '').length }}/2000</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type</label>
                <select v-model="modal.form.type" class="form-input">
                  <option value="course">Course</option>
                  <option value="guide">Guide</option>
                  <option value="training">Training</option>
                  <option value="masterclass">Masterclass</option>
                </select>
              </div>
              <div class="form-group">
                <label>Price ($)</label>
                <input v-model.number="modal.form.price" type="number" class="form-input" placeholder="0.00" min="0" step="0.01" />
              </div>
            </div>
            <div class="form-group">
              <label>Content</label>
              <RichTextEditor v-model="modal.form.content" placeholder="Write your course content..." />
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
            <div v-if="modal.editId" class="form-group">
              <label>Cover Image</label>
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
              <i class="fas fa-info-circle"></i> Save the course first, then you can upload a cover image.
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
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import DisabledFeatureBanner from './DisabledFeatureBanner.vue'
import eventBus from '@/utils/eventBus'

export default {
  name: 'ProfileMasterclassSettings',
  components: {
    RichTextEditor,
    DisabledFeatureBanner
  },
  data() {
    return {
      masterclasses: [],
      loading: false,
      isEnabled: true,
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          title: '',
          description: '',
          content: '',
          type: 'course',
          price: 0,
          isPremium: false,
          isPublished: false,
          coverImage: null
        }
      }
    }
  },
  computed: {
    publishedCount() {
      return this.masterclasses.filter(m => m.isPublished).length
    },
    premiumCount() {
      return this.masterclasses.filter(m => m.isPremium).length
    }
  },
  mounted() {
    this.loadMasterclasses()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  methods: {
    async loadMasterclasses() {
      this.loading = true
      try {
        const result = await api.getMyMasterclasses()
        if (result.success) {
          this.masterclasses = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load masterclasses:', err)
        toast.error('Failed to load masterclasses')
      } finally {
        this.loading = false
      }
    },
    async loadVisibilityStatus() {
      try {
        const result = await api.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          this.isEnabled = settings.masterclass !== false // Default to true if not set
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'masterclass') {
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
    openMasterclassModal(course = null) {
      this.modal.editId = course?.id || null
      this.modal.form = course
        ? {
            title: course.title,
            description: course.description || '',
            content: course.content || '',
            type: course.type || 'course',
            price: course.price || 0,
            isPremium: course.isPremium || false,
            isPublished: course.isPublished || false,
            coverImage: course.coverImage || null
          }
        : { title: '', description: '', content: '', type: 'course', price: 0, isPremium: false, isPublished: false, coverImage: null }
      this.modal.visible = true
    },
    closeModal() {
      this.modal.visible = false
    },
    async saveMasterclass() {
      this.modal.saving = true
      try {
        const data = {
          title: this.modal.form.title,
          description: this.modal.form.description,
          content: this.modal.form.content,
          type: this.modal.form.type,
          price: parseFloat(this.modal.form.price) || 0,
          isPremium: this.modal.form.isPremium,
          isPublished: this.modal.form.isPublished
        }
        const result = this.modal.editId
          ? await api.updateMasterclass(this.modal.editId, data)
          : await api.createMasterclass(data)
        if (result.success) {
          toast.success(this.modal.editId ? 'Masterclass updated' : 'Masterclass created')
          this.closeModal()
          await this.loadMasterclasses()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modal.saving = false
      }
    },
    async deleteMasterclass(id) {
      if (!confirm('Delete this masterclass? This cannot be undone.')) return
      try {
        const result = await api.deleteMasterclass(id)
        if (result.success) {
          toast.success('Masterclass deleted')
          await this.loadMasterclasses()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },
    async handleCoverUpload(event) {
      const file = event.target.files?.[0]
      if (!file || !this.modal.editId) return
      try {
        toast.info('Uploading cover image...')
        const result = await api.uploadMasterclassCover(this.modal.editId, file)
        if (result.success) {
          this.modal.form.coverImage = result.data?.data?.coverImage || result.data?.coverImage
          toast.success('Cover image uploaded')
          await this.loadMasterclasses()
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
.masterclass-settings {
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

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.course-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.course-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.course-image {
  height: 140px;
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 2rem;
  opacity: 0.3;
}

.course-badges {
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

.badge.type {
  background: var(--secondary-color);
  color: white;
}

.course-content {
  padding: var(--spacing-md);
}

.course-content h3 {
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

.course-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  align-items: center;
  flex-wrap: wrap;
}

.course-meta .price {
  font-weight: 700;
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
}

.course-actions {
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
  opacity: 0.5;
}

.cover-preview {
  max-width: 100%;
  max-height: 200px;
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
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>

