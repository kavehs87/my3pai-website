<template>
  <section id="socials" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-pink-100 text-pink-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Community</span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Latest Socials</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Join my <span class="text-slate-900 font-medium">{{ followerCount }}+ followers</span> across platforms.
          Daily updates, behind-the-scenes content, and quick travel tips delivered straight to your feed.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-pink-500" /> Daily Stories
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-pink-500" /> Q&A Sessions
          </span>
        </div>
      </div>
      <button
        @click="handleFollowAll"
        class="shrink-0 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
      >
        Follow All <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Loading social posts...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchPosts"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Social Posts -->
    <div v-else-if="socialPosts.length > 0" class="space-y-8">
      <!-- YouTube Videos (Landscape) -->
      <div v-if="youtubePosts.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <div class="p-1.5 bg-red-50 rounded-lg">
            <Youtube class="w-4 h-4 text-red-600" />
          </div>
          <h3 class="font-bold text-slate-800">Latest on YouTube</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="video in youtubePosts.slice(0, 4)"
            :key="video.id"
            class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-video border border-slate-100"
            @click="openSocial(video)"
          >
            <img
              :src="getPostImage(video)"
              :alt="video.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              @error="handleImageError"
            />

            <!-- Play Button Overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                <Play class="w-5 h-5 fill-white ml-1" />
              </div>
            </div>

            <!-- Duration Badge -->
            <div
              v-if="video.duration"
              class="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded"
            >
              {{ video.duration }}
            </div>

            <!-- Title Overlay -->
            <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <h4 class="text-white font-bold text-sm line-clamp-1 text-shadow">{{ video.title }}</h4>
              <span class="text-white/80 text-xs">{{ formatViews(video.views || video.view_count) }} views</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reels & Shorts (Portrait/Vertical) -->
      <div v-if="shortFormPosts.length > 0">
        <div class="flex items-center gap-2 mb-4">
          <div class="p-1.5 bg-pink-50 rounded-lg">
            <Instagram class="w-4 h-4 text-pink-500" />
          </div>
          <h3 class="font-bold text-slate-800">Reels & TikToks</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="post in shortFormPosts.slice(0, 8)"
            :key="post.id"
            class="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-[9/16] border border-slate-100"
            @click="openSocial(post)"
          >
            <img
              :src="getPostImage(post)"
              :alt="post.caption || post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              @error="handleImageError"
            />

            <!-- Platform Badge -->
            <div class="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
              <component :is="getPlatformIcon(post.platform || post.type)" class="w-4 h-4" />
            </div>

            <!-- Stats & Caption -->
            <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
              <div class="flex items-center gap-1.5 text-white/90 text-xs font-medium mb-1">
                <Play class="w-3 h-3 fill-white" />
                <span>{{ formatViews(post.views || post.view_count) }}</span>
              </div>
              <p class="text-white font-bold text-xs line-clamp-2 leading-tight">{{ post.caption || post.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-slate-400">
      <Share2 class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No social posts available yet.</p>
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
  Youtube,
  Instagram,
  Music2,
  Facebook,
  Share2,
} from 'lucide-vue-next'
import apiService from '@/services/api'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 12, // Show first 12 posts in section
  },
})

const emit = defineEmits(['follow-all'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.username || username?.value || router.currentRoute.value.params.username)

// State
const socialPosts = ref([])
const loading = ref(false)
const error = ref(null)

// Computed
const youtubePosts = computed(() => {
  return socialPosts.value.filter(
    (post) => post.type === 'youtube' || post.platform === 'YouTube' || post.platform === 'youtube'
  )
})

const shortFormPosts = computed(() => {
  return socialPosts.value.filter(
    (post) =>
      post.type === 'reel' ||
      post.type === 'short' ||
      post.platform === 'Instagram' ||
      post.platform === 'TikTok' ||
      post.platform === 'instagram' ||
      post.platform === 'tiktok'
  )
})

const followerCount = computed(() => {
  // Could come from profile stats
  return 150 // Default, would be from API
})

// Methods
const fetchPosts = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null
  try {
    const result = await apiService.getInfluencerSocialPostsPublic(currentUsername.value, {
      per_page: props.limit || 12,
    })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      const postsData = Array.isArray(data) ? data : data?.posts || data?.data || []
      socialPosts.value = postsData
    } else {
      error.value = result.error || 'Failed to load social posts.'
    }
  } catch (err) {
    console.error('Error fetching social posts:', err)
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const getPostImage = (post) => {
  return post.thumbnail ||
         post.image ||
         post.cover_image ||
         '/media-placeholder.jpg'
}

const getPlatformIcon = (platform) => {
  const platformLower = platform?.toLowerCase() || ''
  if (platformLower.includes('youtube')) return Youtube
  if (platformLower.includes('instagram')) return Instagram
  if (platformLower.includes('tiktok')) return Music2
  if (platformLower.includes('facebook')) return Facebook
  return Instagram // Default
}

const formatViews = (views) => {
  if (!views) return '0'
  const num = typeof views === 'number' ? views : parseInt(views)
  if (isNaN(num)) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

const openSocial = (post) => {
  if (post.url) {
    window.open(post.url, '_blank', 'noopener,noreferrer')
  }
}

const handleFollowAll = () => {
  emit('follow-all')
  // Could open social links modal or navigate to social links page
}

onMounted(() => {
  fetchPosts()
})
</script>

