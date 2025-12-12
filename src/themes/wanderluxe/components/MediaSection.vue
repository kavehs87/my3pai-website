<template>
  <section id="media" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Creative Shop</span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Digital Assets & Stock</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Elevate your content with my professional-grade materials.
          Purchase <span class="text-slate-900 font-medium">4K drone footage</span>,
          <span class="text-slate-900 font-medium"> RAW photo packs</span>, and
          <span class="text-slate-900 font-medium"> Cinematic LUTs</span>.
          All assets come with a royalty-free commercial license.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-green-500" /> Instant Download
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-green-500" /> Commercial Use
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-green-500" /> High Bitrate
          </span>
        </div>
      </div>
      <button
        @click="handleViewAll"
        class="shrink-0 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all flex items-center gap-2"
      >
        Browse Full Library <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Loading assets...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchAssets"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Assets Grid -->
    <div v-else-if="displayedAssets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="asset in displayedAssets"
        :key="asset.id"
        class="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all bg-slate-50"
      >
        <div class="aspect-video overflow-hidden relative">
          <img
            :src="getAssetImage(asset)"
            :alt="asset.title || asset.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            @error="handleImageError"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          <!-- Type Badge -->
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm">
            <component :is="getTypeIcon(asset.type || asset.asset_type)" class="w-3 h-3" :class="getTypeIconColor(asset.type || asset.asset_type)" />
            {{ getTypeLabel(asset.type || asset.asset_type) }}
          </div>
        </div>

        <div class="p-5">
          <h3 class="font-bold text-slate-900 mb-1">{{ asset.title || asset.name }}</h3>
          <p v-if="asset.description" class="text-xs text-slate-500 mb-4 line-clamp-2">{{ asset.description }}</p>

          <div class="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold uppercase text-slate-400">License</span>
              <PriceDisplay :amount="getAssetPrice(asset)" class="text-lg font-bold text-slate-900" />
            </div>
            <button
              @click="handleAddToCart(asset)"
              :disabled="addingToCartId === asset.id"
              class="bg-white border border-slate-200 text-slate-900 p-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart v-if="addingToCartId !== asset.id" class="w-4 h-4" />
              <div v-else class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-slate-400">
      <Download class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No assets available yet.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  ArrowUpRight,
  ShoppingCart,
  Film,
  Image as ImageIcon,
  Sliders,
  Download,
} from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 6, // Show first 6 assets in section
  },
})

const emit = defineEmits(['add-to-cart', 'view-all'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.username || username?.value || router.currentRoute.value.params.username)

// State
const assets = ref([])
const loading = ref(false)
const error = ref(null)
const addingToCartId = ref(null)

// Computed
const displayedAssets = computed(() => {
  if (props.limit && props.limit > 0) {
    return assets.value.slice(0, props.limit)
  }
  return assets.value
})

// Methods
const fetchAssets = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null
  try {
    const result = await apiService.getInfluencerMediaAssets(currentUsername.value, {
      per_page: props.limit || 6,
    })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      assets.value = Array.isArray(data) ? data : data?.data || []
    } else {
      error.value = result.error || 'Failed to load assets.'
    }
  } catch (err) {
    console.error('Error fetching assets:', err)
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const getAssetImage = (asset) => {
  return asset.image ||
         asset.thumbnail ||
         asset.cover_image ||
         asset.preview_image ||
         '/media-placeholder.jpg'
}

const getAssetPrice = (asset) => {
  // Handle price in cents or dollars
  if (asset.price_cents !== undefined) {
    return asset.price_cents / 100
  }
  if (typeof asset.price === 'number') {
    // If price > 10000, likely in cents
    if (asset.price > 10000) {
      return asset.price / 100
    }
    return asset.price
  }
  return 0
}

const getTypeLabel = (type) => {
  const typeMap = {
    'video': 'Video',
    'photo': 'Photo',
    'preset': 'Preset',
    'lut': 'LUT',
    'raw_photo': 'RAW Photo',
    'drone_footage': 'Drone Footage',
    'media_asset': 'Asset',
  }
  return typeMap[type?.toLowerCase()] || type || 'Asset'
}

const getTypeIcon = (type) => {
  const typeLower = type?.toLowerCase()
  if (typeLower === 'video' || typeLower === 'drone_footage') return Film
  if (typeLower === 'photo' || typeLower === 'raw_photo') return ImageIcon
  if (typeLower === 'preset' || typeLower === 'lut') return Sliders
  return Download
}

const getTypeIconColor = (type) => {
  const typeLower = type?.toLowerCase()
  if (typeLower === 'video' || typeLower === 'drone_footage') return 'text-blue-500'
  if (typeLower === 'photo' || typeLower === 'raw_photo') return 'text-purple-500'
  if (typeLower === 'preset' || typeLower === 'lut') return 'text-orange-500'
  return 'text-slate-500'
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

const handleAddToCart = async (asset) => {
  if (addingToCartId.value === asset.id) return

  addingToCartId.value = asset.id
  try {
    const result = await apiService.addCartItem({
      item_type: 'media_asset',
      item_id: asset.id,
      quantity: 1,
    })

    if (result.success) {
      toast.success('Added to cart')
      emit('add-to-cart', asset)
      eventBus.emit('cart-item-added', asset)
    } else {
      toast.error(result.error || 'Failed to add to cart')
    }
  } catch (err) {
    console.error('Error adding to cart:', err)
    toast.error('Failed to add to cart. Please try again.')
  } finally {
    addingToCartId.value = null
  }
}

const handleViewAll = () => {
  emit('view-all')
  if (currentUsername.value) {
    router.push({ name: 'influencer-assets', params: { username: currentUsername.value } })
  }
}

onMounted(() => {
  fetchAssets()
})
</script>

