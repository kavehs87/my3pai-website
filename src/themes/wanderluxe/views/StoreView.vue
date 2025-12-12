<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto">
    <!-- Back Button -->
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Digital Asset Store</h1>
        <p class="text-slate-500 max-w-2xl">
          High-quality resources for creators. Elevate your content with my personal collection of LUTs, raw footage, and presets.
        </p>
      </div>
      <button
        @click="showLicense = true"
        class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2 shrink-0"
      >
        <Info class="w-4 h-4" /> Licensing Terms
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
      <button
        v-for="f in filters"
        :key="f"
        @click="filter = f"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all',
          filter === f
            ? 'bg-white shadow-sm text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        {{ f }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-slate-500 font-medium">Loading assets...</p>
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
    <div v-else-if="filteredAssets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
      >
        <div class="aspect-video relative overflow-hidden bg-slate-100">
          <img
            :src="getAssetImage(asset)"
            :alt="asset.title || asset.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          />
          <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-slate-900">
            {{ getTypeLabel(asset.type || asset.asset_type) }}
          </div>
          <button
            @click="showLicense = true"
            class="absolute top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur text-white p-1.5 rounded-full transition-colors"
          >
            <Info class="w-4 h-4" />
          </button>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-slate-900 text-lg">{{ asset.title || asset.name }}</h3>
          </div>
          <p v-if="asset.description" class="text-slate-500 text-sm mb-6 h-10 line-clamp-2">{{ asset.description }}</p>
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p class="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Commercial License</p>
              <PriceDisplay :amount="getAssetPrice(asset)" class="text-xl font-bold text-slate-900" />
            </div>
            <button
              @click="handleAddToCart(asset)"
              :disabled="addingToCartId === asset.id"
              class="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBasket v-if="addingToCartId !== asset.id" class="w-4 h-4" />
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-slate-400">
      <Filter class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No assets found in this category.</p>
      <button @click="filter = 'all'" class="text-slate-900 font-bold mt-2 hover:underline">Clear Filters</button>
    </div>

    <!-- Licensing Modal -->
    <Teleport to="body">
      <div
        v-if="showLicense"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        @click="showLicense = false"
      >
        <div
          class="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative"
          @click.stop
        >
          <button
            @click="showLicense = false"
            class="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold mb-4">Licensing Agreement</h2>
          <div class="space-y-4 text-slate-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <p>
              <strong class="text-slate-900">Standard License:</strong> Use in unlimited personal projects and one commercial project (up to 5,000 views/copies).
            </p>
            <p>
              <strong class="text-slate-900">Commercial License:</strong> Unlimited use for commercial projects, client work, and monetized content.
            </p>
            <p>You may not resell, redistribute, or sub-license the assets in their original form.</p>
          </div>
          <button
            @click="showLicense = false"
            class="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Teleport } from 'vue'
import {
  ChevronLeft,
  Info,
  ShoppingBasket,
  Filter,
  X,
  Film,
  Image as ImageIcon,
  Sliders,
} from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

const emit = defineEmits(['add-to-cart'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

// State
const filter = ref('all')
const filters = ['all', 'video', 'photo', 'preset']
const showLicense = ref(false)
const assets = ref([])
const loading = ref(false)
const error = ref(null)
const addingToCartId = ref(null)

// Computed
const filteredAssets = computed(() => {
  if (filter.value === 'all') return assets.value
  return assets.value.filter((asset) => {
    const assetType = (asset.type || asset.asset_type || '').toLowerCase()
    const filterValue = filter.value.toLowerCase()
    
    // Map API types to filter categories
    if (filterValue === 'video') {
      return assetType.includes('video') || assetType.includes('footage') || assetType.includes('drone')
    }
    if (filterValue === 'photo') {
      return assetType.includes('photo') || assetType.includes('image') || assetType.includes('raw')
    }
    if (filterValue === 'preset') {
      return assetType.includes('preset') || assetType.includes('lut')
    }
    return false
  })
})

// Helper functions
const getTypeLabel = (type) => {
  if (!type) return 'Asset'
  const typeStr = type.toLowerCase()
  if (typeStr.includes('lut')) return 'LUT'
  if (typeStr.includes('preset')) return 'Preset'
  if (typeStr.includes('video') || typeStr.includes('footage')) return 'Video'
  if (typeStr.includes('photo') || typeStr.includes('image') || typeStr.includes('raw')) return 'Photo'
  return type
}

const getAssetImage = (asset) => {
  if (asset.image) return asset.image
  if (asset.thumbnail) return asset.thumbnail
  if (asset.media_url) return asset.media_url
  return '/media-placeholder.jpg'
}

const getAssetPrice = (asset) => {
  // Handle both cents and dollars
  if (asset.price_cents) return asset.price_cents / 100
  if (asset.price) return typeof asset.price === 'number' ? asset.price : parseFloat(asset.price) || 0
  return 0
}

const handleImageError = (e) => {
  e.target.src = '/media-placeholder.jpg'
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
      toast.success('Added to cart!')
      eventBus.emit('cart-updated')
      emit('add-to-cart', {
        id: asset.id,
        title: asset.title || asset.name,
        price: getAssetPrice(asset),
        image: getAssetImage(asset),
        type: 'Digital',
      })
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

const fetchAssets = async () => {
  if (!currentUsername.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const result = await apiService.getInfluencerMediaAssets(currentUsername.value)
    
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

onMounted(() => {
  fetchAssets()
})
</script>

