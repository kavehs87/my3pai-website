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
  </div>
</template>

<script>
const defaultValue = () => ({
  costType: '',
  voucher: ''
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
      ]
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
</style>

