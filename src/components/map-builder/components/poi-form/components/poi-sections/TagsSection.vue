<template>
  <div class="tags-section">
    <div class="pill-group">
      <label>Tags</label>
      <div class="pill-list">
        <button
          v-for="tag in tagOptions"
          :key="tag.value"
          type="button"
          class="pill"
          :class="{ active: tags.includes(tag.value) }"
          @click="toggleTag(tag.value)"
        >
          {{ tag.label }}
        </button>
        <button
          type="button"
          class="pill"
          :class="{ active: showCustomTagInput }"
          @click="toggleCustomTagInput"
        >
          Others
        </button>
      </div>
      <div v-if="showCustomTagInput" class="custom-tag-entry">
        <input
          type="text"
          v-model="customTagValue"
          maxlength="10"
          placeholder="Enter custom tag (max 10 chars)"
        />
        <button type="button" class="add-btn" @click="addCustomTag">Add</button>
      </div>
      <div v-if="customTags.length" class="custom-tags">
        <span
          v-for="customTag in customTags"
          :key="customTag"
          class="custom-tag-pill"
        >
          {{ customTag }}
          <button
            type="button"
            class="remove-btn"
            @click="removeCustomTag(customTag)"
            aria-label="Remove tag"
          >
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>

    <div class="ai-suggestion">
      <i class="fas fa-wand-magic-sparkles"></i>
      <button type="button" class="link-button">Generate tags from description</button>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  tags: []
})

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export default {
  name: 'TagsSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      tagOptions: [
        { label: 'Instagrammable', value: 'instagrammable' },
        { label: 'Hidden gem', value: 'hidden-gem' },
        { label: 'Pet friendly', value: 'pet-friendly' }
      ],
      showCustomTagInput: false,
      customTagValue: ''
    }
  },
  computed: {
    tags: {
      get() {
        return ensureArray(this.modelValue?.tags)
      },
      set(value) {
        this.updateField('tags', ensureArray(value))
      }
    },
    customTags() {
      const baseValues = this.tagOptions.map((tag) => tag.value)
      return ensureArray(this.tags).filter((tag) => !baseValues.includes(tag))
    }
  },
  methods: {
    toggleTag(value) {
      const list = ensureArray(this.tags)
      const exists = list.includes(value)
      const next = exists ? list.filter((v) => v !== value) : [...list, value]
      this.tags = next
    },
    toggleCustomTagInput() {
      this.showCustomTagInput = !this.showCustomTagInput
      if (!this.showCustomTagInput) {
        this.customTagValue = ''
      }
    },
    addCustomTag() {
      const value = (this.customTagValue || '').trim()
      if (!value || value.length > 10) return
      const list = ensureArray(this.tags)
      if (list.includes(value)) {
        this.customTagValue = ''
        return
      }
      this.tags = [...list, value]
      this.customTagValue = ''
    },
    removeCustomTag(tag) {
      const list = ensureArray(this.tags).filter((value) => value !== tag)
      this.tags = list
    },
    updateField(key, value) {
      const base = { ...defaultValue(), ...(this.modelValue || {}) }
      base[key] = value
      this.$emit('update:modelValue', base)
    }
  }
}
</script>

<style scoped>
.tags-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pill-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.pill {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-lg);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pill:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.custom-tag-entry {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
}

.custom-tag-entry input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}

.add-btn {
  border: 1px solid var(--primary-color);
  background: var(--primary-color);
  color: #fff;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.custom-tags {
  margin-top: var(--spacing-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.custom-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  font-size: var(--font-size-sm);
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
}

.ai-suggestion {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.link-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
</style>

