<template>
  <div class="min-h-screen bg-white theme-minimal" data-theme="minimal">
    <!-- Mock Data Banner -->
    <div
      v-if="useMockData"
      class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800"
    >
      <span class="font-medium">Demo Mode:</span> Showing sample data. Connect your backend to see real profiles.
    </div>

    <!-- Simple Header -->
    <div class="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-slate-900">{{ profile?.name || 'WanderLuxe' }}</h1>
        <button class="relative p-2 text-slate-900" aria-label="Basket">
          <ShoppingBasket class="w-5 h-5" />
          <span
            v-if="cartCount"
            class="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Minimal Layout: Single Column -->
    <div class="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      <!-- Profile Header -->
      <div class="text-center border-b border-slate-200 pb-12">
        <div class="mb-6">
          <div
            v-if="profile?.introVideoUrl"
            class="w-32 h-32 rounded-full mx-auto overflow-hidden border-2 border-slate-300"
          >
            <img
              :src="profile?.introVideoThumbnail || profile?.image"
              :alt="profile?.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-32 h-32 rounded-full mx-auto overflow-hidden border-2 border-slate-300 bg-slate-100"
          >
            <img
              v-if="profile?.image"
              :src="profile?.image"
              :alt="profile?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
              <User class="w-16 h-16" />
            </div>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-2">{{ profile?.name || 'Unknown' }}</h2>
        <p v-if="profile?.tagline" class="text-slate-600 mb-4">{{ profile?.tagline }}</p>
        <div v-if="profile?.location" class="text-sm text-slate-500 mb-6">
          {{ profile?.location }}
        </div>
        
        <!-- Simple Stats -->
        <div v-if="profile?.stats" class="flex justify-center gap-8 text-center">
          <div v-if="profile.stats.rating">
            <div class="text-2xl font-bold text-slate-900">{{ profile.stats.rating }}</div>
            <div class="text-xs text-slate-500">Rating</div>
          </div>
          <div v-if="profile.stats.locations">
            <div class="text-2xl font-bold text-slate-900">{{ profile.stats.locations }}</div>
            <div class="text-xs text-slate-500">Locations</div>
          </div>
          <div v-if="profile.stats.mapsBuilt">
            <div class="text-2xl font-bold text-slate-900">{{ profile.stats.mapsBuilt }}</div>
            <div class="text-xs text-slate-500">Maps</div>
          </div>
        </div>
      </div>

      <!-- Simple Navigation -->
      <nav class="flex flex-wrap justify-center gap-4 border-b border-slate-200 pb-6">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          @click.prevent="scrollToSection(item.id)"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Content Sections -->
      <div class="space-y-16">
        <Masterclasses :username="username" @add-to-cart="handleAddToCart" />
        <CountryMaps @add-to-cart="handleAddToCart" />
        <Podcast :username="username" />
        <Blog :username="username" />
        <Media :username="username" @add-to-cart="handleAddToCart" />
        <Social />

        <footer class="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm">
          © {{ new Date().getFullYear() }} {{ profile?.name || 'Creator' }} Profile. All rights reserved.
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { ShoppingBasket, User } from 'lucide-vue-next'
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
  { id: 'blog', label: 'Blog' },
  { id: 'media', label: 'Assets' },
  { id: 'socials', label: 'Socials' },
])

const cartCount = ref(0)

const handleAddToCart = () => {
  cartCount.value += 1
}

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

