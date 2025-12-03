<template>
  <span :class="className">{{ formattedPrice }}</span>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
})

const currency = inject('currency', { code: 'USD', symbol: '$', rate: 1 })

const formattedPrice = computed(() => {
  const value = props.amount * currency.value.rate
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value.code,
    minimumFractionDigits: currency.value.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency.value.code === 'JPY' ? 0 : 2,
  }).format(value)
})
</script>

