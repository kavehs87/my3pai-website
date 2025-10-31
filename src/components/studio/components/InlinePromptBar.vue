<template>
  <div class="inline-prompt" :class="{ dense }">
    <div class="prompt-input-wrapper">
      <input
        v-model="query"
        class="prompt-input"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="emitSubmit"
      />
    </div>
    <div class="right-icons">
      <button class="icon-btn" type="button" @click="triggerImageUpload" title="Upload image">
        <i class="fas fa-image"></i>
        <span v-if="selectedImage" class="image-badge">1</span>
      </button>
      <input ref="imageInput" class="hidden-file" type="file" @change="onImageSelected" accept="image/*,.jpg,.jpeg,.png,.webp,.gif" />
      <button class="send-btn" type="button" @click="emitSubmit" title="Send">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InlinePromptBar',
  props: { placeholder: { type: String, default: "Share your dream trip. I'll map the way." }, dense: { type: Boolean, default: false } },
  data() { return { query: '', selectedImage: null } },
  methods: {
    emitSubmit() { 
      this.$emit('submit', { query: this.query.trim(), image: this.selectedImage })
      // Clear after submit
      this.selectedImage = null
      this.query = ''
    },
    emitImage() { this.$emit('pick-image') },
    emitMic() { this.$emit('mic') },
    triggerImageUpload() {
      const el = this.$refs.imageInput
      if (el) el.click()
    },
    onImageSelected(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        this.selectedImage = {
          file,
          previewUrl: reader.result,
          name: file.name,
          size: file.size,
          type: file.type
        }
      }
      reader.readAsDataURL(file)
      // Reset input to allow selecting the same file again
      e.target.value = ''
    }
  }
}
</script>

<style scoped>
.inline-prompt { 
  display: flex; 
  align-items: center; 
  gap: var(--spacing-md); 
  width: 100%; 
  background: var(--bg-primary); 
  border: 1px solid var(--border-light); 
  border-radius: var(--radius-lg); 
  padding: var(--spacing-md) var(--spacing-lg); 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
}

.inline-prompt.dense {
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.prompt-input-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.prompt-input { 
  width: 100%; 
  border: none; 
  outline: none; 
  background: transparent; 
  color: var(--text-primary); 
  font-size: var(--font-size-lg); 
  font-family: var(--font-family);
}

.prompt-input::placeholder { 
  color: var(--text-secondary); 
}

.left-icons,
.right-icons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon-btn { 
  background: transparent; 
  border: none; 
  color: #9ca3af; 
  cursor: pointer; 
  padding: var(--spacing-sm); 
  border-radius: var(--radius-sm); 
  transition: all var(--transition-normal); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 32px; 
  height: 32px; 
  position: relative;
}

.icon-btn:hover { 
  background: rgba(255, 255, 255, 0.1); 
  color: var(--text-primary); 
}
.image-badge { position: absolute; top: -4px; right: -4px; background: var(--secondary-color); color: #fff; border-radius: 8px; padding: 0 4px; font-size: 10px; line-height: 14px; min-width: 14px; text-align: center; }
.hidden-file { display: none; }

.send-btn { 
  background: var(--bg-primary); 
  border: none; 
  color: var(--text-primary); 
  cursor: pointer; 
  padding: var(--spacing-sm); 
  border-radius: var(--radius-full); 
  transition: all var(--transition-normal); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 40px; 
  height: 40px; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
}

.inline-prompt.dense .send-btn {
  width: 34px;
  height: 34px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.12);
}

.send-btn:hover:not(:disabled) { 
  background: var(--secondary-color); 
  color: var(--bg-primary); 
  transform: scale(1.05); 
}
</style>


