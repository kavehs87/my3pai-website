<template>
  <span :class="className">{{ formattedPrice }}</span>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  amount: {
    type: [Number, String],
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
})

const currency = inject('currency', { code: 'USD', symbol: '$', rate: 1 })

const formattedPrice = computed(() => {
  // Convert amount to number (handles string prices from API)
  let numericAmount = props.amount
  if (typeof numericAmount === 'string') {
    numericAmount = parseFloat(numericAmount)
    if (isNaN(numericAmount)) numericAmount = 0
  }
  if (typeof numericAmount !== 'number') {
    numericAmount = 0
  }
  
  const value = numericAmount * currency.value.rate
  
  // Show "Free" if price is 0
  if (value === 0) {
    return 'Free'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value.code,
    minimumFractionDigits: currency.value.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency.value.code === 'JPY' ? 0 : 2,
  }).format(value)
})
</script>

