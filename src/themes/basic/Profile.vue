<template>
  <div class="min-h-screen bg-blue-50 theme-basic" data-theme="basic">
    <!-- Mock Data Banner -->
    <div
      v-if="useMockData"
      class="bg-yellow-100 border-b-2 border-yellow-400 px-4 py-2 text-center text-sm text-yellow-900 font-bold"
    >
      <span>Demo Mode:</span> Showing sample data. Connect your backend to see real profiles.
    </div>

    <!-- Simple Header -->
    <header class="bg-white border-b-4 border-blue-500 px-6 py-4 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <h1 class="text-2xl font-bold text-blue-900">{{ profile?.name || 'Profile' }}</h1>
        <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold">
          🛒 Basket
        </button>
      </div>
    </header>

    <!-- Simple Layout - VERY Different from Modern -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sidebar - Simple Blue Border -->
        <div class="lg:col-span-1">
          <div class="bg-white border-4 border-blue-400 rounded-lg p-4 shadow-lg">
            <Sidebar :profile="profile" :bio-paragraphs="bioParagraphs" :username="username" />
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Simple Tab Navigation -->
          <div class="bg-white border-2 border-blue-300 rounded-lg p-2 flex gap-2 overflow-x-auto">
            <button
              v-for="item in navItems"
              :key="item.id"
              :class="[
                'px-4 py-2 rounded font-bold whitespace-nowrap',
                activeSection === item.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-700 border-2 border-blue-300'
              ]"
              @click="scrollToSection(item.id)"
            >
              {{ item.label }}
            </button>
          </div>

          <!-- Content Sections -->
          <div id="training">
            <Masterclasses :username="username" @add-to-cart="handleAddToCart" />
          </div>
          <div id="countries">
            <CountryMaps @add-to-cart="handleAddToCart" />
          </div>
          <div id="podcast">
            <Podcast :username="username" />
          </div>
          <div id="blog">
            <Blog :username="username" />
          </div>
          <div id="media">
            <Media :username="username" @add-to-cart="handleAddToCart" />
          </div>
          <div id="socials">
            <Social />
          </div>

          <footer class="pt-6 border-t-4 border-blue-400 text-center text-blue-700 font-bold text-sm">
            © {{ new Date().getFullYear() }} {{ profile?.name || 'Creator' }} Profile. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Sidebar from './components/InfluencerSidebar.vue'
import Masterclasses from './components/InfluencerMasterclasses.vue'
import CountryMaps from './components/InfluencerCountryMaps.vue'
import Podcast from './components/InfluencerPodcast.vue'
import Blog from './components/InfluencerBlog.vue'
import Media from './components/InfluencerMedia.vue'
import Social from './components/InfluencerSocial.vue'
import './styles/theme.css'

defineProps({
  profile: {
    type: Object,
    default: () => ({})
  },
  username: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  useMockData: {
    type: Boolean,
    default: false
  },
  bioParagraphs: {
    type: Array,
    default: () => []
  }
})

const navItems = Object.freeze([
  { id: 'training', label: 'Training' },
  { id: 'countries', label: 'Map' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'blog', label: 'Travel Blog' },
  { id: 'media', label: 'Assets' },
  { id: 'socials', label: 'Socials' },
])

const activeSection = ref(navItems[0].id)
let observer

const handleAddToCart = () => {
  // Simple cart handling
}

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeSection.value = id
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

onMounted(() => {
  setTimeout(initObserver, 100)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.theme-basic {
  font-family: Arial, sans-serif;
}
</style>
