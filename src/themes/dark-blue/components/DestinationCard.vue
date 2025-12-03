<template>
  <div class="relative group rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer">
    <img
      :src="dest.image"
      :alt="dest.country"
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

    <div class="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
      <span class="text-2xl mr-2">{{ dest.flag }}</span>
      <span class="text-white font-bold tracking-wide">{{ dest.country }}</span>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
      <PriceDisplay :amount="dest.price" class="text-secondary font-bold text-lg mb-1 block" />
      <p class="text-white/90 text-sm mb-4 line-clamp-2">{{ dest.description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-white/60 text-xs">{{ dest.poiCount }} Points of Interest</span>
        <button
          @click.stop="handleAddToCart"
          class="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"
          title="Add to Cart"
        >
          <ShoppingCart class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingCart } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'

const props = defineProps({
  dest: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = () => {
  emit('add-to-cart', {
    id: props.dest.id,
    title: `Travel Guide: ${props.dest.country}`,
    price: props.dest.price,
    image: props.dest.image,
    type: 'map',
  })
}
</script>

