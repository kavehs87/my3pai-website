<template>
  <section
    id="podcast"
    class="bg-white rounded-lg p-6 border-2 border-blue-400 space-y-6"
  >
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b-2 border-blue-200 pb-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-lg bg-blue-500 border-2 border-blue-600 flex items-center justify-center">
          <Headphones class="w-8 h-8 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-300">New Episodes</span>
            <span v-if="episodes.length > 0" class="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <p class="text-gray-600 text-sm">Travel stories &amp; tips on the go.</p>
        </div>
      </div>
      <button class="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold border-2 border-blue-600 hover:bg-blue-600 transition-colors text-sm">
        <Mic class="w-4 h-4" />
        Subscribe
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-gray-500">
      <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
      <p>Loading episodes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="episodes.length === 0" class="py-12 text-center text-gray-500">
      <Headphones class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No episodes yet</p>
    </div>

    <!-- Episodes List -->
    <div v-else class="space-y-2">
      <article
        v-for="(episode, index) in episodes"
        :key="episode.id"
        class="group flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50 transition-all cursor-pointer border-2 border-blue-200 hover:border-blue-400"
        @click="playEpisode(episode)"
      >
        <div class="text-blue-600 font-mono text-xs w-4 font-bold">{{ (index + 1).toString().padStart(2, '0') }}</div>
        <div class="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border-2 border-blue-300 bg-blue-100">
          <img
            v-if="episode.coverImage || episode.image"
            :src="episode.coverImage || episode.image"
            :alt="episode.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Mic class="w-4 h-4 text-blue-500" />
          </div>
          <div class="absolute inset-0 flex items-center justify-center bg-blue-500/80 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play class="w-4 h-4 text-white fill-white" />
          </div>
        </div>
        <div class="flex-grow min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-blue-900 truncate">
              {{ episode.title }}
            </h3>
            <Lock v-if="episode.isPremium" class="w-3 h-3 text-yellow-600 shrink-0" />
          </div>
          <p class="text-xs text-gray-600 line-clamp-1">
            {{ episode.description }}
          </p>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <span class="text-xs font-mono text-gray-500 font-bold">{{ episode.duration || '--:--' }}</span>
        </div>
      </article>
    </div>

    <div v-if="hasMore" class="mt-8 flex justify-center">
      <button
        class="text-xs font-bold uppercase text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-2 border-2 border-blue-300 px-4 py-2 rounded-lg hover:border-blue-500"
        @click="loadMore"
      >
        View Full Library <BarChart3 class="w-3 h-3" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { Play, Lock, Mic, Headphones, BarChart3, Loader2 } from 'lucide-vue-next'
import api from '@/services/api'
import { PODCAST_EPISODES } from '@/shared/influencer/constants'

const props = defineProps({
  username: {
    type: String,
    default: null
  }
})

const episodes = ref([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const useMockData = ref(false)

// Try to get username from parent context if not passed as prop
const injectedUsername = inject('influencerUsername', null)

const getUsername = () => {
  return props.username || injectedUsername?.value || null
}

const loadEpisodes = async () => {
  const username = getUsername()
  
  if (!username) {
    // Fallback to mock data
    useMockData.value = true
    episodes.value = PODCAST_EPISODES
    return
  }

  loading.value = true
  try {
    const result = await api.getInfluencerPodcastEpisodes(username, {
      page: currentPage.value,
      per_page: 10
    })

    if (result.success && result.data?.data) {
      const newEpisodes = result.data.data
      if (currentPage.value === 1) {
        episodes.value = newEpisodes
      } else {
        episodes.value = [...episodes.value, ...newEpisodes]
      }
      hasMore.value = result.data.meta?.current_page < result.data.meta?.last_page
    } else {
      // Fallback to mock
      useMockData.value = true
      episodes.value = PODCAST_EPISODES
    }
  } catch (err) {
    console.error('[InfluencerPodcast] Error loading episodes:', err)
    useMockData.value = true
    episodes.value = PODCAST_EPISODES
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value) {
    currentPage.value++
    loadEpisodes()
  }
}

const playEpisode = (episode) => {
  if (episode.isPremium && episode.isLocked) {
    // Show premium prompt
    console.log('Premium episode - requires purchase:', episode.title)
    return
  }
  
  if (episode.audioUrl) {
    console.log('Playing episode:', episode.title, episode.audioUrl)
    // Could open an audio player modal or navigate to episode page
  }
}

onMounted(() => {
  loadEpisodes()
})
</script>
