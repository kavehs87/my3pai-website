<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto">
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <h1 class="text-3xl font-bold text-slate-900 mb-8">Travel Journal</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading blog posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 text-slate-500">
      <p>{{ error }}</p>
      <button
        @click="fetchBlogPosts"
        class="mt-4 text-sm font-semibold text-slate-900 hover:underline"
      >
        Try Again
      </button>
    </div>

    <!-- Blog Posts List -->
    <div v-else-if="blogPosts.length > 0" class="space-y-8">
      <article
        v-for="post in blogPosts"
        :key="post.id"
        class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row cursor-pointer hover:shadow-lg transition-all group"
        @click="handlePostClick(post)"
      >
        <div class="md:w-1/3 relative">
          <img
            :src="getPostImage(post)"
            :alt="post.title"
            class="w-full h-full object-cover min-h-[200px]"
            @error="handleImageError"
          />
          <div
            v-if="post.isPremium || post.is_premium"
            class="absolute top-4 left-4 bg-amber-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Lock class="w-3 h-3" /> Premium
          </div>
        </div>
        <div class="p-8 md:w-2/3 flex flex-col justify-center">
          <div class="flex items-center gap-2 mb-2">
            <span
              v-if="post.category"
              class="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded"
            >
              {{ post.category }}
            </span>
            <span class="text-xs text-slate-400 font-medium">{{ formatDate(post) }}</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
            {{ post.title }}
          </h2>
          <p class="text-slate-500 line-clamp-2 mb-4">
            {{ post.preview || post.excerpt || post.description || '' }}
          </p>
          <span class="text-sm font-bold text-slate-900 flex items-center gap-2 underline decoration-slate-200 underline-offset-4">
            Read Article <ArrowRight class="w-4 h-4" />
          </span>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-slate-400">
      <FileText class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No blog posts available yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ArrowRight, Lock, FileText } from 'lucide-vue-next'
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const blogPosts = ref([])
const loading = ref(false)
const error = ref(null)

const getPostImage = (post) => {
  if (post.coverImage) return post.coverImage
  if (post.image) return post.image
  if (post.cover_image) return post.cover_image
  return '/media-placeholder.jpg'
}

const formatDate = (post) => {
  if (post.publishedAt) {
    return new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  if (post.published_at) {
    return new Date(post.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  if (post.date) {
    return post.date
  }
  return ''
}

const handleImageError = (e) => {
  e.target.src = '/media-placeholder.jpg'
}

const handlePostClick = (post) => {
  const slug = post.slug || post.id
  router.push({
    name: 'influencer-blog-post',
    params: {
      username: currentUsername.value,
      slug: slug,
    },
  })
}

const fetchBlogPosts = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null

  try {
    const result = await apiService.getInfluencerBlogPosts(currentUsername.value)

    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      const posts = Array.isArray(data) ? data : data?.data || []

      // Map API response to component expectations
      blogPosts.value = posts.map((post) => ({
        ...post,
        image: post.coverImage || post.image || post.cover_image || '/media-placeholder.jpg',
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : post.published_at
            ? new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : post.date,
        coverImage: post.coverImage || post.image || post.cover_image,
        publishedAt: post.publishedAt || post.published_at || post.date,
        preview: post.preview || post.excerpt || post.description || '',
        isPremium: post.isPremium || post.is_premium || false,
      }))
    } else {
      error.value = result.error || 'Failed to load blog posts.'
      blogPosts.value = []
    }
  } catch (err) {
    console.error('Error fetching blog posts:', err)
    error.value = err.message || 'An unexpected error occurred.'
    blogPosts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBlogPosts()
})
</script>

