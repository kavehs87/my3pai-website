<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto">
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <h1 class="text-3xl font-bold text-slate-900 mb-8">WanderLuxe Audio</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading podcasts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchPodcasts"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Episodes List -->
    <div v-else-if="podcasts.length > 0" class="max-w-4xl mx-auto space-y-6">
      <PodcastPlayer
        v-for="pod in podcasts"
        :key="pod.id"
        :podcast="pod"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-slate-400">
      <Mic class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No podcast episodes available yet.</p>
    </div>

    <!-- Spotify/Apple Podcasts Links -->
    <div v-if="spotifyUrl || applePodcastUrl" class="flex justify-center gap-4 mt-12">
      <a
        v-if="spotifyUrl"
        :href="spotifyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
      >
        <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-black" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.38-1.38 9.841-.721 13.441 1.5.419.3.6.84.3 1.32zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
        Listen on Spotify
      </a>
      <a
        v-if="applePodcastUrl"
        :href="applePodcastUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors"
      >
        <Headphones class="w-5 h-5" />
        Apple Podcasts
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Mic, Headphones } from 'lucide-vue-next'
import PodcastPlayer from '../components/PodcastPlayer.vue'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const podcasts = ref([])
const podcastTitle = ref(null)
const podcastDescription = ref(null)
const applePodcastUrl = ref(null)
const spotifyUrl = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDuration = (duration) => {
  if (!duration) return '0:00'
  
  // If it's already formatted (e.g., "1:23:45" or "23:45")
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration
  }
  
  // If it's in seconds (number)
  const seconds = typeof duration === 'number' ? duration : parseInt(duration) || 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const fetchPodcasts = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null

  try {
    const result = await apiService.getInfluencerPodcastEpisodes(currentUsername.value)

    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data

      // Extract podcast title, description, and episodes from response
      if (data?.podcastTitle !== undefined) {
        podcastTitle.value = data.podcastTitle
      }

      if (data?.podcastDescription !== undefined) {
        podcastDescription.value = data.podcastDescription
      }

      if (data?.applePodcastUrl !== undefined) {
        applePodcastUrl.value = data.applePodcastUrl
      }

      if (data?.spotifyUrl !== undefined) {
        spotifyUrl.value = data.spotifyUrl
      }

      // Handle episodes array - check for nested structure
      let episodes = []
      if (data?.episodes && Array.isArray(data.episodes)) {
        episodes = data.episodes
      } else if (Array.isArray(data)) {
        episodes = data
      } else if (data?.data && Array.isArray(data.data)) {
        episodes = data.data
      }

      // Map API response fields to component expectations
      podcasts.value = episodes.map((episode) => ({
        ...episode,
        image: episode.coverImage || episode.image || episode.cover_image || '/media-placeholder.jpg',
        coverImage: episode.coverImage || episode.image || episode.cover_image,
        date: episode.publishedAt
          ? new Date(episode.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : episode.date,
        publishedAt: episode.publishedAt || episode.date,
        isPremium: episode.isPremium || episode.is_premium || false,
        slug: episode.slug || episode.id?.toString(),
        duration: formatDuration(episode.duration || episode.duration_seconds),
      }))
    } else {
      error.value = result.error || 'Failed to load podcasts.'
      podcasts.value = []
    }
  } catch (err) {
    console.error('Error fetching podcasts:', err)
    error.value = err.message || 'An unexpected error occurred.'
    podcasts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPodcasts()
})
</script>

