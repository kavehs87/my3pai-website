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
        <button
          type="button"
          class="pill"
          :class="{ active: showCustomAmenityInput }"
          @click="toggleCustomAmenityInput"
        >
          Others
        </button>
      </div>
      <div v-if="showCustomAmenityInput" class="custom-entry">
        <input
          type="text"
          v-model="customAmenityValue"
          maxlength="10"
          placeholder="Enter custom amenity (max 10 chars)"
        />
        <button type="button" class="add-btn" @click="addCustomAmenity">Add</button>
      </div>
      <div v-if="customAmenities.length" class="custom-pill-list">
        <span
          v-for="customAmenity in customAmenities"
          :key="customAmenity"
          class="custom-pill"
        >
          {{ customAmenity }}
          <button
            type="button"
            class="remove-btn"
            @click="removeCustomAmenity(customAmenity)"
            aria-label="Remove amenity"
          >
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>

    <div class="field-group">
      <label>Nearby services</label>
      <textarea
        v-model="nearbyServices"
        placeholder="e.g. Supermarket 5 min drive"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ nearbyServicesLength }} chars</div>
      </div>
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

    <div v-if="petFriendly === 'yes'" class="field-group">
      <label>Pet-friendly notes</label>
      <textarea
        v-model="petNotes"
        placeholder="e.g. Dogs welcome on leash, water bowls available"
      ></textarea>
      <div class="actions-row space-between">
        <button type="button" class="ghost-button">
          <i class="fas fa-wand-magic-sparkles"></i>
          Polish my text
        </button>
        <div class="char-count">{{ petNotesLength }} chars</div>
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
  petNotes: '',
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
      ],
      showCustomAmenityInput: false,
      customAmenityValue: ''
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
    customAmenities() {
      const base = this.amenityOptions.map((option) => option.value)
      return ensureArray(this.amenities).filter((value) => !base.includes(value))
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
        const patch = { petFriendly: value }
        if (value !== 'yes') {
          patch.petNotes = ''
        }
        this.updateFields(patch)
      }
    },
    petNotes: {
      get() {
        return this.modelValue?.petNotes || ''
      },
      set(value) {
        this.updateField('petNotes', value)
      }
    },
    accessibility: {
      get() {
        return ensureArray(this.modelValue?.accessibility)
      },
      set(value) {
        this.updateField('accessibility', ensureArray(value))
      }
    },
    nearbyServicesLength() {
      return this.nearbyServices?.length || 0
    },
    petNotesLength() {
      return this.petNotes?.length || 0
    }
  },
  methods: {
    updateFields(patch) {
      this.$emit('update:modelValue', {
        ...defaultValue(),
        ...(this.modelValue || {}),
        ...patch
      })
    },
    updateField(key, value) {
      this.updateFields({ [key]: value })
    },
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
    toggleCustomAmenityInput() {
      this.showCustomAmenityInput = !this.showCustomAmenityInput
      if (!this.showCustomAmenityInput) {
        this.customAmenityValue = ''
      }
    },
    addCustomAmenity() {
      const value = (this.customAmenityValue || '').trim()
      if (!value || value.length > 10) return
      const list = ensureArray(this.amenities)
      if (list.includes(value)) {
        this.customAmenityValue = ''
        return
      }
      this.amenities = [...list, value]
      this.customAmenityValue = ''
    },
    removeCustomAmenity(value) {
      const list = ensureArray(this.amenities).filter((item) => item !== value)
      this.amenities = list
      if (!this.customAmenities.length) {
        this.showCustomAmenityInput = false
      }
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

.custom-entry {
  margin-top: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-sm);
}

.custom-entry input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.custom-entry input:focus {
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

.add-btn:hover {
  filter: brightness(0.95);
}

.custom-pill-list {
  margin-top: var(--spacing-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.custom-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-2xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm);
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  gap: var(--spacing-sm);
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
</style>

