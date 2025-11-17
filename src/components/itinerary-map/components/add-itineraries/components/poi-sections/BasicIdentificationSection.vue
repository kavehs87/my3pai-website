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
          placeholder="Enter the region"
        />
      </div>
    </div>

    <div class="location-grid">
      <div class="field-group">
        <label>Nearest Town / Landmark <span>*</span></label>
        <input
          type="text"
          v-model="landmark"
          placeholder="e.g. Zermatt"
        />
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

    <div class="ai-suggestion">
      <i class="fas fa-wand-magic-sparkles"></i>
      <button type="button" class="link-button">Ask AI to find coordinates</button>
    </div>
  </div>
</template>

<script>
const defaultForm = () => ({
  name: '',
  tagline: '',
  summary: '',
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
      countryListId: `country-options-${Math.random().toString(36).slice(2)}`
    }
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
    }
  },
  methods: {
    updateField(key, value) {
      this.$emit('update:modelValue', {
        ...defaultForm(),
        ...(this.modelValue || {}),
        [key]: value
      })
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

