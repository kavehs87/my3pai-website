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
          v-model="country"
          placeholder="Start typing a country name"
        />
        <datalist :id="countryListId">
          <option
            v-for="option in countryOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </datalist>
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
          <option value="">Exact</option>
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

  </div>

  <div v-if="activeReplacement" class="replacement-overlay">
    <div class="replacement-dialog">
      <h4>Update {{ activeReplacement.label }}</h4>
      <p>
        Replace the existing {{ activeReplacement.label }} value
        (<strong>{{ activeReplacement.currentValue }}</strong>) with
        <strong>{{ activeReplacement.newValue }}</strong>?
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
const defaultForm = () => ({
  name: '',
  tagline: '',
  summary: '',
  estimatedDuration: '',
  country: '',
  region: '',
  landmark: '',
  pinAccuracy: '',
  latitude: '',
  longitude: ''
})

const COUNTRY_LIST = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon',
  'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo (Congo-Brazzaville)', 'Costa Rica', 'Côte d’Ivoire', 'Croatia',
  'Cuba', 'Cyprus', 'Czechia (Czech Republic)', 'Democratic Republic of the Congo',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini (fmr. "Swaziland")',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany',
  'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Holy See', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (Burma)',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia',
  'Zimbabwe'
]

const REGION_DATA_URL = 'https://countriesnow.space/api/v0.1/countries/states'
let cachedRegionDataset = null
let cachedRegionPromise = null

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

export default {
  name: 'BasicIdentificationSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultForm()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      countryOptions: COUNTRY_LIST,
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
      activeReplacement: null
    }
  },
  created() {
    this.loadRegionDataset()
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
        this.updateField('country', value)
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
        return this.modelValue?.pinAccuracy || ''
      },
      set(value) {
        this.updateField('pinAccuracy', value)
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
    regionOptions() {
      const key = (this.country || '').trim()
      return this.regionDataset[key] || []
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
        if (!this.country) {
          patch.country = countryName
        } else if (this.country !== countryName) {
          this.enqueueReplacement({
            field: 'country',
            label: 'country',
            currentValue: this.country,
            newValue: countryName
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
      }
      this.activeReplacement = null
      if (this.replacementQueue.length) {
        this.processReplacementQueue()
      }
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

