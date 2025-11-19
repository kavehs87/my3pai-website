<template>
  <div v-if="visible" class="poi-accordion-overlay" @click.self="handleClose">
    <div class="poi-accordion-modal">
      <div class="modal-header">
        <div>
          <p class="modal-eyebrow">Point of interest</p>
          <h3>Create a point of interest</h3>
        </div>
        <button class="close-button" @click="handleClose" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="poi-accordion">
          <div 
            v-for="section in sectionsToRender" 
            :key="section.id" 
            class="accordion-section"
            :class="{
              open: openSection === section.id,
              'has-required-missing': sectionStatuses[section.id] === 'missing'
            }"
          >
            <button class="accordion-header" @click="toggleSection(section.id)">
              <div class="header-text">
                <h4>{{ section.title }}</h4>
                <p>{{ section.subtitle }}</p>
              </div>
              <div
                v-if="section.requiredFields?.length"
                class="header-status"
              >
                <span
                  class="status-pill"
                  :class="sectionStatuses[section.id]"
                >
                  {{ sectionStatuses[section.id] === 'complete' ? 'Complete' : 'Required' }}
                </span>
              </div>
              <i :class="['fas', openSection === section.id ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            </button>
            <div v-if="openSection === section.id" class="accordion-body">
              <component
                :is="section.component"
                v-model="localValue[section.modelKey]"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">Cancel</button>
        <button class="btn btn-outline" @click="handleSaveAndAddAnother">Save & Add Another</button>
        <button class="btn btn-primary" @click="handleSave">Save POI</button>
      </div>
    </div>
  </div>
</template>

<script>
import BasicIdentificationSection from './poi-sections/BasicIdentificationSection.vue'
import CategoryTypeSection from './poi-sections/CategoryTypeSection.vue'
import DifficultyEffortSection from './poi-sections/DifficultyEffortSection.vue'
import PricingVouchersSection from './poi-sections/PricingVouchersSection.vue'
import RegionsTagsSection from './poi-sections/RegionsTagsSection.vue'
import AmenitiesServicesSection from './poi-sections/AmenitiesServicesSection.vue'
import TravelTipsSection from './poi-sections/TravelTipsSection.vue'
import MediaCreditsSection from './poi-sections/MediaCreditsSection.vue'
import PersonalExperienceSection from './poi-sections/PersonalExperienceSection.vue'
import { toast } from '../../../../../utils/toast.js'

const defaultSections = [
  {
    id: 'basic',
    title: '1. Basic Information',
    subtitle: 'Core details about this point of interest.',
    component: BasicIdentificationSection,
    modelKey: 'basic',
    requiredFields: [
      'basic.name',
      'basic.tagline',
      'basic.summary',
      'basic.country',
      'basic.region',
      'basic.landmark',
      'basic.latitude',
      'basic.longitude'
    ]
  },
  {
    id: 'category',
    title: '2. Category & type',
    subtitle: 'Classify the type of place or activity.',
    component: CategoryTypeSection,
    modelKey: 'category',
    requiredFields: ['category.placeType']
  },
  {
    id: 'difficulty',
    title: '3. Difficulty & physical effort',
    subtitle: 'Set expectations around energy levels.',
    component: DifficultyEffortSection,
    modelKey: 'difficulty'
  },
  {
    id: 'pricing',
    title: '5. Pricing & Vouchers',
    subtitle: 'Explain costs, passes, or discounts.',
    component: PricingVouchersSection,
    modelKey: 'pricing',
    requiredFields: ['pricing.costType']
  },
  {
    id: 'regions',
    title: '6. Regions & tags',
    subtitle: 'Tag the region or theme it belongs to.',
    component: RegionsTagsSection,
    modelKey: 'regions',
    requiredFields: ['regions.primaryRegion']
  },
  {
    id: 'amenities',
    title: '7. Amenities & nearby services',
    subtitle: 'What’s available on-site or nearby?',
    component: AmenitiesServicesSection,
    modelKey: 'amenities'
  },
  {
    id: 'tips',
    title: '8. Travel Tips',
    subtitle: 'Share insider advice to enjoy the spot.',
    component: TravelTipsSection,
    modelKey: 'tips'
  },
  {
    id: 'media',
    title: '9. Media & Creator Credits',
    subtitle: 'Reference media assets or collaborators.',
    component: MediaCreditsSection,
    modelKey: 'media'
  },
  {
    id: 'experience',
    title: '10. Personal Experience',
    subtitle: 'Describe how the place made you feel.',
    component: PersonalExperienceSection,
    modelKey: 'experience',
    requiredFields: ['experience.experience']
  }
]

const FIELD_LABELS = {
  'basic.name': 'POI name',
  'basic.tagline': 'Tagline',
  'basic.summary': 'Summary',
  'basic.country': 'Country (ISO-2 code)',
  'basic.region': 'Region / state',
  'basic.landmark': 'Address',
  'basic.latitude': 'Latitude',
  'basic.longitude': 'Longitude',
  'category.placeType': 'Place type',
  'pricing.costType': 'Cost type',
  'regions.primaryRegion': 'Primary region',
  'experience.experience': 'Personal experience'
}

const CUSTOM_VALIDATORS = {
  'basic.country': (value) => /^[A-Za-z]{2}$/.test(String(value || '').trim()),
  'basic.latitude': (value) => isFinite(Number(value)),
  'basic.longitude': (value) => isFinite(Number(value))
}

const VALIDATION_MESSAGES = {
  'basic.country': 'Country must be a two-letter ISO code (e.g., CH).',
  'basic.latitude': 'Latitude must be a valid number.',
  'basic.longitude': 'Longitude must be a valid number.'
}

const defaultPOIValue = () => ({
  basic: {
    name: '',
    tagline: '',
    summary: '',
    country: '',
    region: '',
    landmark: '',
    pinAccuracy: '',
    latitude: '',
    longitude: ''
  },
  category: {},
  difficulty: {},
  pricing: {},
  regions: {},
  amenities: {},
  tips: {},
  media: {},
  experience: {}
})

export default {
  name: 'POIAccordion',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultPOIValue()
    },
    visible: {
      type: Boolean,
      default: false
    },
    sections: {
      type: Array,
      default: () => defaultSections
    }
  },
  emits: ['close', 'save', 'save-and-add', 'update:modelValue'],
  data() {
    return {
      openSection: null,
      localValue: { ...defaultPOIValue(), ...(this.modelValue || {}) }
    }
  },
  computed: {
    sectionsToRender() {
      return this.sections?.length ? this.sections : defaultSections
    },
    sectionStatuses() {
      const statuses = {}
      const sections = this.sectionsToRender || []
      sections.forEach((section) => {
        if (section.requiredFields?.length) {
          const missing = section.requiredFields.some((field) => {
            const value = this.getValueByPath(this.localValue, field)
            return !this.isFieldFilled(value, field)
          })
          statuses[section.id] = missing ? 'missing' : 'complete'
        } else {
          statuses[section.id] = 'optional'
        }
      })
      return statuses
    }
  },
  watch: {
    modelValue: {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.localValue = { ...defaultPOIValue(), ...(newVal || {}) }
      }
    },
    sectionsToRender: {
      immediate: true,
      handler(sections) {
        if (!this.openSection && sections?.length) {
          this.openSection = sections[0].id
        }
      }
    }
  },
  methods: {
    toggleSection(id) {
      this.openSection = this.openSection === id ? null : id
    },
    handleClose() {
      this.$emit('close')
    },
    getValueByPath(obj, path) {
      if (!obj || !path) return undefined
      return path.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
          return acc[key]
        }
        return undefined
      }, obj)
    },
    isFieldFilled(value, path) {
      if (CUSTOM_VALIDATORS[path]) {
        try {
          return CUSTOM_VALIDATORS[path](value)
        } catch (error) {
          void error
          return false
        }
      }
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'number') return true
      return value !== null && value !== undefined && String(value).trim() !== ''
    },
    buildPayload() {
      return { ...defaultPOIValue(), ...(this.localValue || {}) }
    },
    validatePayload(payload) {
      const missingPaths = this.collectMissingFieldPaths(payload)
      if (!missingPaths.length) {
        return true
      }
      const friendly = missingPaths.map((path) => VALIDATION_MESSAGES[path] || FIELD_LABELS[path] || path)
      const message =
        friendly.length > 3
          ? `${friendly.slice(0, 3).join(', ')} and ${friendly.length - 3} more.`
          : friendly.join(', ')
      toast.error(`Please complete the required fields: ${message}`)
      this.focusSectionForPath(missingPaths[0])
      return false
    },
    collectMissingFieldPaths(payload) {
      const sections = this.sectionsToRender || []
      const missing = []
      sections.forEach((section) => {
        section.requiredFields?.forEach((fieldPath) => {
          const value = this.getValueByPath(payload, fieldPath)
          if (!this.isFieldFilled(value, fieldPath)) {
            missing.push(fieldPath)
          }
        })
      })
      return missing
    },
    focusSectionForPath(path) {
      const sectionId = this.findSectionIdByPath(path)
      if (sectionId) {
        this.openSection = sectionId
      }
    },
    findSectionIdByPath(path) {
      const sections = this.sectionsToRender || []
      const match = sections.find((section) => section.requiredFields?.includes(path))
      return match?.id || null
    },
    handleSave() {
      const payload = this.buildPayload()
      if (!this.validatePayload(payload)) {
        return
      }
      this.$emit('update:modelValue', payload)
      this.$emit('save', payload)
    },
    handleSaveAndAddAnother() {
      const payload = this.buildPayload()
      if (!this.validatePayload(payload)) {
        return
      }
      this.$emit('update:modelValue', payload)
      this.$emit('save-and-add', payload)
      this.localValue = { ...defaultPOIValue() }
      if (this.sectionsToRender?.length) {
        this.openSection = this.sectionsToRender[0].id
      }
    }
  }
}
</script>

<style scoped>
.poi-accordion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  z-index: 10001;
}

.poi-accordion-modal {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
}

.modal-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
}

.close-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg) var(--spacing-xl);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-outline:hover {
  background: rgba(99, 102, 241, 0.1);
}

.poi-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.accordion-section {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  overflow: hidden;
  transition: border-color var(--transition-normal);
}

.accordion-section.open {
  border-color: var(--primary-color);
}

.accordion-section.has-required-missing {
  border-color: #f87171;
}

.accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: var(--spacing-md);
}

.header-text h4 {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.header-text p {
  margin: 4px 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-status {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.status-pill {
  font-size: var(--font-size-2xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.missing {
  background: rgba(248, 113, 113, 0.15);
  color: #dc2626;
}

.status-pill.complete {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.accordion-body {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  background: var(--bg-primary);
}

button:focus {
  outline: none;
}

@media (max-width: 768px) {
  .poi-accordion-overlay {
    padding: var(--spacing-md);
  }

  .poi-accordion-modal {
    max-height: 100vh;
    border-radius: var(--radius-lg);
  }

  .modal-body {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}
</style>