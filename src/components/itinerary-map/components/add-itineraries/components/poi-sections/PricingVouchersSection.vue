<template>
  <div class="pricing-vouchers">
    <div class="pill-group">
      <label>Cost type <span>*</span></label>
      <div class="pill-list">
        <button
          v-for="option in costOptions"
          :key="option.value"
          type="button"
          class="pill"
          :class="{ active: costType === option.value }"
          @click="costType = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="showPriceDetails" class="info-card price-card">
      <div class="field-row">
        <div class="field-group">
          <label>Price charged as</label>
          <select v-model="priceChargedAs">
            <option value="">Select one</option>
            <option
              v-for="option in priceChargeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="field-group">
          <label>Currency</label>
          <input
            type="text"
            v-model="currency"
            :list="currencyListId"
            placeholder="CHF"
            maxlength="3"
          />
          <datalist :id="currencyListId">
            <option
              v-for="option in currencyOptions"
              :key="option.code"
              :value="option.code"
            >
              {{ option.name }}
            </option>
          </datalist>
        </div>
      </div>

      <div class="field-row">
        <div class="field-group">
          <label>Estimated min price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            v-model="estimatedMinPrice"
            placeholder="0"
          />
        </div>
        <div class="field-group">
          <label>Estimated max price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            v-model="estimatedMaxPrice"
            placeholder="0"
          />
        </div>
      </div>

      <div class="field-group">
        <label>Price notes</label>
        <textarea
          v-model="priceNotes"
          placeholder="Share what the price includes, add-ons, or seasonal changes"
        ></textarea>
        <div class="actions-row space-between">
          <button type="button" class="ghost-button">
            <i class="fas fa-wand-magic-sparkles"></i>
            Polish my text
          </button>
          <div class="char-count">{{ priceNotesLength }} chars</div>
        </div>
      </div>
    </div>

    <div class="pill-group">
      <label>Voucher available?</label>
      <div class="pill-list">
        <button
          v-for="option in voucherOptions"
          :key="option.value"
          type="button"
          class="pill"
          :class="{ active: voucher === option.value }"
          @click="voucher = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="voucher === 'yes'" class="info-card voucher-card">
      <div class="field-group">
        <label>Voucher code</label>
        <input
          type="text"
          v-model="voucherCode"
          placeholder="e.g. ALI20"
        />
      </div>

      <div class="field-group">
        <label>Voucher partner</label>
        <input
          type="text"
          v-model="voucherPartner"
          placeholder="Partner or platform name"
        />
      </div>

      <div class="field-group">
        <label>Voucher conditions</label>
        <textarea
          v-model="voucherConditions"
          placeholder="Explain any rules or limitations"
        ></textarea>
        <div class="actions-row space-between">
          <button type="button" class="ghost-button">
            <i class="fas fa-wand-magic-sparkles"></i>
            Polish my text
          </button>
          <div class="char-count">{{ voucherConditionsLength }} chars</div>
        </div>
      </div>

      <div class="field-group">
        <label>Voucher link</label>
        <input
          type="url"
          v-model="voucherLink"
          placeholder="https://example.com/voucher"
        />
      </div>
    </div>
  </div>
</template>

<script>
const defaultValue = () => ({
  costType: '',
  priceChargedAs: '',
  currency: '',
  estimatedMinPrice: '',
  estimatedMaxPrice: '',
  priceNotes: '',
  voucher: '',
  voucherCode: '',
  voucherPartner: '',
  voucherConditions: '',
  voucherLink: ''
})

export default {
  name: 'PricingVouchersSection',
  props: {
    modelValue: {
      type: Object,
      default: () => defaultValue()
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      costOptions: [
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
        { label: 'Mixed', value: 'mixed' }
      ],
      voucherOptions: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
      ],
      priceChargeOptions: [
        { label: 'Per person', value: 'per_person' },
        { label: 'Per group', value: 'per_group' },
        { label: 'Per day', value: 'per_day' },
        { label: 'Per activity', value: 'per_activity' },
        { label: 'Other', value: 'other' }
      ],
      currencyOptions: [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'CHF', name: 'Swiss Franc' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'NZD', name: 'New Zealand Dollar' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'HKD', name: 'Hong Kong Dollar' },
        { code: 'SGD', name: 'Singapore Dollar' },
        { code: 'AED', name: 'UAE Dirham' }
      ],
      currencyListId: `currency-options-${Math.random().toString(36).slice(2)}`
    }
  },
  computed: {
    costType: {
      get() {
        return this.modelValue?.costType || ''
      },
      set(value) {
        this.updateField('costType', value)
      }
    },
    voucher: {
      get() {
        return this.modelValue?.voucher || ''
      },
      set(value) {
        this.updateField('voucher', value)
      }
    },
    voucherCode: {
      get() {
        return this.modelValue?.voucherCode || ''
      },
      set(value) {
        this.updateField('voucherCode', value)
      }
    },
    voucherPartner: {
      get() {
        return this.modelValue?.voucherPartner || ''
      },
      set(value) {
        this.updateField('voucherPartner', value)
      }
    },
    voucherConditions: {
      get() {
        return this.modelValue?.voucherConditions || ''
      },
      set(value) {
        this.updateField('voucherConditions', value)
      }
    },
    voucherLink: {
      get() {
        return this.modelValue?.voucherLink || ''
      },
      set(value) {
        this.updateField('voucherLink', value)
      }
    },
    priceChargedAs: {
      get() {
        return this.modelValue?.priceChargedAs || ''
      },
      set(value) {
        this.updateField('priceChargedAs', value)
      }
    },
    currency: {
      get() {
        return this.modelValue?.currency || ''
      },
      set(value) {
        this.updateField('currency', value?.toUpperCase().slice(0, 3) || '')
      }
    },
    estimatedMinPrice: {
      get() {
        return this.modelValue?.estimatedMinPrice || ''
      },
      set(value) {
        this.updateField('estimatedMinPrice', value)
      }
    },
    estimatedMaxPrice: {
      get() {
        return this.modelValue?.estimatedMaxPrice || ''
      },
      set(value) {
        this.updateField('estimatedMaxPrice', value)
      }
    },
    priceNotes: {
      get() {
        return this.modelValue?.priceNotes || ''
      },
      set(value) {
        this.updateField('priceNotes', value)
      }
    },
    priceNotesLength() {
      return this.priceNotes?.length || 0
    },
    voucherConditionsLength() {
      return this.voucherConditions?.length || 0
    },
    showPriceDetails() {
      return ['paid', 'mixed'].includes(this.costType)
    }
  },
  methods: {
    updateField(key, value) {
      this.$emit('update:modelValue', {
        ...defaultValue(),
        ...(this.modelValue || {}),
        [key]: value
      })
    }
  }
}
</script>

<style scoped>
.pricing-vouchers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
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

.info-card {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-tertiary, #f8f9fb);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-md);
}

.field-row .field-group {
  margin: 0;
}

.info-card .field-group input,
.info-card .field-group textarea,
.info-card .field-group select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.info-card .field-group textarea {
  min-height: 100px;
  resize: vertical;
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

@media (max-width: 640px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>

