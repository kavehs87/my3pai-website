<template>
  <aside class="flex flex-col gap-6 p-6 text-slate-800">
    <!-- Intro Video -->
    <IntroVideoPlayer
      v-if="profile?.introVideoUrl"
      :video-url="profile.introVideoUrl"
      :thumbnail-url="profile.introVideoThumbnail"
      :duration="profile.introVideoDuration"
    />
    
    <div class="flex flex-col items-center text-center">
      <!-- Avatar - only show if no intro video -->
      <div v-if="!profile?.introVideoUrl" class="relative mb-4">
        <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
          <img
            v-if="profile?.image"
            :src="profile.image"
            :alt="profile.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
            <User class="w-16 h-16" />
          </div>
        </div>
        <!-- Verified badge -->
        <div
          v-if="profile?.verified"
          class="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
        >
          <BadgeCheck class="w-5 h-5 text-white" />
        </div>
      </div>
      <!-- Verified badge inline when video is present -->
      <div v-if="profile?.introVideoUrl && profile?.verified" class="flex items-center gap-1.5 mb-2">
        <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <BadgeCheck class="w-3.5 h-3.5 text-white" />
        </div>
        <span class="text-xs font-medium text-blue-600">Verified Creator</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900">{{ profile?.name || 'Unknown' }}</h1>
      <p v-if="profile?.handle" class="text-sm font-semibold text-indigo-600 mb-1">{{ profile.handle }}</p>
      <p v-if="profile?.tagline" class="text-sm text-slate-600 font-medium mb-3">
        {{ profile.tagline }}
      </p>
      <div class="flex flex-col items-center gap-1.5 text-slate-500 text-sm mb-4">
        <div v-if="profile?.location" class="flex items-center gap-1.5">
          <MapPin class="w-3.5 h-3.5" />
          <span>{{ profile.location }}</span>
        </div>
        <div v-if="profile?.subLocation" class="flex items-center gap-1.5">
          <Building2 class="w-3.5 h-3.5" />
          <span>{{ profile.subLocation }}</span>
        </div>
      </div>
      <!-- Dynamic Social Links -->
      <div v-if="profile?.socials?.length" class="flex items-center gap-3 text-slate-400">
        <a
          v-for="social in profile.socials"
          :key="social.id || social.platform"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          :class="getSocialHoverClass(social.platform)"
          class="transition-colors"
          :aria-label="social.platform"
        >
          <component :is="getSocialIcon(social.platform)" class="w-5 h-5" />
        </a>
      </div>
    </div>

    <!-- Stats Section -->
    <div v-if="hasStats" class="bg-slate-50/80 rounded-2xl p-4 flex justify-between items-center text-center">
      <div v-if="profile?.stats?.rating" class="flex flex-col items-center">
        <div class="flex items-center gap-1 text-slate-900 font-bold">
          <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>{{ profile.stats.rating }}</span>
        </div>
        <span class="text-xs text-slate-500">{{ profile.stats.reviews || 0 }} reviews</span>
      </div>
      <div v-if="profile?.stats?.rating && profile?.stats?.locations" class="w-px h-8 bg-slate-200" />
      <div v-if="profile?.stats?.locations" class="flex flex-col items-center">
        <span class="text-slate-900 font-bold">{{ profile.stats.locations }}</span>
        <span class="text-xs text-slate-500">locations</span>
      </div>
      <div v-if="profile?.stats?.locations && profile?.stats?.mapsBuilt" class="w-px h-8 bg-slate-200" />
      <div v-if="profile?.stats?.mapsBuilt" class="flex flex-col items-center">
        <span class="text-slate-900 font-bold">{{ profile.stats.mapsBuilt }}</span>
        <span class="text-xs text-slate-500">maps built</span>
      </div>
      <div v-if="profile?.stats?.mapsBuilt && profile?.stats?.travelersGuided" class="w-px h-8 bg-slate-200" />
      <div v-if="profile?.stats?.travelersGuided" class="flex flex-col items-center">
        <span class="text-slate-900 font-bold">{{ profile.stats.travelersGuided }}</span>
        <span class="text-xs text-slate-500">travelers</span>
      </div>
    </div>

    <!-- Consultation CTA -->
    <div v-if="consultation && isAvailable" class="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/10">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
          <Video class="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h3 class="font-bold text-lg leading-tight">{{ consultation.title }}</h3>
          <p class="text-slate-400 text-xs mt-1">Video call • {{ consultation.durationMinutes }} mins</p>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm font-medium">
          <span class="text-slate-400">From </span>
          <span class="text-white text-lg font-bold">{{ formatPrice(consultation.price, consultation.currency) }}</span>
        </div>
        <button 
          class="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
          @click="isBookingModalOpen = true"
        >
          Book Now →
        </button>
      </div>
    </div>

    <!-- External Links -->
    <div v-if="profile?.externalLinks?.length" class="grid grid-cols-2 gap-3">
      <a
        v-for="link in profile.externalLinks"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer block"
      >
        <div class="flex items-center gap-1.5 mb-1.5">
          <div class="w-5 h-5 rounded flex items-center justify-center border border-slate-100">
            <span :class="['text-xs font-bold', getExternalLinkColor(link.platform)]">
              {{ link.platform?.charAt(0)?.toUpperCase() || 'L' }}
            </span>
          </div>
          <div v-if="link.rating" class="flex items-center gap-0.5 text-[10px] font-bold text-slate-600">
            <Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            {{ link.rating }}
          </div>
        </div>
        <h4 class="font-bold text-slate-900 text-sm leading-tight">{{ link.title }}</h4>
        <p v-if="link.subtitle" class="text-slate-500 text-[10px] leading-tight mt-0.5">{{ link.subtitle }}</p>
      </a>
    </div>

    <!-- About Section -->
    <div v-if="bioParagraphs?.length" class="space-y-3">
      <h2 class="text-lg font-bold text-slate-900">About me</h2>
      <p v-for="(paragraph, index) in bioParagraphs" :key="index" class="text-sm text-slate-600 leading-relaxed">
        {{ paragraph }}
      </p>
    </div>

    <!-- Skills and Languages -->
    <div v-if="profile?.skills?.length || profile?.languages?.length" class="space-y-6">
      <div v-if="profile?.skills?.length">
        <h2 class="text-lg font-bold text-slate-900 mb-3">Skills and languages</h2>
        <h3 class="text-sm font-bold text-slate-700 mb-2">Skills</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in profile.skills"
            :key="skill"
            class="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full"
          >
            {{ skill }}
          </span>
        </div>
      </div>
      <div v-if="profile?.languages?.length">
        <h3 class="text-sm font-bold text-slate-700 mb-3">Languages</h3>
        <div class="space-y-3">
          <div v-for="language in profile.languages" :key="language.id || language.name" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ language.flag }}</span>
              <span class="text-slate-700 font-medium">{{ language.name }}</span>
            </div>
            <span class="text-slate-500 text-xs">{{ language.level }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Certifications -->
    <div v-if="profile?.certifications?.length" class="space-y-4">
      <h2 class="text-lg font-bold text-slate-900">Certifications and badges</h2>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="cert in profile.certifications"
          :key="cert"
          class="bg-slate-50 p-3 rounded-xl flex items-center gap-3"
        >
          <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
            <component :is="getCertificationIcon(cert)" class="w-5 h-5 text-indigo-500" />
          </div>
          <span class="text-xs font-bold text-slate-700 leading-tight">
            {{ cert }}
          </span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <button class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
        <Bell class="w-4 h-4" />
        Subscribe to my content
      </button>
      <button class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
        <MessageSquare class="w-4 h-4" />
        Message this creator
      </button>
      <button
        class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        @click="isModalOpen = true"
      >
        <Sparkles class="w-4 h-4 text-yellow-300" />
        Request custom trip
      </button>
      <button class="w-full py-3 px-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
        <Coffee class="w-4 h-4" />
        Send tip
      </button>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-slate-900">Plan Your Adventure</h2>
        <p class="text-sm text-slate-500 mb-6">Use my AI assistant to preview what a trip curated by me looks like.</p>
        <form v-if="!aiResponse" class="space-y-4" @submit.prevent="handleRequestTrip">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Destination</label>
            <input
              v-model="destination"
              type="text"
              required
              class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="e.g., Patagonia, Kyoto, Tuscany"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Travel Style</label>
            <select
              v-model="travelStyle"
              class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option>Adventure</option>
              <option>Luxury</option>
              <option>Budget</option>
              <option>Foodie</option>
            </select>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <template v-else>
              <Sparkles class="w-4 h-4" />
              Generate Preview
            </template>
          </button>
        </form>
        <div v-else class="animate-fade-in">
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 mb-6 whitespace-pre-wrap">
            {{ aiResponse }}
          </div>
          <button
            class="w-full py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
            @click="closeModal"
          >
            Close &amp; Book Call
          </button>
        </div>
        <button
          v-if="!aiResponse"
          class="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600"
          @click="closeModal"
        >
          Cancel
        </button>
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
import {
  MapPin,
  Building2,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Star,
  Bell,
  MessageSquare,
  Sparkles,
  Coffee,
  GraduationCap,
  HeartPulse,
  Leaf,
  Award,
  Home,
  BadgeCheck,
  User,
  Video,
  Link as LinkIcon,
} from 'lucide-vue-next'
import IntroVideoPlayer from './IntroVideoPlayer.vue'
import ConsultationBookingModal from './ConsultationBookingModal.vue'
import { useConsultation } from '@/components/influencer/composables/useConsultation'

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

// Get username from inject if not provided as prop
const influencerUsername = inject('influencerUsername', null)
const currentUsername = computed(() => {
  if (props.username) return props.username
  if (influencerUsername?.value) return influencerUsername.value
  if (props.profile?.username) return props.profile.username
  return null
})

// Fetch consultation data
const { consultation, isAvailable, fetchConsultation } = useConsultation()

onMounted(async () => {
  if (currentUsername.value) {
    await fetchConsultation(currentUsername.value)
  }
})

const isModalOpen = ref(false)
const isBookingModalOpen = ref(false)
const destination = ref('')
const travelStyle = ref('Adventure')
const aiResponse = ref('')
const loading = ref(false)

/**
 * Check if profile has any stats to display
 */
const hasStats = computed(() => {
  const stats = props.profile?.stats
  if (!stats) return false
  return stats.rating || stats.locations || stats.mapsBuilt || stats.travelersGuided
})

/**
 * Get the appropriate icon component for a social platform
 */
const getSocialIcon = (platform) => {
  const icons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    tiktok: 'TikTok', // Will use text fallback
  }
  return icons[platform?.toLowerCase()] || LinkIcon
}

/**
 * Get hover color class for social platform
 */
const getSocialHoverClass = (platform) => {
  const classes = {
    instagram: 'hover:text-pink-600',
    youtube: 'hover:text-red-600',
    twitter: 'hover:text-blue-400',
    facebook: 'hover:text-blue-600',
    linkedin: 'hover:text-blue-700',
    tiktok: 'hover:text-slate-900',
  }
  return classes[platform?.toLowerCase()] || 'hover:text-slate-600'
}

/**
 * Get color class for external link platform
 */
const getExternalLinkColor = (platform) => {
  const colors = {
    airbnb: 'text-rose-500',
    getyourguide: 'text-orange-500',
    tripadvisor: 'text-green-600',
    booking: 'text-blue-600',
  }
  return colors[platform?.toLowerCase()] || 'text-slate-600'
}

const getCertificationIcon = (name) => {
  if (name.includes('Hiking')) return GraduationCap
  if (name.includes('First Aid')) return HeartPulse
  if (name.includes('Sustainability')) return Leaf
  if (name.includes('Airbnb')) return Home
  if (name.includes('TripAdvisor')) return Award
  return BadgeCheck
}

const previewTemplates = [
  (dest, style) =>
    `• Sunrise hike into ${dest} with curated ${style.toLowerCase()} photo spots 🌄
• Midday bites at my favorite hidden cafés + stress-free transit notes ☕️
• Golden-hour picnic overlooking the water, complete with gear + budgeting tips 💼

Craving the full playbook? Book a session and I’ll tailor every detail.`,
  (dest, style) =>
    `• Boutique stays + seamless transfers mapped for ${dest} ✈️
• ${style} friendly eats, markets, and scenic detours I personally vetted 🍽️
• Evening experiences that skip the crowds but keep the magic alive ✨

Let’s build the full trip together—grab a consultation slot.`,
  (dest, style) =>
    `• Day 1 immersion through my private Google Maps layer for ${dest} 🗺️
• Handpicked ${style} adventures with plan B options for shifting weather 🌦️
• Packing, pacing, and budget guardrails so you can just enjoy the ride 🎒

Want the rest of the blueprint? Tap “Book Now” and I’ll send it over.`,
]

const handleRequestTrip = () => {
  loading.value = true
  aiResponse.value = ''

  window.setTimeout(() => {
    const template =
      previewTemplates[Math.floor(Math.random() * previewTemplates.length)]
    const resolvedDestination = destination.value || 'your next escape'
    const resolvedStyle = travelStyle.value || 'Adventure'
    aiResponse.value = template(resolvedDestination, resolvedStyle)
    loading.value = false
  }, 800)
}

const closeModal = () => {
  isModalOpen.value = false
  aiResponse.value = ''
  destination.value = ''
  travelStyle.value = 'Adventure'
}

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

const handleBookingCreated = (booking) => {
  isBookingModalOpen.value = false
  // You can emit an event or show a toast here
}
</script>

