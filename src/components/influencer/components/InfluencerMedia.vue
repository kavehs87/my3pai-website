<template>
  <section id="media" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
            Creative Shop
          </span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Digital Assets &amp; Stock</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Elevate your content with my professional-grade materials.
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
      <router-link
        v-if="currentUsername"
        :to="`/influencer/${currentUsername}/media-assets`"
        class="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
      >
        Browse Full Library <ArrowUpRight class="w-4 h-4" />
      </router-link>
      <button
        v-else
        class="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
        disabled
      >
        Browse Full Library <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading assets...</p>
    </div>

    <div v-else-if="assets.length === 0" class="text-center py-12 text-slate-500">
      <p>No media assets available yet.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="asset in assets"
        :key="asset.id"
        class="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all bg-slate-50"
      >
        <div class="aspect-video overflow-hidden relative">
          <img :src="asset.image" :alt="asset.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
              @click="$emit('add-to-cart')"
            >
              <ShoppingCart class="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ArrowUpRight, Film, Image as ImageIcon, Sliders, ShoppingCart, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { MEDIA_ASSETS as MOCK_MEDIA_ASSETS } from '../constants'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['add-to-cart'])

// Get username from inject if not provided as prop
const influencerUsername = inject('influencerUsername', null)
const currentUsername = computed(() => {
  if (props.username) return props.username
  if (influencerUsername?.value) return influencerUsername.value
  return null
})

const router = useRouter()

const assets = ref([])
const loading = ref(false)
const error = ref(null)
const useMockData = ref(false)

const typeIcons = {
  Video: Film,
  Photo: ImageIcon,
  Preset: Sliders,
  Audio: 'Audio',
  Template: 'Template',
  Other: 'Other',
}

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

const loadMediaAssets = async () => {
  if (!currentUsername.value) {
    // Fallback to mock data if no username
    assets.value = MOCK_MEDIA_ASSETS
    useMockData.value = true
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await api.getInfluencerMediaAssets(currentUsername.value, {
      per_page: 20,
    })

    if (result.success && result.data) {
      // Handle nested response structure: { success: true, data: { data: [...], meta: {...} } }
      const responseData = result.data.data || result.data
      assets.value = Array.isArray(responseData) ? responseData : (responseData?.data || [])
      useMockData.value = false
    } else {
      // Fallback to mock data
      console.warn('[InfluencerMedia] API failed, using mock data:', result.error)
      assets.value = MOCK_MEDIA_ASSETS
      useMockData.value = true
      error.value = result.error
    }
  } catch (err) {
    console.error('[InfluencerMedia] Error fetching media assets:', err)
    assets.value = MOCK_MEDIA_ASSETS
    useMockData.value = true
    error.value = err.message || 'Failed to load media assets'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMediaAssets()
})
</script>

