<template>
  <aside class="basic-sidebar">
    <!-- Avatar -->
    <div class="text-center mb-4">
      <div v-if="!profile?.introVideoUrl" class="mb-3">
        <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 mx-auto bg-blue-100">
          <img
            v-if="profile?.image"
            :src="profile.image"
            :alt="profile.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-blue-600">
            <User class="w-10 h-10" />
          </div>
        </div>
      </div>
      <h2 class="text-lg font-bold text-blue-900 mb-1">{{ profile?.name || 'Unknown' }}</h2>
      <p v-if="profile?.handle" class="text-sm text-blue-600 mb-2">{{ profile.handle }}</p>
      <p v-if="profile?.tagline" class="text-sm text-gray-600 mb-3">{{ profile.tagline }}</p>
      <div v-if="profile?.location" class="text-xs text-gray-500 mb-3">
        📍 {{ profile.location }}
      </div>
    </div>

    <!-- Simple Stats -->
    <div v-if="hasStats" class="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-center">
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div v-if="profile?.stats?.rating">
          <div class="font-bold text-blue-900">⭐ {{ profile.stats.rating }}</div>
          <div class="text-gray-600">{{ profile.stats.reviews || 0 }} reviews</div>
        </div>
        <div v-if="profile?.stats?.locations">
          <div class="font-bold text-blue-900">{{ profile.stats.locations }}</div>
          <div class="text-gray-600">locations</div>
        </div>
      </div>
    </div>

    <!-- Simple Consultation -->
    <div v-if="consultation && isAvailable" class="bg-blue-500 text-white rounded p-4 mb-4">
      <h3 class="font-bold mb-2">{{ consultation.title }}</h3>
      <p class="text-sm mb-3">{{ formatPrice(consultation.price, consultation.currency) }}</p>
      <button
        class="w-full bg-white text-blue-500 px-3 py-2 rounded font-bold text-sm hover:bg-blue-50"
        @click="isBookingModalOpen = true"
      >
        Book Now
      </button>
    </div>

    <!-- Simple About -->
    <div v-if="bioParagraphs?.length" class="mb-4">
      <h3 class="font-bold text-blue-900 mb-2">About</h3>
      <p v-for="(paragraph, index) in bioParagraphs" :key="index" class="text-sm text-gray-700 mb-2">
        {{ paragraph }}
      </p>
    </div>

    <!-- Simple Skills -->
    <div v-if="profile?.skills?.length" class="mb-4">
      <h3 class="font-bold text-blue-900 mb-2">Skills</h3>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="skill in profile.skills"
          :key="skill"
          class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <!-- Simple Languages -->
    <div v-if="profile?.languages?.length" class="mb-4">
      <h3 class="font-bold text-blue-900 mb-2">Languages</h3>
      <div class="space-y-1">
        <div v-for="language in profile.languages" :key="language.id || language.name" class="text-sm text-gray-700">
          {{ language.flag }} {{ language.name }} - {{ language.level }}
        </div>
      </div>
    </div>

    <!-- Consultation Booking Modal -->
    <ConsultationBookingModal
      :is-open="isBookingModalOpen"
      :consultation="consultation"
      :consultation-id="consultation?.id"
      @close="isBookingModalOpen = false"
      @booking-created="handleBookingCreated"
    />
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, inject } from 'vue'
import { User } from 'lucide-vue-next'
import ConsultationBookingModal from './ConsultationBookingModal.vue'
import { useConsultation } from '@/shared/influencer/composables/useConsultation'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
  username: {
    type: String,
    default: null,
  },
})

const influencerUsername = inject('influencerUsername', null)
const currentUsername = computed(() => {
  if (props.username) return props.username
  if (influencerUsername?.value) return influencerUsername.value
  if (props.profile?.username) return props.profile.username
  return null
})

const { consultation, isAvailable, fetchConsultation } = useConsultation()
const isBookingModalOpen = ref(false)

onMounted(async () => {
  if (currentUsername.value) {
    await fetchConsultation(currentUsername.value)
  }
})

const hasStats = computed(() => {
  const stats = props.profile?.stats
  if (!stats) return false
  return stats.rating || stats.locations || stats.mapsBuilt || stats.travelersGuided
})

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

const handleBookingCreated = (booking) => {
  isBookingModalOpen.value = false
}
</script>

<style scoped>
.basic-sidebar {
  font-family: Arial, sans-serif;
}
</style>
