<template>
  <div class="regions-tags">
    <div class="pill-group">
      <label>Primary region <span>*</span></label>
      <div class="pill-list">
        <button
          v-for="region in primaryRegions"
          :key="region.value"
          type="button"
          class="pill"
          :class="{ active: primaryRegion === region.value }"
          @click="primaryRegion = region.value"
        >
          {{ region.label }}
          <span class="count" v-if="region.count">({{ region.count }})</span>
        </button>
      </div>
    </div>

    <div class="pill-group">
      <label>Other regions</label>
      <div class="pill-list">
        <button
          v-for="region in otherRegionOptions"
          :key="region.value"
          type="button"
          class="pill"
          :class="{ active: otherRegions.includes(region.value) }"
          @click="toggleRegion(region.value)"
        >
          {{ region.label }}
          <span class="count" v-if="region.count">({{ region.count }})</span>
        </button>
      </div>
    </div>

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
  primaryRegion: '',
  otherRegions: [],
  tags: []
})

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export default {
  name: 'RegionsTagsSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      primaryRegions: [
        { label: 'Bern', value: 'bern', count: 53 },
        { label: 'Valais', value: 'valais', count: 38 },
        { label: 'Ticino', value: 'ticino', count: 27 },
        { label: 'Other', value: 'other' }
      ],
      otherRegionOptions: [
        { label: 'Graubünden', value: 'graubuenden', count: 27 },
        { label: 'Interlaken', value: 'interlaken', count: 26 },
        { label: 'Vaud', value: 'vaud', count: 19 }
      ],
      tagOptions: [
        { label: 'Local', value: 'local' },
        { label: 'Family friendly', value: 'family' },
        { label: 'Top pick', value: 'top-pick' },
        { label: 'Hidden gem', value: 'hidden-gem' },
        { label: 'Good for sunrise', value: 'sunrise' },
        { label: 'Good for sunset', value: 'sunset' },
        { label: 'Pet-friendly', value: 'pet-friendly' },
        { label: 'Accessible', value: 'accessible' },
        { label: 'Rainy-day friendly', value: 'rainy-day' },
        { label: 'Instagrammable', value: 'instagrammable' }
      ]
    }
  },
  computed: {
    primaryRegion: {
      get() {
        return this.modelValue?.primaryRegion || ''
      },
      set(value) {
        this.updateField('primaryRegion', value)
      }
    },
    otherRegions: {
      get() {
        return ensureArray(this.modelValue?.otherRegions)
      },
      set(value) {
        this.updateField('otherRegions', ensureArray(value))
      }
    },
    tags: {
      get() {
        return ensureArray(this.modelValue?.tags)
      },
      set(value) {
        this.updateField('tags', ensureArray(value))
      }
    }
  },
  methods: {
    toggleRegion(value) {
      const list = ensureArray(this.otherRegions)
      const exists = list.includes(value)
      const next = exists ? list.filter((v) => v !== value) : [...list, value]
      this.otherRegions = next
    },
    toggleTag(value) {
      const list = ensureArray(this.tags)
      const exists = list.includes(value)
      const next = exists ? list.filter((v) => v !== value) : [...list, value]
      this.tags = next
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
.regions-tags {
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

.pill .count {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 500;
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

