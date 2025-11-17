<template>
  <div class="category-type">
    <div class="field-group">
      <label>Place type (main category) <span>*</span></label>
      <select v-model="form.placeType">
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
          :class="{ active: form.activities.includes(activity.value) }"
          @click="toggleActivity(activity.value)"
        >
          {{ activity.label }}
        </button>
      </div>
    </div>

    <div class="pill-group">
      <div class="group-label">Audience type</div>
      <div class="pill-list">
        <button
          v-for="audience in audienceOptions"
          :key="audience.value"
          type="button"
          class="pill"
          :class="{ active: form.audience.includes(audience.value) }"
          @click="toggleAudience(audience.value)"
        >
          {{ audience.label }}
        </button>
      </div>
    </div>

    <div class="field-group">
      <label>Age requirement</label>
      <select v-model="form.ageRequirement">
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
      form: { ...defaultValue(), ...this.modelValue },
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
    toggleActivity(value) {
      if (this.form.activities.includes(value)) {
        this.form.activities = this.form.activities.filter((v) => v !== value)
      } else {
        this.form.activities = [...this.form.activities, value]
      }
    },
    toggleAudience(value) {
      if (this.form.audience.includes(value)) {
        this.form.audience = this.form.audience.filter((v) => v !== value)
      } else {
        this.form.audience = [...this.form.audience, value]
      }
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

.pill-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
</style>

