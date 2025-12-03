<template>
  <section id="socials" class="space-y-8">
    <div class="flex items-center gap-2">
      <h2 class="text-2xl font-bold text-blue-900">Latest from Socials</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading social posts...</p>
    </div>

    <!-- YouTube Videos -->
    <div v-if="!loading && youtubeVideos.length > 0">
      <div class="flex items-center gap-2 mb-4">
        <Youtube class="w-5 h-5 text-red-600" />
        <h3 class="font-bold text-lg text-blue-900">Latest on YouTube</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article
          v-for="video in youtubeVideos"
          :key="video.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-video"
          @click="openVideo(video.url)"
        >
          <img 
            :src="video.thumbnail || '/media-placeholder.jpg'" 
            :alt="video.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          />
          <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Play class="w-5 h-5 fill-white ml-1" />
            </div>
          </div>
          <div v-if="video.duration" class="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
            {{ video.duration }}
          </div>
          <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h4 class="text-white font-bold text-sm md:text-base line-clamp-1">{{ video.title }}</h4>
            <span v-if="video.views" class="text-white/80 text-xs">{{ video.views }} views</span>
          </div>
        </article>
      </div>
    </div>

    <!-- Short-Form Content -->
    <div v-if="!loading && shortFormContent.length > 0">
      <div class="flex items-center gap-2 mb-4">
        <Instagram class="w-5 h-5 text-pink-500" />
        <h3 class="font-bold text-lg text-blue-900">Reels &amp; TikToks</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <article
          v-for="post in shortFormContent"
          :key="post.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-[9/16]"
          @click="openPost(post.url)"
        >
          <img 
            :src="post.thumbnail || '/media-placeholder.jpg'" 
            :alt="post.caption || post.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="handleImageError"
          />
          <div class="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <component :is="getPlatformIcon(post.platform)" class="w-4 h-4" />
          </div>
          <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
            <div v-if="post.views" class="flex items-center gap-1.5 text-white/90 text-xs font-medium mb-1">
              <Play class="w-3 h-3 fill-white" />
              <span>{{ post.views }}</span>
            </div>
            <p v-if="post.caption" class="text-white font-bold text-xs line-clamp-2">
              {{ post.caption }}
            </p>
            <p v-else-if="post.title" class="text-white font-bold text-xs line-clamp-2">
              {{ post.title }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && youtubeVideos.length === 0 && shortFormContent.length === 0" class="text-center py-12 text-slate-500">
      <p>No social posts available yet.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { Youtube, Instagram, Facebook, Play, Music2 } from 'lucide-vue-next'
import api from '@/services/api'
import { YOUTUBE_VIDEOS, SHORT_FORM_CONTENT } from '@/shared/influencer/constants'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
})

// Get username from inject if not provided as prop
const influencerUsername = inject('influencerUsername', null)
const currentUsername = computed(() => {
  if (props.username) return props.username
  if (influencerUsername?.value) return influencerUsername.value
  return null
})

const loading = ref(false)
const socialPosts = ref({
  youtube_videos: [],
  short_form_content: [],
})
const useMockData = ref(false)

const platformIcons = {
  YouTube: Youtube,
  Instagram,
  TikTok: Music2,
  Facebook,
  'YouTube Shorts': Youtube,
}

const getPlatformIcon = (platform) => platformIcons[platform] || Instagram

const youtubeVideos = computed(() => {
  return socialPosts.value.youtube_videos || []
})

const shortFormContent = computed(() => {
  return socialPosts.value.short_form_content || []
})

const loadSocialPosts = async () => {
  if (!currentUsername.value) {
    // Fallback to mock data if no username
    socialPosts.value = {
      youtube_videos: YOUTUBE_VIDEOS,
      short_form_content: SHORT_FORM_CONTENT,
    }
    useMockData.value = true
    return
  }

  loading.value = true

  try {
    const result = await api.getInfluencerSocialPostsPublic(currentUsername.value)

    if (result.success && result.data) {
      socialPosts.value = {
        youtube_videos: result.data.youtube_videos || [],
        short_form_content: result.data.short_form_content || [],
      }
      useMockData.value = false
    } else {
      // Fallback to mock data
      console.warn('[InfluencerSocial] API failed, using mock data:', result.error)
      socialPosts.value = {
        youtube_videos: YOUTUBE_VIDEOS,
        short_form_content: SHORT_FORM_CONTENT,
      }
      useMockData.value = true
    }
  } catch (err) {
    console.error('[InfluencerSocial] Error fetching social posts:', err)
    // Fallback to mock data
    socialPosts.value = {
      youtube_videos: YOUTUBE_VIDEOS,
      short_form_content: SHORT_FORM_CONTENT,
    }
    useMockData.value = true
  } finally {
    loading.value = false
  }
}

const openVideo = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const openPost = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleImageError = (event) => {
  if (event.target.src !== '/media-placeholder.jpg' && !event.target.src.includes('media-placeholder')) {
    event.target.src = '/media-placeholder.jpg'
  }
}

onMounted(() => {
  loadSocialPosts()
})
</script>

