<template>
  <div 
    class="relative group rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer"
    @click="handleCardClick"
  >
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
      <PriceDisplay :amount="priceAsNumber" class="text-secondary font-bold text-lg mb-1 block" />
      <p class="text-white/90 text-sm mb-4 line-clamp-2">{{ dest.description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-white/60 text-xs">{{ dest.poiCount }} Points of Interest</span>
        <button
          @click.stop="handleAddToCart"
          :disabled="!isAvailableForPurchase"
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            isAvailableForPurchase
              ? 'bg-white text-primary hover:bg-secondary hover:text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          ]"
          :title="isAvailableForPurchase ? (priceAsNumber > 0 ? 'Add to Cart' : 'Add Free Map to Cart') : 'Not available for purchase'"
        >
          <ShoppingCart class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'

const props = defineProps({
  dest: {
    type: Object,
    required: true,
  },
  username: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['add-to-cart'])
const router = useRouter()

// Convert price to number (handles string prices from API)
const priceAsNumber = computed(() => {
  const price = props.dest.price
  if (price === null || price === undefined) return 0
  if (typeof price === 'number') return price
  if (typeof price === 'string') {
    const parsed = parseFloat(price)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
})

// Check if map is available for purchase
// Allow if explicitly marked as for sale, OR if price is 0 (free maps should be addable)
const isAvailableForPurchase = computed(() => {
  const isForSale = props.dest.isForSale ?? props.dest.is_for_sale ?? false
  const isFree = priceAsNumber.value === 0
  
  // If explicitly marked as for sale, allow it (even if free)
  if (isForSale) return true
  
  // If free and not explicitly marked as NOT for sale, allow it
  // (This handles cases where isForSale might not be set but price is 0)
  if (isFree) return true
  
  // Otherwise, require explicit isForSale flag
  return false
})

const handleCardClick = () => {
  // Navigate to published map if username and slug are available
  if (props.username && props.dest.slug) {
    router.push(`/u/${props.username}/${props.dest.slug}`)
  }
}

const handleAddToCart = () => {
  if (!isAvailableForPurchase.value) {
    return // Don't emit if not available for purchase
  }
  emit('add-to-cart', {
    id: props.dest.id,
    title: `Travel Guide: ${props.dest.country}`,
    price: priceAsNumber.value,
    image: props.dest.image,
    type: 'map',
    isForSale: isAvailableForPurchase.value,
  })
}
</script>

