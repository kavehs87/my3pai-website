<template>
  <div class="media-credits">
    <div class="image-grid">
      <div class="upload-box" v-for="image in imageFields" :key="image.key">
        <label>{{ image.label }} <span v-if="image.required">*</span></label>
        <div class="upload-area" @click="triggerFileInput(image.key)">
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            :ref="image.key"
            style="display: none"
            @change="handleImageChange($event, image.key)"
          >
          <div class="upload-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click to upload or drag and drop</span>
            <small>{{ image.help }}</small>
          </div>
        </div>
      </div>
    </div>

    <div class="field-group">
      <label>Image Credit</label>
      <input type="text" v-model="form.imageCredit" placeholder="Name or handle to credit" />
    </div>

    <div class="field-group">
      <h4>Video &amp; Social</h4>
      <label>YouTube video URL</label>
      <input type="url" v-model="form.videoUrl" placeholder="Full link to video" />

      <div class="row">
        <div class="col">
          <label>Time in video (start)</label>
          <input type="text" v-model="form.videoStart" placeholder="e.g. 04:32" />
        </div>
        <div class="col">
          <label>Time in video (end, optional)</label>
          <input type="text" v-model="form.videoEnd" placeholder="e.g. 05:10" />
        </div>
      </div>

      <label>Caption for video box</label>
      <input type="text" v-model="form.videoCaption" placeholder="See this lake at 4:32 in our vlog" />

      <label>Instagram / TikTok handle</label>
      <input type="text" v-model="form.socialHandle" placeholder="@yourhandle" />
    </div>

    <div class="field-group">
      <h4>Creator Details</h4>
      <label>Creator name</label>
      <input type="text" v-model="form.creatorName" placeholder="Creator name" />

      <label>Creator role</label>
      <select v-model="form.creatorRole">
        <option value="" disabled>Select a role</option>
        <option value="guide">Guide</option>
        <option value="photographer">Photographer</option>
        <option value="videographer">Videographer</option>
        <option value="host">Host</option>
        <option value="influencer">Influencer</option>
      </select>

      <label>Creator notes</label>
      <input type="text" v-model="form.creatorNotes" placeholder="Contact via My3P for custom trip planning" />
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  images: {
    primary: null,
    access: null,
    map: null
  },
  imageCredit: '',
  videoUrl: '',
  videoStart: '',
  videoEnd: '',
  videoCaption: '',
  socialHandle: '',
  creatorName: '',
  creatorRole: '',
  creatorNotes: ''
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
      form: { ...defaultValue(), ...this.modelValue },
      imageFields: [
        { key: 'primary', label: 'Image 1 - Primary view', required: true, help: 'PNG, JPG, GIF up to 10MB' },
        { key: 'access', label: 'Image 2 - Access / route', required: false, help: 'Optional' },
        { key: 'map', label: 'Image 3 - Map / context / detail', required: false, help: 'Optional' }
      ]
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newVal) {
        this.form = { ...defaultValue(), ...newVal }
      }
    },
    form: {
      deep: true,
      handler(newVal) {
        this.$emit('update:modelValue', { ...newVal })
      }
    }
  },
  methods: {
    triggerFileInput(key) {
      this.$refs[key]?.click()
    },
    handleImageChange(event, key) {
      const file = event.target.files[0]
      if (file) {
        this.form.images[key] = file
      }
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

