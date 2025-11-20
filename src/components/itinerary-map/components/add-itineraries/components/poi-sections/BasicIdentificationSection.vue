<template>
  <div class="basic-identification">
    <div class="form-grid">
      <div class="form-fields">
        <div class="field-group">
          <label>POI Name <span>*</span></label>
          <input
            type="text"
            v-model="name"
            placeholder="Enter the main title"
          />
        </div>

        <div class="field-group">
          <label>Short Title / Tagline <span>*</span></label>
          <input
            type="text"
            v-model="tagline"
            placeholder="A catchy tagline appears here."
          />
        </div>

        <div class="field-group">
          <label>Brief Summary <span>*</span></label>
          <textarea
            v-model="summary"
            maxlength="400"
            placeholder="Describe the essence of this point of interest."
          ></textarea>
          <div class="actions-row space-between">
            <button type="button" class="ghost-button">
              <i class="fas fa-wand-magic-sparkles"></i>
              Polish my text
            </button>
            <div class="char-count">{{ summaryLength }}/400</div>
          </div>
        </div>

        <div class="field-group">
          <label>Estimated duration (e.g. 2-3h, 4-6h)</label>
          <input
            type="text"
            v-model="estimatedDuration"
            placeholder="e.g. 2-3h, 4-6h"
          />
        </div>
      </div>

      <div class="pdf-preview">
        <div class="preview-box">
          <span>PDF Preview</span>
        </div>
        <button class="btn ghost" type="button">
          <i class="fas fa-file-pdf"></i>
          Open PDF
        </button>
      </div>
    </div>


    <div class="location-grid">
      <div class="field-group">
        <label>Country <span>*</span></label>
        <input
          type="text"
          :list="countryListId"
          v-model="countryInputValue"
          placeholder="Start typing a country name"
          @input="handleCountryInput"
          @blur="handleCountryBlur"
        />
        <datalist :id="countryListId">
          <option
            v-for="option in countryOptions"
            :key="option.code"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </datalist>
        <p v-if="selectedCountryName" class="helper-text subtle">
          Saved as {{ selectedCountryName }} ({{ country || 'N/A' }})
        </p>
      </div>

      <div class="field-group">
        <label>Region / State / Canton <span>*</span></label>
        <input
          type="text"
          v-model="region"
          :list="regionOptions.length ? regionListId : null"
          :placeholder="regionOptions.length ? 'Select a region' : 'Enter the region'"
        />
        <datalist v-if="regionOptions.length" :id="regionListId">
          <option
            v-for="option in regionOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </datalist>
      </div>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Address <span>*</span></label>
        <input
          ref="addressInput"
          type="text"
          v-model="landmark"
          placeholder="Street name, number, or closest address"
        />
        <ul
          v-if="addressSuggestions.length"
          class="address-suggestions"
        >
          <li
            v-for="suggestion in addressSuggestions"
            :key="suggestion.place_id"
            @click="handlePredictionSelect(suggestion)"
          >
            {{ suggestion.description }}
          </li>
        </ul>
      </div>

      <div class="field-group">
        <label>Pin Accuracy</label>
        <select v-model="pinAccuracy">
          <option value="exact">Exact</option>
          <option value="approximate">Approximate</option>
          <option value="estimate">Estimated</option>
        </select>
      </div>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Latitude <span>*</span></label>
        <input
          type="text"
          v-model="latitude"
          placeholder="46.5197"
        />
      </div>

      <div class="field-group">
        <label>Longitude <span>*</span></label>
        <input
          type="text"
          v-model="longitude"
          placeholder="6.6323"
        />
      </div>
    </div>

    <div class="field-group">
      <label>Audio Recording</label>
      <AudioRecorder
        :modelValue="audioFile"
        @update:modelValue="handleAudioUpdate"
        @error="handleAudioError"
      />
    </div>

  </div>

  <div v-if="activeReplacement" class="replacement-overlay">
    <div class="replacement-dialog">
      <h4>Update {{ activeReplacement.label }}</h4>
      <p>
        Replace the existing {{ activeReplacement.label }} value
        (<strong>{{ getActiveReplacementCurrentLabel() }}</strong>) with
        <strong>{{ getActiveReplacementNewLabel() }}</strong>?
      </p>
      <div class="dialog-actions">
        <button type="button" class="dialog-btn outline" @click="handleReplacementDecision(false)">
          Keep current
        </button>
        <button type="button" class="dialog-btn primary" @click="handleReplacementDecision(true)">
          Replace
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AudioRecorder from './AudioRecorder.vue'

const defaultForm = () => ({
  name: '',
  tagline: '',
  summary: '',
  estimatedDuration: '',
  country: '',
  region: '',
  landmark: '',
  pinAccuracy: 'exact',
  latitude: '',
  longitude: '',
  audioFile: null
})

const COUNTRY_ISO_DATA_URL = 'https://countriesnow.space/api/v0.1/countries/iso'
const FALLBACK_COUNTRY_OPTIONS = [
  { code: 'CH', name: 'Switzerland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' }
]
const REGION_DATA_URL = 'https://countriesnow.space/api/v0.1/countries/states'
let cachedRegionDataset = null
let cachedRegionPromise = null
let cachedCountryIsoDataset = null
let cachedCountryIsoPromise = null

async function fetchRegionDataset() {
  if (cachedRegionDataset) return cachedRegionDataset
  if (cachedRegionPromise) return cachedRegionPromise

  cachedRegionPromise = fetch(REGION_DATA_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load regions (${response.status})`)
      }
      const payload = await response.json()
      const dataset = {}
      const entries = payload?.data || payload?.countries || []
      entries.forEach((entry) => {
        const countryName = entry?.name || entry?.country || entry?.country_name
        const states = (entry?.states || entry?.state || []).map((state) => state?.name).filter(Boolean)
        if (countryName) {
          dataset[countryName.trim()] = states
        }
      })
      cachedRegionDataset = dataset
      return dataset
    })
    .catch(() => {
      cachedRegionDataset = {}
      return cachedRegionDataset
    })
    .finally(() => {
      cachedRegionPromise = null
    })

  return cachedRegionPromise
}

async function fetchCountryIsoDataset() {
  if (cachedCountryIsoDataset) return cachedCountryIsoDataset
  if (cachedCountryIsoPromise) return cachedCountryIsoPromise

  cachedCountryIsoPromise = fetch(COUNTRY_ISO_DATA_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load country codes (${response.status})`)
      }
      const payload = await response.json()
      const entries = payload?.data || []
      cachedCountryIsoDataset = entries
        .map((entry) => ({
          name: entry?.name || '',
          code: (entry?.Iso2 || entry?.iso2 || '').toUpperCase()
        }))
        .filter((entry) => entry.name && /^[A-Z]{2}$/.test(entry.code))
        .sort((a, b) => a.name.localeCompare(b.name))
      return cachedCountryIsoDataset
    })
    .catch(() => {
      cachedCountryIsoDataset = []
      return cachedCountryIsoDataset
    })
    .finally(() => {
      cachedCountryIsoPromise = null
    })

  return cachedCountryIsoPromise
}

export default {
  name: 'BasicIdentificationSection',
  components: {
    AudioRecorder
  },
  props: {
    modelValue: {
      type: Object,
      default: () => defaultForm()
    }
  },
  watch: {
    'modelValue.country': {
      immediate: true,
      handler(newVal) {
        this.syncCountryInputWithIso(newVal)
      }
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      countryOptions: [],
      countryLabelCache: {},
      countryListId: `country-options-${Math.random().toString(36).slice(2)}`,
      regionListId: `region-options-${Math.random().toString(36).slice(2)}`,
      regionDataset: {},
      regionLoading: false,
      autocompleteRetryTimer: null,
      autocompleteService: null,
      placesService: null,
      addressInputListener: null,
      addressSuggestions: [],
      addressDetailsLoading: false,
      replacementQueue: [],
      activeReplacement: null,
      countryInputValue: ''
    }
  },
  created() {
    this.loadRegionDataset()
    this.loadCountryIsoDataset()
  },
  mounted() {
    this.$nextTick(() => {
      this.initializePlaceHelpers()
    })
  },
  beforeUnmount() {
    if (this.autocompleteRetryTimer) {
      clearTimeout(this.autocompleteRetryTimer)
      this.autocompleteRetryTimer = null
    }
    const input = this.$refs.addressInput
    if (input && this.addressInputListener) {
      input.removeEventListener('input', this.addressInputListener)
    }
    this.addressInputListener = null
  },
  computed: {
    name: {
      get() {
        return this.modelValue?.name || ''
      },
      set(value) {
        this.updateField('name', value)
      }
    },
    tagline: {
      get() {
        return this.modelValue?.tagline || ''
      },
      set(value) {
        this.updateField('tagline', value)
      }
    },
    summary: {
      get() {
        return this.modelValue?.summary || ''
      },
      set(value) {
        this.updateField('summary', value)
      }
    },
    estimatedDuration: {
      get() {
        return this.modelValue?.estimatedDuration || ''
      },
      set(value) {
        this.updateField('estimatedDuration', value)
      }
    },
    country: {
      get() {
        return this.modelValue?.country || ''
      },
      set(value) {
        const next = typeof value === 'string' ? value.toUpperCase() : value
        this.updateField('country', next)
      }
    },
    region: {
      get() {
        return this.modelValue?.region || ''
      },
      set(value) {
        this.updateField('region', value)
      }
    },
    landmark: {
      get() {
        return this.modelValue?.landmark || ''
      },
      set(value) {
        this.updateField('landmark', value)
      }
    },
    pinAccuracy: {
      get() {
        return this.modelValue?.pinAccuracy || 'exact'
      },
      set(value) {
        this.updateField('pinAccuracy', value || 'exact')
      }
    },
    latitude: {
      get() {
        return this.modelValue?.latitude || ''
      },
      set(value) {
        this.updateField('latitude', value)
      }
    },
    longitude: {
      get() {
        return this.modelValue?.longitude || ''
      },
      set(value) {
        this.updateField('longitude', value)
      }
    },
    summaryLength() {
      return this.summary?.length || 0
    },
    audioFile() {
      return this.modelValue?.audioFile || null
    },
    regionOptions() {
      const isoCode = (this.country || '').trim().toUpperCase()
      const key = this.getCountryNameFromCode(isoCode)
      if (!key) return []
      return this.regionDataset[key] || []
    },
    selectedCountryName() {
      const isoCode = (this.country || '').trim().toUpperCase()
      return this.getCountryNameFromCode(isoCode)
    }
  },
  methods: {
    updateField(key, value) {
      this.updateFields({ [key]: value })
    },
    updateFields(patch) {
      this.$emit('update:modelValue', {
        ...defaultForm(),
        ...(this.modelValue || {}),
        ...patch
      })
    },
    async loadCountryIsoDataset() {
      try {
        const dataset = await fetchCountryIsoDataset()
        if (Array.isArray(dataset) && dataset.length) {
          this.countryOptions = dataset
          dataset.forEach((entry) => this.cacheCountryLabel(entry.code, entry.name))
          this.syncCountryInputWithIso()
          return
        }
      } catch (error) {
        void error
      }
      this.countryOptions = FALLBACK_COUNTRY_OPTIONS
      FALLBACK_COUNTRY_OPTIONS.forEach((entry) => this.cacheCountryLabel(entry.code, entry.name))
      this.syncCountryInputWithIso()
    },
    cacheCountryLabel(code, name) {
      if (!code || !name) return
      this.countryLabelCache = {
        ...this.countryLabelCache,
        [code.toUpperCase()]: name
      }
    },
    getCountryNameFromCode(code) {
      if (!code) return ''
      return this.countryLabelCache[code.toUpperCase()] || ''
    },
    findIsoCodeForCountryName(name) {
      if (!name) return ''
      const value = name.trim().toLowerCase()
      const directMatch =
        this.countryOptions.find((option) => option.name.toLowerCase() === value)?.code || ''
      if (directMatch) {
        this.cacheCountryLabel(directMatch, name.trim())
        return directMatch
      }
      return ''
    },
    async loadRegionDataset() {
      if (Object.keys(this.regionDataset || {}).length) return
      this.regionLoading = true
      try {
        const dataset = await fetchRegionDataset()
        this.regionDataset = dataset || {}
      } catch (error) {
        void error
      } finally {
        this.regionLoading = false
      }
    },
    handleCountryInput(event) {
      this.countryInputValue = event?.target?.value ?? ''
    },
    handleCountryBlur(event) {
      const value = (event?.target?.value || '').trim()
      if (!value) {
        this.countryInputValue = ''
        this.updateField('country', '')
        return
      }
      let isoCode = ''
      if (/^[A-Za-z]{2}$/.test(value)) {
        isoCode = value.toUpperCase()
      } else {
        isoCode = this.findIsoCodeForCountryName(value)
      }
      if (isoCode) {
        this.updateField('country', isoCode)
        this.syncCountryInputWithIso(isoCode)
      } else {
        this.countryInputValue = value
      }
    },
    initializePlaceHelpers() {
      const input = this.$refs.addressInput
      if (!input) {
        return
      }

      const google = window.google
      if (!google?.maps?.places) {
        if (this.autocompleteRetryTimer) clearTimeout(this.autocompleteRetryTimer)
        this.autocompleteRetryTimer = setTimeout(() => {
          this.autocompleteRetryTimer = null
          this.initializePlaceHelpers()
        }, 500)
        return
      }

      if (!this.autocompleteService) {
        this.autocompleteService = new google.maps.places.AutocompleteService()
      }
      if (!this.placesService) {
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'))
      }
      if (!this.addressInputListener) {
        this.addressInputListener = this.handleAddressInput.bind(this)
        input.addEventListener('input', this.addressInputListener)
      }
    },
    handleAddressInput(event) {
      const value = event.target.value
      if (!this.autocompleteService || value.length < 3) {
        this.addressSuggestions = []
        return
      }
      this.autocompleteService.getPlacePredictions(
        { input: value, types: ['geocode'] },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && Array.isArray(predictions)) {
            this.addressSuggestions = predictions
          } else {
            this.addressSuggestions = []
          }
        }
      )
    },
    handlePredictionSelect(prediction) {
      if (!prediction) return
      this.addressSuggestions = []
      this.updateField('landmark', prediction.description || '')
      if (!this.placesService || !prediction.place_id) return
      this.addressDetailsLoading = true
      this.placesService.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['formatted_address', 'geometry', 'address_components']
        },
        (place, status) => {
          this.addressDetailsLoading = false
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return
          if (place.formatted_address) {
            this.updateField('landmark', place.formatted_address)
          }
          const loc = place.geometry?.location
          if (loc) {
            this.updateFields({
              latitude: Number(typeof loc.lat === 'function' ? loc.lat() : loc.lat).toFixed(6),
              longitude: Number(typeof loc.lng === 'function' ? loc.lng() : loc.lng).toFixed(6)
            })
          }
          const components = place.address_components || []
          this.applyAddressComponents(components)
        }
      )
    },
    getAddressComponent(components, preferredTypes = []) {
      if (!components?.length) return null
      for (const type of preferredTypes) {
        const match = components.find((component) => component.types?.includes(type))
        if (match) return match
      }
      return null
    },
    applyAddressComponents(components) {
      const patch = {}
      const countryComponent = this.getAddressComponent(components, ['country'])
      if (countryComponent) {
        const countryName = countryComponent.long_name || countryComponent.short_name
        const isoCode = this.findIsoCodeForCountryName(countryName)
        if (isoCode) {
          this.cacheCountryLabel(isoCode, countryName)
        }
        const sanitizedCode = isoCode || (countryName || '').slice(0, 2).toUpperCase()
        if (!this.country) {
          patch.country = sanitizedCode
        } else if (this.country !== sanitizedCode) {
          this.enqueueReplacement({
            field: 'country',
            label: 'country',
            currentValue: this.countryInputValue || this.getCountryNameFromCode(this.country) || this.country,
            newValue: sanitizedCode,
            displayNewValue: this.getCountryNameFromCode(sanitizedCode) || countryName || sanitizedCode
          })
        }
      }

      const regionComponent = this.getAddressComponent(components, [
        'administrative_area_level_1',
        'administrative_area_level_2',
        'administrative_area_level_3'
      ])
      if (regionComponent) {
        const regionName = regionComponent.long_name || regionComponent.short_name
        if (!this.region) {
          patch.region = regionName
        } else if (this.region !== regionName) {
          this.enqueueReplacement({
            field: 'region',
            label: 'region',
            currentValue: this.region,
            newValue: regionName
          })
        }
      }

      if (Object.keys(patch).length) {
        this.updateFields(patch)
      }
    },
    enqueueReplacement(replacement) {
      this.replacementQueue.push(replacement)
      if (!this.activeReplacement) {
        this.processReplacementQueue()
      }
    },
    processReplacementQueue() {
      this.activeReplacement = this.replacementQueue.shift() || null
    },
    handleReplacementDecision(shouldReplace) {
      if (shouldReplace && this.activeReplacement) {
        this.updateFields({
          [this.activeReplacement.field]: this.activeReplacement.newValue
        })
        if (this.activeReplacement.field === 'country') {
          this.syncCountryInputWithIso(this.activeReplacement.newValue)
        }
      }
      this.activeReplacement = null
      if (this.replacementQueue.length) {
        this.processReplacementQueue()
      }
    },
    syncCountryInputWithIso(overrideIso) {
      const iso = (overrideIso || this.country || '').trim().toUpperCase()
      if (!iso) {
        this.countryInputValue = ''
        return
      }
      this.countryInputValue = this.getCountryNameFromCode(iso) || iso
    },
    getActiveReplacementCurrentLabel() {
      if (!this.activeReplacement) return ''
      if (this.activeReplacement.field === 'country') {
        const iso = (this.activeReplacement.currentValue || '').trim().toUpperCase()
        return this.getCountryNameFromCode(iso) || this.activeReplacement.currentValue
      }
      return this.activeReplacement.currentValue
    },
    getActiveReplacementNewLabel() {
      if (!this.activeReplacement) return ''
      if (this.activeReplacement.field === 'country') {
        return (
          this.activeReplacement.displayNewValue ||
          this.getCountryNameFromCode(this.activeReplacement.newValue) ||
          this.activeReplacement.newValue
        )
      }
      return this.activeReplacement.newValue
    },
    handleAudioUpdate(file) {
      // When deleting (file is null), preserve audioId so we can delete it on the server
      // When uploading new file, audioId will be updated after upload
      const currentAudioId = this.modelValue?.audioId
      if (file === null && currentAudioId) {
        // Preserve audioId when deleting so we know which audio to delete
        this.updateFields({ audioFile: null, audioId: currentAudioId })
      } else {
        this.updateField('audioFile', file)
      }
    },
    handleAudioError(message) {
      // You can add toast notification here if needed
      console.error('Audio error:', message)
    }
  }
}
</script>

<style scoped>
.basic-identification {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: var(--spacing-lg);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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

input,
select,
textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.char-count {
  text-align: right;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.helper-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.helper-text.subtle {
  color: var(--text-light);
}

.actions-row {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-xs);
}

.actions-row.align-end {
  justify-content: flex-end;
}

.actions-row.space-between {
  justify-content: space-between;
}

.ghost-button {
  border: 1px dashed var(--border-medium);
  background: transparent;
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-md);
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

.pdf-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: stretch;
}

.preview-box {
  flex: 1;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  background: var(--bg-secondary);
}

.btn.ghost {
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.btn.ghost:hover {
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

.location-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-md);
}

:deep(.pac-container) {
  z-index: 20000 !important;
}

.address-suggestions {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--border-light);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background: var(--bg-primary);
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 5;
}

.address-suggestions li {
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.address-suggestions li:hover {
  background: var(--bg-tertiary);
}

.replacement-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30000;
  padding: var(--spacing-md);
}

.replacement-dialog {
  width: min(420px, 100%);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.replacement-dialog h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.replacement-dialog p {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.replacement-dialog strong {
  color: var(--text-primary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.dialog-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.dialog-btn.outline {
  border: 1px solid var(--border-medium);
  background: transparent;
  color: var(--text-primary);
}

.dialog-btn.outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.dialog-btn.primary {
  background: var(--primary-color);
  color: white;
}

.dialog-btn.primary:hover {
  filter: brightness(0.95);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

