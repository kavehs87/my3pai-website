<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-600 font-medium">Loading assets...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !hasProfile" class="min-h-screen flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p class="text-slate-600 mb-6">{{ error }}</p>
        <button
          class="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          @click="$router.push('/')"
        >
          Go Home
        </button>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="hasProfile">
      <!-- Mock Data Banner -->
      <div
        v-if="useMockData"
        class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800"
      >
        <span class="font-medium">Demo Mode:</span> Showing sample data. Connect your backend to see real assets.
      </div>

      <!-- Mobile Header -->
      <div
        class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center"
        :class="{ 'top-[36px]': useMockData }"
      >
        <div class="flex items-center gap-3">
          <button 
            class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            @click="goToProfile" 
            aria-label="Back to profile"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <span class="font-bold text-xl text-slate-900">{{ profile?.name || 'WanderLuxe' }}</span>
        </div>
        <span class="text-sm text-slate-500 font-medium">Media Library</span>
      </div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-4 lg:p-8 pt-24 lg:pt-8">
        <!-- Sidebar -->
        <div class="lg:col-span-4 xl:col-span-4">
          <div class="lg:sticky lg:top-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <InfluencerSidebar :profile="profile" :bio-paragraphs="bioParagraphs" :username="currentUsername" />
          </div>
        </div>

        <!-- Content - Media Assets Library -->
        <div class="lg:col-span-8 xl:col-span-8 space-y-8 pb-20">
          <!-- Sticky Back Navigation (Desktop) -->
          <div class="hidden lg:flex sticky top-8 z-30 mb-4">
            <router-link
              :to="profileLink"
              class="bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/60 px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-2"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Back to Profile</span>
            </router-link>
          </div>

          <!-- Header -->
          <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <!-- Breadcrumb Navigation (Mobile/Tablet) -->
            <div class="lg:hidden mb-6 flex items-center gap-2 text-sm">
              <router-link
                :to="profileLink"
                class="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <ArrowLeft class="w-4 h-4" />
                <span>Back to Profile</span>
              </router-link>
              <span class="text-slate-300">/</span>
              <span class="text-slate-900 font-medium">Digital Assets</span>
            </div>

            <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end mb-6">
              <div class="max-w-xl">
                <div class="flex items-center gap-2 mb-2">
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                    Creative Shop
                  </span>
                </div>
                <h1 class="text-3xl font-bold text-slate-900 mb-3">Digital Assets & Stock</h1>
                <p class="text-slate-500 text-base leading-relaxed">
                  Browse the complete collection of professional-grade materials from
                  <span class="text-slate-900 font-medium">{{ profile?.name || 'this creator' }}</span>.
                  Purchase <span class="text-slate-900 font-medium">4K drone footage</span>,
                  <span class="text-slate-900 font-medium"> RAW photo packs</span>, and
                  <span class="text-slate-900 font-medium"> Cinematic LUTs</span>.
                  All assets come with a royalty-free commercial license.
                </p>
                <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Instant Download</span>
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> Commercial Use</span>
                  <span class="flex items-center gap-1"><Check class="w-3 h-3 text-green-500" /> High Bitrate</span>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-3 items-center pt-6 border-t border-slate-200">
              <span class="text-sm font-medium text-slate-700">Filter by type:</span>
              <button
                v-for="type in assetTypes"
                :key="type.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedType === type.value
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                ]"
                @click="selectedType = type.value"
              >
                {{ type.label }}
              </button>
              <button
                v-if="selectedType"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                @click="selectedType = null"
              >
                Clear
              </button>
            </div>
          </div>

          <!-- Assets Grid -->
          <div v-if="assetsLoading" class="text-center py-12 text-slate-500">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading assets...</p>
          </div>

          <div v-else-if="filteredAssets.length === 0" class="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film class="w-8 h-8 text-slate-400" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">No assets found</h3>
            <p class="text-slate-500">
              {{ selectedType ? `No ${assetTypes.find(t => t.value === selectedType)?.label.toLowerCase()} assets available.` : 'No assets available yet.' }}
            </p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all bg-slate-50"
            >
              <div class="aspect-video overflow-hidden relative">
                <img
                  :src="asset.image || 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80'"
                  :alt="asset.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 shadow-sm">
                  <component :is="typeIcons[asset.type] ?? Sliders" class="w-3 h-3" />
                  {{ asset.type }}
                </div>
              </div>
              <div class="p-5">
                <h3 class="font-bold text-slate-900 mb-1">{{ asset.title }}</h3>
                <p class="text-xs text-slate-500 mb-4 line-clamp-2">
                  {{ asset.description }}
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold uppercase text-slate-400">License</span>
                    <span class="text-lg font-bold text-slate-900">{{ formatPrice(asset.price, asset.currency) }}</span>
                  </div>
                  <button
                    class="bg-white border border-slate-200 text-slate-900 p-2.5 rounded-lg hover:bg-slate-900 hover:text-white transition-colors"
                    aria-label="Add asset to cart"
                    @click="handleAddToCart(asset)"
                  >
                    <ShoppingCart class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination (if needed in future) -->
          <div v-if="hasMorePages" class="flex justify-center pt-8">
            <button
              class="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              @click="loadMore"
              :disabled="loadingMore"
            >
              <span v-if="loadingMore">Loading...</span>
              <span v-else>Load More</span>
            </button>
          </div>

          <footer class="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
            © {{ new Date().getFullYear() }} {{ profile?.name || 'Creator' }} Digital Assets. All rights reserved.
          </footer>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Film, Image as ImageIcon, Sliders, ShoppingCart, Check, AlertCircle, X, ArrowLeft } from 'lucide-vue-next'
import InfluencerSidebar from './components/InfluencerSidebar.vue'
import { useInfluencer } from './composables/useInfluencer'
import api from '@/services/api'
import { MEDIA_ASSETS as MOCK_MEDIA_ASSETS } from './constants'

const route = useRoute()
const router = useRouter()

const {
  profile,
  loading,
  error,
  useMockData,
  bioParagraphs,
  hasProfile,
  fetchProfile,
  loadMockData,
} = useInfluencer()

// Get username from route
const currentUsername = computed(() => route.params.username || null)

// Provide username to child components
provide('influencerUsername', currentUsername)

const assets = ref([])
const assetsLoading = ref(false)
const loadingMore = ref(false)
const selectedType = ref(null)
const currentPage = ref(1)
const hasMorePages = ref(false)

const assetTypes = [
  { value: null, label: 'All' },
  { value: 'Video', label: 'Video' },
  { value: 'Photo', label: 'Photo' },
  { value: 'Preset', label: 'Preset' },
  { value: 'Audio', label: 'Audio' },
  { value: 'Template', label: 'Template' },
  { value: 'Other', label: 'Other' },
]

const typeIcons = {
  Video: Film,
  Photo: ImageIcon,
  Preset: Sliders,
  Audio: 'Audio',
  Template: 'Template',
  Other: 'Other',
}

const filteredAssets = computed(() => {
  if (!selectedType.value) return assets.value
  return assets.value.filter(asset => asset.type === selectedType.value)
})

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

const loadMediaAssets = async (page = 1) => {
  if (!currentUsername.value) {
    assets.value = MOCK_MEDIA_ASSETS
    return
  }

  assetsLoading.value = page === 1
  loadingMore.value = page > 1

  try {
    const result = await api.getInfluencerMediaAssets(currentUsername.value, {
      page,
      per_page: 20,
      ...(selectedType.value ? { type: selectedType.value } : {}),
    })

    if (result.success && result.data) {
      // Handle nested data structure: result.data.data or result.data
      let responseData = result.data
      if (responseData.data) {
        responseData = responseData.data
      }
      
      // Extract assets array
      const newAssets = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data || [])
      
      if (page === 1) {
        assets.value = newAssets
      } else {
        assets.value = [...assets.value, ...newAssets]
      }

      // Check if there are more pages
      const meta = responseData?.meta || result.data?.meta || result.data?.data?.meta
      if (meta) {
        hasMorePages.value = meta.current_page < meta.last_page
        currentPage.value = meta.current_page
      } else {
        hasMorePages.value = newAssets.length === 20 // Assume more if we got a full page
      }
    } else {
      // Fallback to mock data
      assets.value = MOCK_MEDIA_ASSETS
    }
  } catch (err) {
    console.error('[MediaAssetsLibrary] Error fetching assets:', err)
    assets.value = MOCK_MEDIA_ASSETS
  } finally {
    assetsLoading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (hasMorePages.value && !loadingMore.value) {
    loadMediaAssets(currentPage.value + 1)
  }
}

const handleAddToCart = (asset) => {
  // TODO: Implement cart functionality
  console.log('Add to cart:', asset)
}

const profileLink = computed(() => {
  return currentUsername.value ? `/influencer/${currentUsername.value}` : '/'
})

const goToProfile = () => {
  if (currentUsername.value) {
    router.push(`/influencer/${currentUsername.value}`)
  } else {
    router.push('/')
  }
}

// Watch for type filter changes
watch(selectedType, () => {
  loadMediaAssets(1)
})

// Load profile and assets
onMounted(async () => {
  const username = currentUsername.value
  if (username) {
    await fetchProfile(username)
  } else {
    loadMockData()
  }
  await loadMediaAssets(1)
})
</script>

<style scoped>
/* Styles are inherited from InfluencerProfile layout */
</style>

