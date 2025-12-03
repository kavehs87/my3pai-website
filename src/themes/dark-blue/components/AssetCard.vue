<template>
  <div
    :class="[
      'rounded-2xl p-1 shadow-lg group relative overflow-hidden transition-all hover:shadow-2xl',
      light ? 'bg-white' : 'bg-primary'
    ]"
  >
    <div class="relative aspect-square rounded-xl overflow-hidden mb-3">
      <img
        :src="asset.image || '/media-placeholder.jpg'"
        :alt="asset.title"
        class="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        @error="handleImageError"
      />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click="handleAddToCart"
          :class="[
            'px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1',
            light ? 'bg-primary text-white' : 'bg-white text-primary'
          ]"
        >
          Add <PriceDisplay :amount="asset.price" />
        </button>
      </div>
    </div>
    <div class="px-3 pb-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium text-secondary uppercase tracking-widest">{{ asset.type }}</span>
        <Download class="w-4 h-4 text-slate-400" />
      </div>
      <h4 :class="[light ? 'text-primary' : 'text-white', 'font-medium text-sm leading-snug']">
        {{ asset.title }}
      </h4>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'

const props = defineProps({
  asset: {
    type: Object,
    required: true,
  },
  light: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = () => {
  emit('add-to-cart', {
    id: props.asset.id,
    title: props.asset.title,
    price: props.asset.price,
    image: props.asset.image,
    type: 'asset',
  })
}

const handleImageError = (e) => {
  e.target.src = '/media-placeholder.jpg'
}
</script>

