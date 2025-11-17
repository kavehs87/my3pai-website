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

    <div class="field-group">
      <label>Activity type</label>
      <select
        multiple
        size="6"
        v-model="activities"
        class="multi-select"
      >
        <option
          v-for="activity in activityOptions"
          :key="activity.value"
          :value="activity.value"
        >
          {{ activity.label }}
        </option>
      </select>
      <p class="helper-text">Hold Cmd/Ctrl (or drag) to select multiple activity types.</p>
    </div>

    <div class="field-group">
      <label>Audience type</label>
      <select
        multiple
        size="5"
        v-model="audience"
        class="multi-select"
      >
        <option
          v-for="audienceOption in audienceOptions"
          :key="audienceOption.value"
          :value="audienceOption.value"
        >
          {{ audienceOption.label }}
        </option>
      </select>
      <p class="helper-text">Select every audience this POI is ideal for.</p>
    </div>

    <div class="field-group">
      <label>Age requirement</label>
      <select v-model="ageRequirement">
        <option value="" disabled>Select age requirement</option>
        <option value="none">All ages</option>
        <option value="kids">Kids (0-12)</option>
        <option value="teens">Teens (13-17)</option>
        <option value="adults">Adults (18+)</option>
      </select>
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

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

label span {
  color: var(--error-color, #ef4444);
}

select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.multi-select {
  width: 100%;
  padding: var(--spacing-xs);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.multi-select option {
  padding: var(--spacing-2xs) var(--spacing-xs);
}

.multi-select option:checked {
  background: var(--primary-color);
  color: white;
}

.helper-text {
  margin: 0;
  font-size: var(--font-size-2xs);
  color: var(--text-secondary);
}
</style>

