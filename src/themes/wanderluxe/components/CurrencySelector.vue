<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      :class="[
        'flex items-center gap-1 text-sm font-medium transition-colors rounded-lg px-2 py-1',
        isFooter
          ? 'text-slate-400 hover:text-white bg-white/5 border border-white/10'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      ]"
    >
      <span>{{ currency.symbol }} {{ currency.code }}</span>
      <ChevronDown class="w-3 h-3" />
    </button>

    <template v-if="isOpen">
      <Teleport to="body">
        <div class="fixed inset-0 z-40" @click="isOpen = false" />
      </Teleport>
      <div
        :class="[
          'absolute z-50 w-24 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1',
          isFooter ? 'bottom-full mb-2' : 'top-full mt-2 right-0'
        ]"
      >
        <button
          v-for="c in currencies"
          :key="c.code"
          @click="selectCurrency(c)"
          :class="[
            'w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex justify-between',
            currency.code === c.code ? 'text-indigo-600 font-bold' : 'text-slate-900'
          ]"
        >
          <span>{{ c.code }}</span>
          <span>{{ c.symbol }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { Teleport } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  isFooter: {
    type: Boolean,
    default: false,
  },
})

const currencies = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JPY', symbol: '¥', rate: 150 },
]

const currency = inject('currency', ref({ code: 'USD', symbol: '$', rate: 1 }))
const setCurrency = inject('setCurrency', (c) => {
  currency.value = c
})

const isOpen = ref(false)

const selectCurrency = (c) => {
  setCurrency(c)
  isOpen.value = false
}
</script>

