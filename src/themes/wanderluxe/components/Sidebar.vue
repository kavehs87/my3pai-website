<template>
  <aside class="h-full w-full flex flex-col text-slate-800 relative bg-white">
    <!-- Professional Header Bar -->
    <div
      v-if="onCollapse"
      class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-md z-10"
    >
      <div class="flex items-center gap-2 text-slate-400">
        <User class="w-4 h-4" />
        <span class="text-xs font-bold uppercase tracking-wider">Creator Profile</span>
      </div>
      <button
        @click="handleCollapse"
        class="p-2 -mr-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
        title="Collapse Sidebar"
      >
        <PanelLeftClose class="w-5 h-5" />
      </button>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto">
      <!-- Profile Cover Video -->
      <ProfileVideoCard
        :video-url="profile?.introVideoUrl"
        :thumbnail-url="profile?.introVideoThumbnail"
        :avatar-url="profile?.image || profile?.avatar"
      />

      <!-- Header: Name, Role, Location -->
      <div class="flex flex-col items-center text-center">
        <h1 class="text-2xl font-bold text-slate-900">{{ profile?.name || 'Creator' }}</h1>
        <p v-if="profile?.handle" class="text-sm font-semibold text-indigo-600 mb-1">
          {{ profile.handle }}
        </p>
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

        <!-- Social Icons -->
        <div v-if="socialLinks.length > 0" class="flex items-center gap-3 text-slate-400">
          <a
            v-for="(social, i) in socialLinks"
            :key="i"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="[
              'hover:transition-colors',
              getSocialHoverColor(social.platform, social.url)
            ]"
          >
            <component :is="getSocialIcon(social.platform, social.url)" class="w-5 h-5" />
          </a>
        </div>
      </div>

      <!-- Stats Card -->
      <div
        v-if="profile?.stats"
        class="bg-slate-50/80 rounded-2xl p-4 flex justify-between items-center text-center"
      >
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-1 text-slate-900 font-bold">
            <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{{ profile.stats.rating || '0' }}</span>
          </div>
          <span class="text-xs text-slate-500">{{ profile.stats.reviews || 0 }} reviews</span>
        </div>
        <div class="w-px h-8 bg-slate-200" />
        <div class="flex flex-col items-center">
          <span class="text-slate-900 font-bold">{{ profile.stats.locations || 0 }}</span>
          <span class="text-xs text-slate-500">locations</span>
        </div>
        <div class="w-px h-8 bg-slate-200" />
        <div class="flex flex-col items-center">
          <span class="text-slate-900 font-bold">{{ profile.stats.mapsBuilt || 0 }}</span>
          <span class="text-xs text-slate-500">maps built</span>
        </div>
        <div class="w-px h-8 bg-slate-200" />
        <div class="flex flex-col items-center">
          <span class="text-slate-900 font-bold">{{ profile.stats.travelersGuided || '0' }}</span>
          <span class="text-xs text-slate-500">travelers</span>
        </div>
      </div>

      <!-- 1-on-1 Consultation Booking -->
      <div
        v-if="consultationProduct"
        class="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-900/10"
      >
        <div>
          <h3 class="font-bold text-lg leading-tight">{{ consultationProduct.title || '1-on-1 Trip Planning' }}</h3>
          <p class="text-slate-400 text-xs mt-1">Video call • 60 mins</p>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm font-medium">
            <span class="text-slate-400">From </span>
            <span class="text-white text-lg font-bold">
              <PriceDisplay :amount="consultationProduct.price || 0" />
            </span>
          </div>
          <button
            @click="handleNavigate('consultation')"
            class="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
          >
            Book Now →
          </button>
        </div>
      </div>

      <!-- External Platform Links -->
      <div v-if="externalLinks.length > 0" class="grid grid-cols-2 gap-3">
        <div
          v-for="link in externalLinks"
          :key="link.id"
          class="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="handleExternalLink(link.url)"
        >
          <div class="flex items-center gap-1.5 mb-1.5">
            <div
              :class="[
                'w-5 h-5 rounded flex items-center justify-center border border-slate-100',
                link.platform === 'Airbnb' ? '' : ''
              ]"
            >
              <span
                :class="[
                  'text-xs font-bold',
                  link.platform === 'Airbnb' ? 'text-rose-500' : 'text-orange-500'
                ]"
              >
                {{ link.platform === 'Airbnb' ? 'A' : 'G' }}
              </span>
            </div>
            <div
              v-if="link.rating"
              class="flex items-center gap-0.5 text-[10px] font-bold text-slate-600"
            >
              <Star class="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              {{ link.rating }}
            </div>
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-tight">{{ link.title }}</h4>
          <p class="text-slate-500 text-[10px] leading-tight mt-0.5">{{ link.subtitle }}</p>
        </div>
      </div>

      <!-- Featured Accommodation Card -->
      <div
        v-if="featuredAccommodation"
        class="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="handleExternalLink(featuredAccommodation.url)"
      >
        <div class="flex h-16">
          <div class="w-20 shrink-0">
            <img
              :src="featuredAccommodation.image || '/placeholder-accommodation.jpg'"
              alt="Accommodation"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-2.5 flex flex-col justify-center min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 rounded">Airbnb</span>
              <div class="flex items-center text-[10px] text-slate-500">
                <Star class="w-2.5 h-2.5 fill-slate-900 text-slate-900 mr-0.5" />
                <span class="text-slate-900 font-bold">{{ featuredAccommodation.rating || '0' }}</span>
                <span class="ml-0.5">({{ featuredAccommodation.reviews || 0 }})</span>
              </div>
            </div>
            <h4 class="text-xs font-bold text-slate-900 truncate">{{ featuredAccommodation.title }}</h4>
            <p class="text-[10px] text-slate-500 truncate">{{ featuredAccommodation.location }}</p>
          </div>
        </div>
      </div>

      <!-- About Me -->
      <div v-if="bioParagraphs.length > 0" class="space-y-3">
        <h2 class="text-lg font-bold text-slate-900">About me</h2>
        <p
          v-for="(paragraph, idx) in bioParagraphs"
          :key="idx"
          class="text-sm text-slate-600 leading-relaxed"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- Skills & Languages -->
      <div v-if="profile?.skills?.length > 0 || profile?.languages?.length > 0" class="space-y-6">
        <div v-if="profile?.skills?.length > 0">
          <h2 class="text-lg font-bold text-slate-900 mb-3">Skills and languages</h2>
          <h3 class="text-sm font-bold text-slate-700 mb-2">Skills</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(skill, index) in profile.skills"
              :key="index"
              class="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full"
            >
              {{ typeof skill === 'string' ? skill : skill.skill || skill }}
            </span>
          </div>
        </div>

        <div v-if="profile?.languages?.length > 0">
          <h3 class="text-sm font-bold text-slate-700 mb-3">Languages</h3>
          <div class="space-y-3">
            <div
              v-for="(lang, index) in profile.languages"
              :key="index"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center gap-2">
                <span class="text-base">{{ lang.flag || '🌐' }}</span>
                <span class="text-slate-700 font-medium">{{ lang.name }}</span>
              </div>
              <span class="text-slate-500 text-xs">{{ lang.level }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Certifications -->
      <div v-if="profile?.certifications?.length > 0" class="space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Certifications and badges</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(cert, index) in profile.certifications"
            :key="index"
            class="bg-slate-50 p-3 rounded-xl flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-indigo-600">
              <component :is="getCertificationIcon(cert)" class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold text-slate-700 leading-tight">
              {{ typeof cert === 'string' ? cert : cert.name || cert }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Buttons -->
      <div class="space-y-3">
        <button
          class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Bell class="w-4 h-4" />
          Subscribe to my content
        </button>

        <button
          @click="handleNavigate('contact')"
          class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare class="w-4 h-4" />
          Message this creator
        </button>

        <button
          @click="handleNavigate('consultation')"
          class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Sparkles class="w-4 h-4 text-yellow-300" />
          Request custom trip
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  PanelLeftClose,
  MapPin,
  Building2,
  Star,
  Bell,
  MessageSquare,
  Sparkles,
  BadgeCheck,
  HeartPulse,
  Leaf,
  Award,
  Home,
  Mountain,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Music2,
} from 'lucide-vue-next'
import ProfileVideoCard from './ProfileVideoCard.vue'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
  onCollapse: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || router.currentRoute.value.params.username)

// Consultation product (will be fetched from API)
const consultationProduct = ref(null)

// Fetch consultation product
const fetchConsultationProduct = async () => {
  if (!currentUsername.value) return
  
  try {
    // Get consultation details from API
    const result = await apiService.getInfluencerConsultation(currentUsername.value)
    if (result.success && result.data) {
      const data = result.data.data || result.data
      if (data && (data.price || data.price === 0)) {
        consultationProduct.value = {
          id: 'consultation',
          title: data.title || '1-on-1 Trip Planning',
          price: data.price || 0,
          image: data.image || null,
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch consultation product:', error)
    // Don't set default - only show if consultation exists
  }
}

// Social links
const socialLinks = computed(() => {
  if (!props.profile?.socials) return []
  return props.profile.socials.map((social) => ({
    platform: social.platform,
    url: social.url,
    handle: social.handle,
  }))
})

// External links
const externalLinks = computed(() => {
  if (!props.profile?.externalLinks) return []
  return props.profile.externalLinks
})

// Featured accommodation (placeholder - would come from API)
const featuredAccommodation = computed(() => {
  // This would come from API in the future
  return null
})

// Get social icon
const getSocialIcon = (platform, url = '') => {
  if (!platform) {
    // Try to detect from URL if platform is not provided
    if (url) {
      const urlLower = url.toLowerCase()
      if (urlLower.includes('instagram.com')) return Instagram
      if (urlLower.includes('youtube.com')) return Youtube
      if (urlLower.includes('facebook.com')) return Facebook
      if (urlLower.includes('linkedin.com')) return Linkedin
      if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return Twitter
      if (urlLower.includes('tiktok.com')) return Music2
    }
    return Instagram
  }
  
  const platformLower = platform.toLowerCase().trim()
  const iconMap = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
    tiktok: Music2,
    other: Instagram, // Default to Instagram for "other" platform
    // Handle variations
    'youtube.com': Youtube,
    'instagram.com': Instagram,
    'facebook.com': Facebook,
    'linkedin.com': Linkedin,
    'twitter.com': Twitter,
    'tiktok.com': Music2,
  }
  
  // If not found, try URL-based detection
  if (!iconMap[platformLower] && url) {
    const urlLower = url.toLowerCase()
    if (urlLower.includes('instagram.com')) return Instagram
    if (urlLower.includes('youtube.com')) return Youtube
    if (urlLower.includes('facebook.com')) return Facebook
    if (urlLower.includes('linkedin.com')) return Linkedin
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return Twitter
    if (urlLower.includes('tiktok.com')) return Music2
  }
  
  return iconMap[platformLower] || Instagram
}

// Get social hover color
const getSocialHoverColor = (platform, url = '') => {
  if (!platform) {
    // Try to detect from URL if platform is not provided
    if (url) {
      const urlLower = url.toLowerCase()
      if (urlLower.includes('instagram.com')) return 'hover:text-pink-600'
      if (urlLower.includes('youtube.com')) return 'hover:text-red-600'
      if (urlLower.includes('facebook.com')) return 'hover:text-blue-600'
      if (urlLower.includes('linkedin.com')) return 'hover:text-blue-700'
      if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'hover:text-blue-400'
      if (urlLower.includes('tiktok.com')) return 'hover:text-black'
    }
    return 'hover:text-slate-600'
  }
  
  const platformLower = platform.toLowerCase().trim()
  const colorMap = {
    instagram: 'hover:text-pink-600',
    youtube: 'hover:text-red-600',
    facebook: 'hover:text-blue-600',
    linkedin: 'hover:text-blue-700',
    twitter: 'hover:text-blue-400',
    tiktok: 'hover:text-black',
    other: 'hover:text-slate-600', // Default for "other" platform
    // Handle variations
    'youtube.com': 'hover:text-red-600',
    'instagram.com': 'hover:text-pink-600',
    'facebook.com': 'hover:text-blue-600',
    'linkedin.com': 'hover:text-blue-700',
    'twitter.com': 'hover:text-blue-400',
    'tiktok.com': 'hover:text-black',
  }
  
  // If not found, try URL-based detection
  if (!colorMap[platformLower] && url) {
    const urlLower = url.toLowerCase()
    if (urlLower.includes('instagram.com')) return 'hover:text-pink-600'
    if (urlLower.includes('youtube.com')) return 'hover:text-red-600'
    if (urlLower.includes('facebook.com')) return 'hover:text-blue-600'
    if (urlLower.includes('linkedin.com')) return 'hover:text-blue-700'
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'hover:text-blue-400'
    if (urlLower.includes('tiktok.com')) return 'hover:text-black'
  }
  
  return colorMap[platformLower] || 'hover:text-slate-600'
}

// Get certification icon
const getCertificationIcon = (cert) => {
  const certName = typeof cert === 'string' ? cert : cert.name || cert
  if (certName.includes('Hiking')) return Mountain
  if (certName.includes('First Aid')) return HeartPulse
  if (certName.includes('Sustainability')) return Leaf
  if (certName.includes('Airbnb')) return Home
  if (certName.includes('TripAdvisor')) return Award
  return BadgeCheck
}

// Handle navigation
const handleNavigate = (view) => {
  if (!currentUsername.value) return
  
  const routeMap = {
    'consultation': 'influencer-consultation',
    'contact': 'influencer-contact',
  }
  
  const routeName = routeMap[view]
  if (routeName) {
    router.push({ name: routeName, params: { username: currentUsername.value } })
  }
  emit('navigate', view)
}

// Handle collapse
const handleCollapse = () => {
  if (props.onCollapse) {
    props.onCollapse()
  }
}

// Handle external link
const handleExternalLink = (url) => {
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

onMounted(() => {
  fetchConsultationProduct()
})
</script>

