<template>
  <div class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface">
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" /> Back to Profile
    </button>

    <SectionHeader
      title="All Destination Maps"
      subtitle="Explore detailed itineraries and hidden gems from around the world."
      :icon="Map"
    />

    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading maps...</p>
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="dest in maps" :key="dest.id" class="h-full">
        <DestinationCard :dest="dest" :username="currentUsername" @add-to-cart="$emit('add-to-cart', $event)" />
      </div>
    </div>

    <div v-if="!loading && maps.length === 0" class="text-center py-20 text-text-muted">
      <p class="text-lg">No destination maps available yet.</p>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && maps.length > 0 && paginationMeta.last_page > 1" class="mt-12 flex justify-center items-center gap-4">
      <button
        @click="loadPage(paginationMeta.current_page - 1)"
        :disabled="paginationMeta.current_page === 1"
        class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-medium hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span class="text-text-muted">
        Page {{ paginationMeta.current_page }} of {{ paginationMeta.last_page }}
      </span>
      <button
        @click="loadPage(paginationMeta.current_page + 1)"
        :disabled="paginationMeta.current_page === paginationMeta.last_page"
        class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-medium hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ArrowLeft, Map } from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'
import DestinationCard from '../components/DestinationCard.vue'
import api from '@/services/api'

defineEmits(['back', 'add-to-cart'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const maps = ref([])
const loading = ref(false)
const paginationMeta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
})

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  if (!countryCode) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Helper to extract country info from map POIs
const extractCountryFromMap = (map) => {
  // Try to get country from POIs if available
  if (map.pois && map.pois.length > 0) {
    const poiWithCountry = map.pois.find(p => p.country || p.countryCode)
    if (poiWithCountry) {
      return {
        country: poiWithCountry.country || 'Unknown',
        flag: poiWithCountry.countryCode ? getFlagEmoji(poiWithCountry.countryCode) : '',
        countryCode: poiWithCountry.countryCode
      }
    }
  }
  // Fallback to map title
  return {
    country: map.title || 'Map',
    flag: '',
    countryCode: null
  }
}

const fetchMaps = async (page = 1) => {
  if (!currentUsername.value) return
  loading.value = true
  try {
    const result = await api.getInfluencerMaps(currentUsername.value, { 
      per_page: paginationMeta.value.per_page,
      page: page
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
          total: data.meta.total || mapsData.length
        }
      }
      
      // Transform API response to match DestinationCard format
      maps.value = mapsData
        .filter(map => map.isPublished) // Only show published maps
        .map((map) => {
          const countryInfo = extractCountryFromMap(map)
          return {
            id: map.id,
            country: countryInfo.country,
            flag: countryInfo.flag,
            image: map.thumbnailUrl || '/media-placeholder.jpg',
            description: map.title || 'Travel guide',
            poiCount: map.poiCount || 0,
            price: map.price || 0, // Maps may not have price, default to 0
            slug: map.slug,
            title: map.title
          }
        })
    } else {
      maps.value = []
    }
  } catch (err) {
    console.error('Error fetching maps:', err)
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

