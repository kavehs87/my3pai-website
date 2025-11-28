<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-600 font-medium">Loading profile...</p>
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

    <!-- Profile Content -->
    <template v-else-if="hasProfile">
      <!-- Mock Data Banner -->
      <div
        v-if="useMockData"
        class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800"
      >
        <span class="font-medium">Demo Mode:</span> Showing sample data. Connect your backend to see real profiles.
      </div>

      <!-- Mobile Header -->
      <div
        class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center"
        :class="{ 'top-[36px]': useMockData }"
      >
        <span class="font-bold text-xl text-slate-900">{{ profile?.name || 'WanderLuxe' }}</span>
        <div class="flex items-center gap-4">
          <button class="relative p-2 text-slate-900" aria-label="Basket">
            <ShoppingBasket class="w-6 h-6" />
            <span
              v-if="cartCount"
              class="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </button>
          <button class="p-2 text-slate-600" @click="toggleMobileMenu" aria-label="Toggle menu">
            <Menu v-if="!isMobileMenuOpen" />
            <X v-else />
          </button>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-30 bg-white pt-20 px-6">
        <div class="flex flex-col gap-6 text-2xl font-semibold text-slate-800">
          <button
            class="text-slate-400 text-base uppercase tracking-widest border-b border-slate-100 pb-4 text-left"
            @click="toggleMobileMenu"
          >
            Profile
          </button>
          <button
            v-for="item in navItems"
            :key="item.id"
            class="text-left hover:text-blue-600 transition-colors"
            @click="scrollToSection(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-4 lg:p-8 pt-24 lg:pt-8">
        <!-- Sidebar -->
        <div class="lg:col-span-4 xl:col-span-3">
          <div class="lg:sticky lg:top-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <InfluencerSidebar :profile="profile" :bio-paragraphs="bioParagraphs" />
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-8 xl:col-span-9 space-y-16 pb-20">
          <div class="hidden lg:flex sticky top-8 z-30 justify-between items-center">
            <nav
              class="bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/60 p-2 inline-flex gap-1 overflow-x-auto max-w-[70vw]"
              aria-label="Influencer sections"
            >
              <button
                v-for="item in navItems"
                :key="item.id"
                :class="[
                  'px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
                  activeSection === item.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
                ]"
                @click="scrollToSection(item.id)"
              >
                {{ item.label }}
              </button>
            </nav>
            <button
              class="bg-white hover:bg-slate-50 text-slate-900 p-3 rounded-full shadow-md border border-slate-200 relative transition-all active:scale-95 flex items-center gap-2 group ml-4 shrink-0"
            >
              <ShoppingBasket class="w-5 h-5" />
              <span class="font-bold text-sm">Basket</span>
              <span
                v-if="cartCount"
                class="bg-rose-500 text-white text-[10px] font-bold px-1.5 h-5 rounded-full flex items-center justify-center min-w-[1.25rem]"
              >
                {{ cartCount }}
              </span>
            </button>
          </div>

          <InfluencerItineraries @add-to-cart="handleAddToCart" />
          <InfluencerMasterclasses @add-to-cart="handleAddToCart" />
          <InfluencerCountryMaps @add-to-cart="handleAddToCart" />
          <InfluencerPodcast />
          <InfluencerBlog />
          <InfluencerMedia @add-to-cart="handleAddToCart" />
          <InfluencerSocial />

          <footer class="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
            © {{ new Date().getFullYear() }} {{ profile?.name || 'Creator' }} Profile. All rights reserved.
          </footer>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X, ShoppingBasket, AlertCircle } from 'lucide-vue-next'
import InfluencerSidebar from './components/InfluencerSidebar.vue'
import InfluencerItineraries from './components/InfluencerItineraries.vue'
import InfluencerMasterclasses from './components/InfluencerMasterclasses.vue'
import InfluencerCountryMaps from './components/InfluencerCountryMaps.vue'
import InfluencerPodcast from './components/InfluencerPodcast.vue'
import InfluencerBlog from './components/InfluencerBlog.vue'
import InfluencerMedia from './components/InfluencerMedia.vue'
import InfluencerSocial from './components/InfluencerSocial.vue'
import { useInfluencer } from './composables/useInfluencer'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
})

const route = useRoute()
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

const navItems = Object.freeze([
  { id: 'itineraries', label: 'Itineraries' },
  { id: 'training', label: 'Training' },
  { id: 'countries', label: 'Map' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'blog', label: 'Travel Blog' },
  { id: 'media', label: 'Assets' },
  { id: 'socials', label: 'Socials' },
])

const activeSection = ref(navItems[0].id)
const isMobileMenuOpen = ref(false)
const cartCount = ref(0)
let observer

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleAddToCart = () => {
  cartCount.value += 1
}

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeSection.value = id
  isMobileMenuOpen.value = false
}

const initObserver = () => {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { threshold: 0.3 }
  )

  navItems.forEach((item) => {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  })
}

/**
 * Load profile data based on username
 */
const loadProfile = async () => {
  const username = props.username || route.params.username

  if (username) {
    await fetchProfile(username)
  } else {
    // No username provided - load mock data for demo
    loadMockData()
  }
}

// Watch for route changes
watch(
  () => route.params.username,
  (newUsername) => {
    if (newUsername) {
      fetchProfile(newUsername)
    }
  }
)

onMounted(async () => {
  await loadProfile()
  // Wait for DOM to render before initializing observer
  setTimeout(initObserver, 100)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

