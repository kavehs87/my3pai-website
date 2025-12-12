<template>
  <section id="podcast" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Audio</span>
          <span class="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
            <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> On Air
          </span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">WanderLuxe Audio</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Travel stories, tips, and interviews on the go. Listen to the latest episodes to get inspired for your next adventure.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-indigo-500" /> Exclusive Interviews
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-indigo-500" /> Weekly Episodes
          </span>
        </div>
      </div>
      <button
        @click="handleViewAll"
        class="shrink-0 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all flex items-center gap-2"
      >
        View Full Library <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Loading episodes...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchEpisodes"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Episodes List -->
    <div v-else-if="displayedEpisodes.length > 0" class="grid grid-cols-1 gap-3">
      <div
        v-for="(episode, index) in displayedEpisodes"
        :key="episode.id"
        class="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
        @click="handleEpisodeClick(episode)"
      >
        <div class="text-slate-400 font-mono text-xs w-4">{{ (index + 1).toString().padStart(2, '0') }}</div>

        <div class="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-slate-200">
          <img
            :src="getEpisodeImage(episode)"
            :alt="episode.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            @error="handleImageError"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play class="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        <div class="flex-grow min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{{ episode.title }}</h3>
            <Lock v-if="isPremium(episode)" class="w-3 h-3 text-amber-500" />
          </div>
          <p class="text-xs text-slate-500 line-clamp-1">{{ episode.description || episode.summary }}</p>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <div class="hidden sm:flex items-center gap-1 opacity-50">
            <div class="w-0.5 h-3 bg-slate-400 rounded-full group-hover:bg-indigo-500 group-hover:h-4 transition-all"></div>
            <div class="w-0.5 h-5 bg-slate-400 rounded-full group-hover:bg-indigo-500 group-hover:h-6 transition-all"></div>
            <div class="w-0.5 h-2 bg-slate-400 rounded-full group-hover:bg-indigo-500 group-hover:h-3 transition-all"></div>
          </div>
          <span class="text-xs font-mono text-slate-400">{{ formatDuration(episode.duration || episode.duration_seconds) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-slate-400">
      <Mic class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No podcast episodes available yet.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  ArrowUpRight,
  Play,
  Lock,
  Mic,
} from 'lucide-vue-next'
import apiService from '@/services/api'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 5, // Show first 5 episodes in section
  },
})

const emit = defineEmits(['view-all', 'episode-click'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.username || username?.value || router.currentRoute.value.params.username)

// State
const episodes = ref([])
const loading = ref(false)
const error = ref(null)

// Computed
const displayedEpisodes = computed(() => {
  if (props.limit && props.limit > 0) {
    return episodes.value.slice(0, props.limit)
  }
  return episodes.value
})

// Methods
const fetchEpisodes = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null
  try {
    const result = await apiService.getInfluencerPodcastEpisodes(currentUsername.value, {
      per_page: props.limit || 5,
    })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      const episodesData = Array.isArray(data) ? data : data?.episodes || data?.data || []
      episodes.value = episodesData
    } else {
      error.value = result.error || 'Failed to load episodes.'
    }
  } catch (err) {
    console.error('Error fetching episodes:', err)
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const getEpisodeImage = (episode) => {
  return episode.image ||
         episode.thumbnail ||
         episode.cover_image ||
         '/media-placeholder.jpg'
}

const isPremium = (episode) => {
  return episode.isPremium ||
         episode.is_premium ||
         episode.isPremiumContent ||
         false
}

const formatDuration = (duration) => {
  if (!duration) return '--:--'
  if (typeof duration === 'number') {
    // Assume it's in seconds
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  if (typeof duration === 'string') {
    // Check if it's already formatted (e.g., "5:30")
    if (duration.includes(':')) {
      return duration
    }
    // Try to parse as number
    const parsed = parseInt(duration)
    if (!isNaN(parsed)) {
      const mins = Math.floor(parsed / 60)
      const secs = parsed % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return duration
  }
  return '--:--'
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

const handleEpisodeClick = (episode) => {
  emit('episode-click', episode)
  // Navigate to podcasts view or play episode
  if (currentUsername.value) {
    router.push({ name: 'influencer-podcasts', params: { username: currentUsername.value } })
  }
}

const handleViewAll = () => {
  emit('view-all')
  if (currentUsername.value) {
    router.push({ name: 'influencer-podcasts', params: { username: currentUsername.value } })
  }
}

onMounted(() => {
  fetchEpisodes()
})
</script>

