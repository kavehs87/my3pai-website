<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto">
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <div class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-emerald-100 rounded-2xl">
          <Map class="w-8 h-8 text-emerald-600" />
        </div>
        <h1 class="text-3xl font-bold text-slate-900">Destinations</h1>
      </div>
      <p class="text-slate-500 max-w-2xl text-lg">
        Explore detailed itineraries and hidden gems from around the world. My hand-picked guides and interactive maps help you find the best photo spots, hidden cafes, and local secrets.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading maps...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchMaps(paginationMeta.current_page)"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Maps Grid -->
    <div v-else-if="maps.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="map in maps"
        :key="map.id"
        @click="handleMapClick(map)"
        class="group relative rounded-3xl overflow-hidden cursor-pointer h-80 w-full shadow-sm hover:shadow-2xl transition-all border border-slate-100"
      >
        <img
          :src="getMapImage(map)"
          :alt="getMapName(map)"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          @error="handleImageError"
        />

        <!-- Darker Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80 group-hover:via-black/20 group-hover:to-black/90 transition-all duration-300" />

        <!-- Floating Badges -->
        <div class="absolute top-4 left-4 flex gap-2">
          <span class="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 shadow-lg">
            {{ getCountryCode(map) }}
          </span>
          <span
            v-if="getMapDiscount(map)"
            class="bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
          >
            <Tag class="w-3 h-3" />
            {{ getMapDiscount(map) }}
          </span>
        </div>

        <!-- Price Tag -->
        <div
          v-if="getMapPrice(map) !== null"
          class="absolute top-4 right-4 group-hover:scale-110 transition-transform"
        >
          <span class="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <PriceDisplay :amount="getMapPrice(map)" class="text-xs" />
            <span class="font-normal text-slate-500">| Map</span>
          </span>
        </div>

        <!-- Content -->
        <div class="absolute bottom-0 left-0 p-6 w-full">
          <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 class="text-3xl font-bold text-white mb-2 leading-none drop-shadow-md">{{ getMapName(map) }}</h3>
            <p class="text-sm text-slate-100 mb-4 line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
              {{ getMapDescription(map) }}
            </p>

            <div class="flex items-center justify-between pt-3 border-t border-white/20">
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-white" />
                <span class="text-xs font-bold uppercase tracking-widest text-white">{{ getPoiCount(map) }} Spots Included</span>
              </div>
              <div class="bg-white/20 p-2 rounded-full group-hover:bg-white group-hover:text-black transition-colors text-white">
                <ArrowUpRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-slate-400">
      <MapPin class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No destination maps available yet.</p>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && maps.length > 0 && paginationMeta.last_page > 1" class="mt-12 flex justify-center items-center gap-4">
      <button
        @click="loadPage(paginationMeta.current_page - 1)"
        :disabled="paginationMeta.current_page === 1"
        class="px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span class="text-slate-500">
        Page {{ paginationMeta.current_page }} of {{ paginationMeta.last_page }}
      </span>
      <button
        @click="loadPage(paginationMeta.current_page + 1)"
        :disabled="paginationMeta.current_page === paginationMeta.last_page"
        class="px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <!-- Map Detail Modal -->
    <Teleport to="body">
      <div
        v-if="selectedMap"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        @click="selectedMap = null"
      >
        <div
          class="bg-white rounded-3xl w-full max-w-lg h-[70vh] flex flex-col shadow-2xl overflow-hidden relative border border-white/20"
          @click.stop
        >
          <div class="absolute top-4 right-4 z-10">
            <button
              @click="selectedMap = null"
              class="bg-black/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/40 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="h-56 shrink-0 relative">
            <img :src="getMapImage(selectedMap)" :alt="getMapName(selectedMap)" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div class="absolute bottom-6 left-6 text-white max-w-[80%]">
              <h2 class="text-3xl font-bold mb-2">{{ getMapName(selectedMap) }}</h2>
              <p class="text-sm text-white/90 leading-snug">{{ getMapDescription(selectedMap) }}</p>
            </div>
          </div>

          <div class="flex-grow overflow-y-auto p-6 bg-white">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Curated Locations</h4>
              <span class="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{{ getPoiCount(selectedMap) }} total</span>
            </div>

            <div v-if="selectedMap.pois && selectedMap.pois.length > 0" class="grid grid-cols-1 gap-3">
              <div
                v-for="(poi, index) in selectedMap.pois.slice(0, 10)"
                :key="index"
                class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div>
                  <h5 class="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{{ poi.name || poi.title }}</h5>
                  <div v-if="poi.tags && poi.tags.length > 0" class="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      v-for="tag in poi.tags"
                      :key="tag"
                      class="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                  <MapPin class="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-slate-400">
              <p class="text-sm">POI details will be available when viewing the full map.</p>
            </div>
          </div>

          <div class="p-4 bg-white border-t border-slate-100">
            <button
              @click="handleAddToCart(selectedMap)"
              :disabled="addingToCartId === selectedMap.id"
              class="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart v-if="addingToCartId !== selectedMap.id" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="text-base">Add Map to Cart</span>
              <div v-if="getMapPrice(selectedMap) !== null" class="bg-white/20 px-2 py-1 rounded text-white font-bold ml-auto flex items-center gap-2">
                <PriceDisplay :amount="getMapPrice(selectedMap)" />
              </div>
            </button>
          </div>
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
  Map,
  MapPin,
  Tag,
  ArrowUpRight,
  ShoppingCart,
  X,
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

const maps = ref([])
const loading = ref(false)
const error = ref(null)
const selectedMap = ref(null)
const addingToCartId = ref(null)
const paginationMeta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
})

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Extract country info from map POIs
const extractCountryFromMap = (map) => {
  if (map.pois && map.pois.length > 0) {
    const poiWithCountry = map.pois.find((p) => p.country || p.countryCode || p.country_code)
    if (poiWithCountry) {
      const countryCode = poiWithCountry.countryCode || poiWithCountry.country_code
      return {
        country: poiWithCountry.country || 'Unknown',
        flag: countryCode ? getFlagEmoji(countryCode) : '',
        countryCode: countryCode,
      }
    }
  }
  // Fallback to map title
  return {
    country: map.title || map.name || 'Map',
    flag: '',
    countryCode: null,
  }
}

const getMapImage = (map) => {
  return (
    map.thumbnailUrl ||
    map.thumbnail ||
    map.image ||
    map.cover_image ||
    '/media-placeholder.jpg'
  )
}

const getMapName = (map) => {
  return map.title || map.name || 'Destination Map'
}

const getMapDescription = (map) => {
  return (
    map.description ||
    map.subtitle ||
    `Explore ${getPoiCount(map)} curated locations in this destination.`
  )
}

const getCountryCode = (map) => {
  return (
    map.countryInfo?.countryCode ||
    map.countryCode ||
    map.country_code ||
    '🌍'
  )
}

const getPoiCount = (map) => {
  return (
    map.poiCount ||
    map.pois_count ||
    (map.pois ? map.pois.length : 0) ||
    0
  )
}

const getMapPrice = (map) => {
  if (map.price === null || map.price === undefined) return null
  if (map.price_cents !== undefined) {
    return map.price_cents / 100
  }
  if (typeof map.price === 'number') {
    if (map.price > 10000) {
      return map.price / 100
    }
    return map.price
  }
  return null
}

const getMapDiscount = (map) => {
  return (
    map.discount ||
    map.discount_badge ||
    (map.isNew || map.is_new ? 'NEW' : null) ||
    (map.isBestseller || map.is_bestseller ? 'BESTSELLER' : null) ||
    null
  )
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

const handleMapClick = (map) => {
  selectedMap.value = map
}

const handleAddToCart = async (map) => {
  if (addingToCartId.value === map.id) return

  addingToCartId.value = map.id
  try {
    const result = await apiService.addCartItem({
      item_type: 'map',
      item_id: map.id,
      quantity: 1,
    })

    if (result.success) {
      toast.success('Added to cart')
      emit('add-to-cart', map)
      eventBus.emit('cart-item-added', map)
      selectedMap.value = null
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

const fetchMaps = async (page = 1) => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null

  try {
    const result = await apiService.getInfluencerMaps(currentUsername.value, {
      per_page: paginationMeta.value.per_page,
      page: page,
    })

    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      const mapsData = Array.isArray(data) ? data : data?.maps || data?.data || []

      // Update pagination meta
      if (data?.meta) {
        paginationMeta.value = {
          current_page: data.meta.current_page || page,
          last_page: data.meta.last_page || 1,
          per_page: data.meta.per_page || paginationMeta.value.per_page,
          total: data.meta.total || mapsData.length,
        }
      }

      // Transform API response to match component format
      maps.value = mapsData
        .filter((map) => map.isPublished || map.is_published)
        .map((map) => {
          const countryInfo = extractCountryFromMap(map)
          return {
            ...map,
            countryInfo,
          }
        })
    } else {
      error.value = result.error || 'Failed to load maps.'
      maps.value = []
    }
  } catch (err) {
    console.error('Error fetching maps:', err)
    error.value = err.message || 'An unexpected error occurred.'
    maps.value = []
  } finally {
    loading.value = false
  }
}

const loadPage = (page) => {
  if (page >= 1 && page <= paginationMeta.value.last_page) {
    fetchMaps(page)
    window.scrollTo(0, 0)
  }
}

onMounted(() => {
  fetchMaps()
})
</script>

