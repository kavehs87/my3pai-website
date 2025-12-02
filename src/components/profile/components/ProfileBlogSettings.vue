<template>
  <div class="blog-settings">
    <div class="container">
      <div class="settings-intro">
        <h1><i class="fas fa-blog"></i> Blog Posts</h1>
        <p>Create and manage your blog posts. Premium posts are only visible to subscribers.</p>
      </div>

      <div class="settings-section">
        <div class="section-header">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ blogPosts.length }}</span>
              <span class="stat-label">Total Posts</span>
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
          <button class="add-btn" @click="openBlogModal()">
            <i class="fas fa-plus"></i> New Post
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="blogPosts.length === 0" class="empty-state">
          <i class="fas fa-newspaper"></i>
          <h3>No blog posts yet</h3>
          <p>Create your first blog post to share with your audience</p>
          <button class="add-btn" @click="openBlogModal()">
            <i class="fas fa-plus"></i> Create First Post
          </button>
        </div>
        
        <div v-else class="posts-grid">
          <article v-for="post in blogPosts" :key="post.id" class="post-card">
            <div class="post-image" :style="post.coverImage ? { backgroundImage: `url(${post.coverImage})` } : {}">
              <div v-if="!post.coverImage" class="post-image-placeholder">
                <i class="fas fa-image"></i>
              </div>
              <div class="post-badges">
                <span v-if="post.isPremium" class="badge premium">
                  <i class="fas fa-crown"></i> Premium
                </span>
                <span :class="['badge', post.isPublished ? 'published' : 'draft']">
                  {{ post.isPublished ? 'Published' : 'Draft' }}
                </span>
              </div>
            </div>
            <div class="post-content">
              <h3>{{ post.title }}</h3>
              <p v-if="post.preview" class="post-preview">{{ post.preview }}</p>
              <div class="post-meta">
                <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
                <span v-if="post.viewsCount"><i class="fas fa-eye"></i> {{ post.viewsCount }}</span>
                <span v-if="post.readTime">{{ post.readTime }}</span>
              </div>
            </div>
            <div class="post-actions">
              <button class="action-btn" @click="openBlogModal(post)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="deleteBlogPost(post.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Blog Post Modal -->
    <transition name="fade">
      <div v-if="modal.visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modal.editId ? 'Edit' : 'Create' }} Blog Post</h3>
            <button class="close-btn" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveBlogPost">
            <div class="form-group">
              <label>Title *</label>
              <input v-model="modal.form.title" type="text" class="form-input" placeholder="Blog post title" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Preview / Excerpt</label>
              <textarea v-model="modal.form.preview" class="form-input" rows="2" placeholder="Short preview text shown in listings" maxlength="500"></textarea>
              <span class="char-count">{{ (modal.form.preview || '').length }}/500</span>
            </div>
            <div class="form-group">
              <label>Content</label>
              <RichTextEditor v-model="modal.form.content" placeholder="Write your blog post content..." />
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
              <i class="fas fa-info-circle"></i> Save the post first, then you can upload a cover image.
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

export default {
  name: 'ProfileBlogSettings',
  components: {
    RichTextEditor
  },
  data() {
    return {
      blogPosts: [],
      loading: false,
      modal: {
        visible: false,
        editId: null,
        saving: false,
        form: {
          title: '',
          preview: '',
          content: '',
          isPremium: false,
          isPublished: false,
          coverImage: null
        }
      }
    }
  },
  computed: {
    publishedCount() {
      return this.blogPosts.filter(p => p.isPublished).length
    },
    premiumCount() {
      return this.blogPosts.filter(p => p.isPremium).length
    }
  },
  mounted() {
    this.loadBlogPosts()
  },
  methods: {
    async loadBlogPosts() {
      this.loading = true
      try {
        const result = await api.getMyBlogPosts()
        if (result.success) {
          this.blogPosts = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err)
        toast.error('Failed to load blog posts')
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
    openBlogModal(post = null) {
      this.modal.editId = post?.id || null
      this.modal.form = post
        ? {
            title: post.title,
            preview: post.preview || '',
            content: post.content || '',
            isPremium: post.isPremium || false,
            isPublished: post.isPublished || false,
            coverImage: post.coverImage || null
          }
        : { title: '', preview: '', content: '', isPremium: false, isPublished: false, coverImage: null }
      this.modal.visible = true
    },
    closeModal() {
      this.modal.visible = false
    },
    async saveBlogPost() {
      this.modal.saving = true
      try {
        const data = {
          title: this.modal.form.title,
          preview: this.modal.form.preview,
          content: this.modal.form.content,
          isPremium: this.modal.form.isPremium,
          isPublished: this.modal.form.isPublished
        }
        const result = this.modal.editId
          ? await api.updateBlogPost(this.modal.editId, data)
          : await api.createBlogPost(data)
        if (result.success) {
          toast.success(this.modal.editId ? 'Blog post updated' : 'Blog post created')
          this.closeModal()
          await this.loadBlogPosts()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modal.saving = false
      }
    },
    async deleteBlogPost(id) {
      if (!confirm('Delete this blog post? This cannot be undone.')) return
      try {
        const result = await api.deleteBlogPost(id)
        if (result.success) {
          toast.success('Blog post deleted')
          await this.loadBlogPosts()
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
        const result = await api.uploadBlogCover(this.modal.editId, file)
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
.blog-settings {
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

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.post-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-image {
  height: 140px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  background-size: cover;
  background-position: center;
  position: relative;
}

.post-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 2rem;
  opacity: 0.3;
}

.post-badges {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
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

.post-content {
  padding: var(--spacing-md);
}

.post-content h3 {
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

.post-preview {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.post-actions {
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
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>

