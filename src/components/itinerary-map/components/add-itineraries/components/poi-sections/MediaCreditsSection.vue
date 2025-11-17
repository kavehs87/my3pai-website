<template>
  <div class="media-credits">
    <div class="image-grid">
      <div class="upload-box">
        <label>Media uploads</label>
        <div
          class="upload-area"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            ref="mediaInput"
            type="file"
            accept="image/png, image/jpeg, image/gif"
            multiple
            style="display: none"
            @change="handleImageChange"
          >
          <div class="upload-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Upload up to 10 images (PNG, JPG, GIF, 10MB max each)</span>
            <small>Click to upload or drag and drop files here</small>
          </div>
        </div>
        <ul v-if="images.length" class="media-list">
          <li v-for="(file, index) in images" :key="file.name + index">
            {{ file.name }}
            <button type="button" class="remove-media" @click="removeImage(index)">
              <i class="fas fa-times"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="field-group">
      <label>Copyright owner</label>
      <textarea
        v-model="imageCredit"
        placeholder="Name or handle to credit"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ imageCreditLength }} chars</div>
      </div>
    </div>

    <div class="field-group">
      <h4>Video &amp; Social</h4>
      <label>YouTube video URL</label>
      <input type="url" v-model="videoUrl" placeholder="Full link to video" />

      <div class="row">
        <div class="col">
          <label>Time in video (start)</label>
          <input type="text" v-model="videoStart" placeholder="e.g. 04:32" />
        </div>
        <div class="col">
          <label>Time in video (end, optional)</label>
          <input type="text" v-model="videoEnd" placeholder="e.g. 05:10" />
        </div>
      </div>

      <label>Caption for video box</label>
      <input type="text" v-model="videoCaption" placeholder="See this lake at 4:32 in our vlog" />

      <label>Social showcases</label>
      <div class="social-entry">
        <input
          type="url"
          v-model="socialLinkInput"
          :disabled="!canAddSocialLink"
          placeholder="Paste a TikTok / Instagram / Facebook post URL"
        />
        <button
          type="button"
          class="add-btn"
          :disabled="!canAddSocialLink || !socialLinkInput"
          @click="addSocialLink"
        >
          Add
        </button>
      </div>
      <p class="social-helper">
        {{ socialPosts.length }}/3 links added. Supported: TikTok, Instagram, Facebook posts or reels.
      </p>
      <p v-if="socialLinkError" class="social-error">{{ socialLinkError }}</p>
      <ul v-if="socialPosts.length" class="social-list">
        <li v-for="(link, index) in socialPosts" :key="link + index">
          <span>{{ link }}</span>
          <button type="button" class="remove-social" @click="removeSocialLink(index)">
            <i class="fas fa-times"></i>
          </button>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
const defaultValue = () => ({
  images: [],
  imageCredit: '',
  videoUrl: '',
  videoStart: '',
  videoEnd: '',
  videoCaption: '',
  socialPosts: []
})

export default {
  name: 'MediaCreditsSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      socialLinkInput: '',
      socialLinkError: ''
    }
  },
  computed: {
    imageCredit: {
      get() {
        return this.modelValue?.imageCredit || ''
      },
      set(value) {
        this.updateField('imageCredit', value)
      }
    },
    videoUrl: {
      get() {
        return this.modelValue?.videoUrl || ''
      },
      set(value) {
        this.updateField('videoUrl', value)
      }
    },
    videoStart: {
      get() {
        return this.modelValue?.videoStart || ''
      },
      set(value) {
        this.updateField('videoStart', value)
      }
    },
    videoEnd: {
      get() {
        return this.modelValue?.videoEnd || ''
      },
      set(value) {
        this.updateField('videoEnd', value)
      }
    },
    videoCaption: {
      get() {
        return this.modelValue?.videoCaption || ''
      },
      set(value) {
        this.updateField('videoCaption', value)
      }
    },
    socialPosts() {
      return Array.isArray(this.modelValue?.socialPosts) ? this.modelValue.socialPosts : []
    },
    images() {
      return Array.isArray(this.modelValue?.images) ? this.modelValue.images : []
    },
    imageCreditLength() {
      return this.imageCredit?.length || 0
    },
    canAddSocialLink() {
      return this.socialPosts.length < 3
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.mediaInput?.click()
    },
    handleImageChange(event) {
      const files = Array.from(event.target.files || [])
      this.addFiles(files)
    },
    handleDrop(event) {
      const files = Array.from(event.dataTransfer?.files || [])
      this.addFiles(files)
    },
    addFiles(files) {
      if (!files.length) return
      const filtered = files.filter((file) =>
        ['image/png', 'image/jpeg', 'image/gif'].includes(file.type)
      )
      const next = [...this.images, ...filtered].slice(0, 10)
      this.updateField('images', next)
    },
    removeImage(index) {
      const next = this.images.filter((_, idx) => idx !== index)
      this.updateField('images', next)
    },
    addSocialLink() {
      const value = (this.socialLinkInput || '').trim()
      if (!value || !this.canAddSocialLink) return
      if (!this.isSupportedSocialLink(value)) {
        this.socialLinkError = 'Only Instagram, TikTok, or Facebook post links are allowed.'
        return
      }
      if (this.socialPosts.includes(value)) {
        this.socialLinkError = 'This link is already added.'
        this.socialLinkInput = ''
        return
      }
      this.socialLinkError = ''
      this.updateField('socialPosts', [...this.socialPosts, value])
      this.socialLinkInput = ''
    },
    removeSocialLink(index) {
      const next = this.socialPosts.filter((_, idx) => idx !== index)
      this.updateField('socialPosts', next)
      if (next.length < 3) {
        this.socialLinkError = ''
      }
    },
    isSupportedSocialLink(link) {
      try {
        const url = new URL(link)
        const host = url.hostname.toLowerCase()
        return (
          host.includes('instagram.com') ||
          host.includes('tiktok.com') ||
          host.includes('facebook.com')
        )
      } catch (error) {
        void error
        return false
      }
    },
    updateField(key, value) {
      const base = {
        ...defaultValue(),
        ...(this.modelValue || {})
      }
      base[key] = value
      this.$emit('update:modelValue', base)
    }
  }
}
</script>

<style scoped>
.media-credits {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.image-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.upload-box {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: var(--bg-secondary);
}

.upload-content {
  text-align: center;
  color: var(--text-secondary);
}

.upload-content i {
  font-size: 28px;
  margin-bottom: var(--spacing-sm);
}

.upload-content span {
  display: block;
  font-weight: 600;
}

.upload-content small {
  display: block;
  color: var(--text-light);
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  gap: var(--spacing-sm);
}

.actions-row.space-between {
  justify-content: space-between;
}

.ghost-button {
  border: 1px dashed var(--border-medium);
  background: transparent;
  color: var(--text-secondary);
  padding: var(--spacing-2xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.ghost-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-left: auto;
}

.media-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-sm) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.media-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-2xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.remove-media {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.social-entry {
  margin-top: var(--spacing-xs);
  display: flex;
  gap: var(--spacing-sm);
}

.social-entry input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.social-entry input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.add-btn {
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-weight: 600;
  transition: filter var(--transition-normal);
}

.add-btn:hover:enabled {
  filter: brightness(0.95);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-helper {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0 0;
}

.social-error {
  color: var(--error-color, #ef4444);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2xs);
}

.social-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-sm) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.social-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-2xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  font-size: var(--font-size-sm);
}

.remove-social {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.col {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

input,
textarea,
select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.pill {
  border-radius: var(--radius-sm);
}
</style>

