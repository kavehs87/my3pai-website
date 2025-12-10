<template>
  <div class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface">
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" /> Back to Profile
    </button>

    <SectionHeader
      title="Latest from Socials"
      subtitle="Catch up on my latest videos, shorts, and reels."
      :icon="Share2"
    />

    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading social posts...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-text-muted">
      <p>{{ error }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(social, index) in socialPosts"
        :key="social.id"
        :class="[
          'group cursor-pointer rounded-2xl overflow-hidden relative',
          social.type === 'youtube' ? 'aspect-video lg:col-span-2' : 'aspect-[9/16]'
        ]"
        @click="openSocial(social)"
      >
        <img
          :src="social.thumbnail || '/media-placeholder.jpg'"
          :alt="social.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          @error="handleImageError"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
            <Play class="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        <div class="absolute top-4 left-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Youtube v-if="social.type === 'youtube'" class="w-3 h-3" />
          <Instagram v-else-if="social.type === 'reel'" class="w-3 h-3" />
          <svg
            v-else-if="social.type === 'short'"
            viewBox="0 0 24 24"
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {{ social.type }}
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6">
          <h3 class="text-white font-bold text-lg mb-1 line-clamp-2">{{ social.title }}</h3>
          <p class="text-white/70 text-sm">{{ social.views }} views</p>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && socialPosts.length === 0" class="text-center py-20 text-text-muted">
      <p class="text-lg">No social posts available yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Share2, Play, Youtube, Instagram } from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const socialPosts = ref([])
const loading = ref(false)
const error = ref(null)

const openSocial = (social) => {
  if (social.url) {
    window.open(social.url, '_blank', 'noopener,noreferrer')
  }
}

const handleImageError = (e) => {
  e.target.src = '/media-placeholder.jpg'
}

const fetchSocialPosts = async () => {
  if (!currentUsername.value) return
  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerSocialPostsPublic(currentUsername.value)
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      socialPosts.value = Array.isArray(data) ? data : data?.data || []
    } else {
      error.value = result.error || 'Failed to load social posts.'
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSocialPosts()
})
</script>

