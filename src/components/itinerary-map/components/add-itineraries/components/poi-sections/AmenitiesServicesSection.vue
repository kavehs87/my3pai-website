<template>
  <div class="amenities-services">
    <div class="pill-group">
      <label>On-site amenities</label>
      <div class="pill-list">
        <button
          v-for="amenity in amenityOptions"
          :key="amenity.value"
          type="button"
          class="pill"
          :class="{ active: amenities.includes(amenity.value) }"
          @click="toggleAmenity(amenity.value)"
        >
          {{ amenity.label }}
        </button>
      </div>
    </div>

    <div class="field-group">
      <label>Nearby services</label>
      <textarea
        v-model="nearbyServices"
        placeholder="e.g. Supermarket 5 min drive"
      ></textarea>
    </div>

    <div class="pill-group">
      <label>Pet-friendly?</label>
      <div class="pill-list">
        <button
          v-for="option in petOptions"
          :key="option.value"
          type="button"
          class="pill"
          :class="{ active: petFriendly === option.value }"
          @click="petFriendly = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="pill-group">
      <label>Accessibility</label>
      <div class="pill-list">
        <button
          v-for="option in accessibilityOptions"
          :key="option.value"
          type="button"
          class="pill"
          :class="{ active: accessibility.includes(option.value) }"
          @click="toggleAccessibility(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  amenities: [],
  nearbyServices: '',
  petFriendly: '',
  accessibility: []
})

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export default {
  name: 'AmenitiesServicesSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      amenityOptions: [
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Café', value: 'cafe' },
        { label: 'Kiosk', value: 'kiosk' },
        { label: 'Shop', value: 'shop' },
        { label: 'WC', value: 'wc' },
        { label: 'Playground', value: 'playground' },
        { label: 'Picnic area', value: 'picnic' },
        { label: 'BBQ area', value: 'bbq' },
        { label: 'Rental (boats, SUP)', value: 'rental' },
        { label: 'Lifeguard', value: 'lifeguard' }
      ],
      petOptions: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
      ],
      accessibilityOptions: [
        { label: 'Wheelchair accessible', value: 'wheelchair' },
        { label: 'Stroller-friendly', value: 'stroller' },
        { label: 'Step-free path', value: 'step-free' },
        { label: 'Accessible toilet', value: 'accessible-toilet' }
      ]
    }
  },
  computed: {
    amenities: {
      get() {
        return ensureArray(this.modelValue?.amenities)
      },
      set(value) {
        this.updateField('amenities', ensureArray(value))
      }
    },
    nearbyServices: {
      get() {
        return this.modelValue?.nearbyServices || ''
      },
      set(value) {
        this.updateField('nearbyServices', value)
      }
    },
    petFriendly: {
      get() {
        return this.modelValue?.petFriendly || ''
      },
      set(value) {
        this.updateField('petFriendly', value)
      }
    },
    accessibility: {
      get() {
        return ensureArray(this.modelValue?.accessibility)
      },
      set(value) {
        this.updateField('accessibility', ensureArray(value))
      }
    }
  },
  methods: {
    toggleAmenity(value) {
      const list = ensureArray(this.amenities)
      const exists = list.includes(value)
      const next = exists ? list.filter((item) => item !== value) : [...list, value]
      this.amenities = next
    },
    toggleAccessibility(value) {
      const list = ensureArray(this.accessibility)
      const exists = list.includes(value)
      const next = exists ? list.filter((item) => item !== value) : [...list, value]
      this.accessibility = next
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
.amenities-services {
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

textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  min-height: 100px;
  resize: vertical;
}

.pill-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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

