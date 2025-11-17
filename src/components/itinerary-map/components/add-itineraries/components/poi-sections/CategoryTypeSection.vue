<template>
  <div class="category-type">
    <div class="field-group">
      <label>Place type (main category) <span>*</span></label>
      <select v-model="placeType">
        <option value="" disabled>Select a place type</option>
        <option value="nature">Nature</option>
        <option value="city">City</option>
        <option value="culture">Culture</option>
        <option value="food">Food &amp; Drinks</option>
        <option value="adventure">Adventure</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div class="pill-group">
      <div class="group-label">Activity type</div>
      <div class="pill-list">
        <button
          v-for="activity in activityOptions"
          :key="activity.value"
          type="button"
          class="pill"
          :class="{ active: activities.includes(activity.value) }"
          @click="toggleActivity(activity.value)"
        >
          {{ activity.label }}
        </button>
      </div>
      <p class="helper-text">Select all activities that apply.</p>
    </div>

    <div class="pill-group">
      <div class="group-label">Audience type</div>
      <div class="pill-list">
        <button
          v-for="audienceOption in audienceOptions"
          :key="audienceOption.value"
          type="button"
          class="pill"
          :class="{ active: audience.includes(audienceOption.value) }"
          @click="toggleAudience(audienceOption.value)"
        >
          {{ audienceOption.label }}
        </button>
      </div>
      <p class="helper-text">Choose the audiences that will love this POI.</p>
    </div>

    <div class="pill-group">
      <div class="group-label">Age limitation</div>
      <div class="pill-list">
        <button
          v-for="option in ageOptions"
          :key="option.value"
          type="button"
          class="pill"
          :class="{ active: ageRequirement === option.value }"
          @click="selectAge(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  placeType: '',
  activities: [],
  audience: [],
  ageRequirement: ''
})

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export default {
  name: 'CategoryTypeSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      activityOptions: [
        { label: 'Sightseeing', value: 'sightseeing' },
        { label: 'Hike / Walk', value: 'hike' },
        { label: 'Trail run', value: 'trail-run' },
        { label: 'Camping (tent, van, camper)', value: 'camping' },
        { label: 'Swimming / Water activities', value: 'swimming' },
        { label: 'Boat trip / Kayak / SUP', value: 'boat-trip' },
        { label: 'Rail experience / Scenic train', value: 'rail' },
        { label: 'Road trip stop / Car viewpoint', value: 'car-viewpoint' },
        { label: 'Photography', value: 'photography' },
        { label: 'Cultural visit (museum, castle, church, old town)', value: 'cultural' },
        { label: 'Family playground / Park', value: 'playground' },
        { label: 'Food & drinks (restaurant, café, winery, brewery)', value: 'food-drinks' },
        { label: 'Winter sports (ski, snowshoe, sledding)', value: 'winter-sports' },
        { label: 'Other', value: 'other' }
      ],
      audienceOptions: [
        { label: 'Families', value: 'families' },
        { label: 'Couples', value: 'couples' },
        { label: 'Solo travelers', value: 'solo' },
        { label: 'Groups', value: 'groups' },
        { label: 'Digital nomads', value: 'digital-nomads' },
        { label: 'Van-lifers', value: 'van-lifers' }
      ],
      ageOptions: [
        { label: 'Infants (0-3)', value: 'infant' },
        { label: 'Kids (4-12)', value: 'kids' },
        { label: 'Teens (13-17)', value: 'teens' },
        { label: 'Adults (18+)', value: 'adults' },
        { label: 'All ages welcome', value: 'none' }
      ]
    }
  },
  computed: {
    placeType: {
      get() {
        return this.modelValue?.placeType || ''
      },
      set(value) {
        this.updateField('placeType', value)
      }
    },
    activities: {
      get() {
        return ensureArray(this.modelValue?.activities)
      },
      set(value) {
        this.updateField('activities', ensureArray(value))
      }
    },
    audience: {
      get() {
        return ensureArray(this.modelValue?.audience)
      },
      set(value) {
        this.updateField('audience', ensureArray(value))
      }
    },
    ageRequirement: {
      get() {
        return this.modelValue?.ageRequirement || ''
      },
      set(value) {
        this.updateField('ageRequirement', value)
      }
    }
  },
    methods: {
    updateField(key, value) {
      const base = { ...defaultValue(), ...(this.modelValue || {}) }
      base[key] = value
      this.$emit('update:modelValue', base)
    },
    toggleActivity(value) {
      const list = ensureArray(this.activities)
      const exists = list.includes(value)
      const next = exists ? list.filter((item) => item !== value) : [...list, value]
      this.activities = next
    },
    toggleAudience(value) {
      const list = ensureArray(this.audience)
      const exists = list.includes(value)
      const next = exists ? list.filter((item) => item !== value) : [...list, value]
      this.audience = next
    },
    selectAge(value) {
      this.ageRequirement = value
    }
  }
}
</script>

<style scoped>
.category-type {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.field-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.field-group select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.pill-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.group-label {
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
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
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

.helper-text {
  margin: 0;
  font-size: var(--font-size-2xs);
  color: var(--text-secondary);
}
</style>

