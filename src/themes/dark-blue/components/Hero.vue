<template>
  <section id="profile" class="scroll-mt-28 pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden relative">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div class="lg:col-span-6 flex flex-col sm:flex-row gap-8 items-center sm:items-start min-w-0 overflow-hidden">
          <!-- Portrait Video -->
          <div class="w-full sm:w-[320px] shrink-0 flex-shrink-0">
            <div class="bg-white p-1 rounded-[2.5rem] shadow-xl shadow-primary/5 border border-slate-100">
              <div class="relative aspect-[9/16] rounded-[2rem] overflow-hidden group cursor-pointer">
                <img
                  :src="profile?.introVideoThumbnail || profile?.image || 'https://picsum.photos/seed/travel/340/600'"
                  alt="Intro"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <div class="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform">
                    <Play class="w-6 h-6 text-primary fill-primary" />
                  </div>
                </div>
                <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span class="text-white text-xs font-medium">Watch Intro</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vertical Stats -->
          <div class="flex flex-row sm:flex-col flex-wrap gap-4 sm:gap-8 w-full min-w-0 flex-1">
            <div
              v-for="(stat, i) in stats"
              :key="i"
              class="bg-white p-4 rounded-2xl shadow-md border border-slate-50 flex items-center gap-8 sm:w-full hover:-translate-y-1 transition-transform flex-1 sm:flex-none min-w-0"
            >
              <div :class="['p-3 rounded-xl', stat.bg, stat.color, 'flex-shrink-0']">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <div class="text-left min-w-0">
                <div class="text-2xl font-bold text-primary leading-none">{{ stat.value }}</div>
                <div class="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 truncate">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 flex flex-col justify-center h-full min-w-0">
          <div class="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-fit mb-6">
            <CheckCircle2 class="w-5 h-5 text-secondary" />
            <span class="text-sm font-semibold text-primary">Verified Travel Expert</span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-4">
            {{ profile?.name || 'Creator' }}
          </h1>
          <p v-if="profile?.tagline" class="text-xl text-secondary font-medium mb-6">{{ profile.tagline }}</p>
          <p class="text-text-muted leading-relaxed mb-8 text-lg">
            {{ profile?.bio || bioText }}
          </p>

          <div class="flex flex-wrap gap-4 mb-8">
            <a
              v-for="(social, i) in socialLinks"
              :key="i"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-slate-100"
            >
              <component :is="social.icon" class="w-5 h-5" />
            </a>
          </div>

          <button
            @click="$emit('book-click')"
            class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            Book a Consultation
            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  Play,
  Star,
  Globe,
  Map,
  Users,
  CheckCircle2,
  ArrowRight,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Link2,
  Video,
} from 'lucide-vue-next'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['book-click'])

const stats = computed(() => {
  const stats = props.profile?.stats || {}
  return [
    {
      label: 'Rating',
      value: stats.rating || 4.9,
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Visited',
      value: stats.locations || stats.locationsVisited || 0,
      icon: Globe,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Maps',
      value: stats.mapsBuilt || 0,
      icon: Map,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Guided',
      value: stats.travelersGuided ? `${Math.floor(stats.travelersGuided / 1000)}k+` : '12k+',
      icon: Users,
      color: 'text-secondary',
      bg: 'bg-teal-50',
    },
    {
      label: 'Consultings',
      value: stats.consultations || stats.consultationsCount || 0,
      icon: Video,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ]
})

const bioText = computed(() => {
  if (props.bioParagraphs && props.bioParagraphs.length > 0) {
    return props.bioParagraphs[0] || ''
  }
  return props.profile?.bio || "I'm a travel filmmaker dedicated to helping you plan the perfect trip."
})

const socialLinks = computed(() => {
  // Get social links from profile - the field is 'socials' (array of {platform, url, handle})
  const profileSocials = props.profile?.socials || []
  
  // Only show icons if we have social links data
  if (!Array.isArray(profileSocials) || profileSocials.length === 0) {
    return []
  }

  // Map profile social links to icons
  const iconMap = {
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    linkedin: Linkedin,
    tiktok: Link2, // TikTok - using Link2 as generic icon since lucide doesn't have TikTok
    other: Link2, // Other - using Link2 as generic link icon
  }

  // Map all social links to icons (use Link2 for unknown platforms)
  return profileSocials
    .filter((s) => s.url) // Only include links with URLs
    .map((s) => {
      const platform = s.platform?.toLowerCase()
      return {
        platform: platform || 'other',
        icon: iconMap[platform] || iconMap.other || Link2,
        url: s.url,
      }
    })
})
</script>

