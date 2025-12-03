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
        <DestinationCard :dest="dest" @add-to-cart="$emit('add-to-cart', $event)" />
      </div>
    </div>

    <div v-if="!loading && maps.length === 0" class="text-center py-20 text-text-muted">
      <p class="text-lg">No destination maps available yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ArrowLeft, Map } from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'
import DestinationCard from '../components/DestinationCard.vue'
import { COUNTRIES } from '@/shared/influencer/constants'

defineEmits(['back', 'add-to-cart'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const maps = ref([])
const loading = ref(false)

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

const fetchMaps = async () => {
  loading.value = true
  // TODO: Fetch maps from API when endpoint is available
  // For now, use mock data from constants
  maps.value = COUNTRIES.map((country) => ({
    id: country.id,
    country: country.name,
    flag: getFlagEmoji(country.flagCode),
    image: country.image,
    description: country.description,
    poiCount: country.pointsOfInterestCount,
    price: country.mapPrice,
  }))
  loading.value = false
}

onMounted(() => {
  fetchMaps()
})
</script>

