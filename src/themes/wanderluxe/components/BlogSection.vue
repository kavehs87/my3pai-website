<template>
  <section id="blog" class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
    <div class="flex flex-col md:flex-row justify-between gap-6 md:items-end">
      <div class="max-w-xl">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">Journal</span>
        </div>
        <h2 class="text-3xl font-bold text-slate-900 mb-3">Travel Journal</h2>
        <p class="text-slate-500 text-base leading-relaxed">
          Deep dives into itineraries, gear reviews, and local secrets. Read about my latest adventures and learn how to travel smarter.
        </p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-amber-500" /> In-depth Guides
          </span>
          <span class="flex items-center gap-1">
            <Check class="w-3 h-3 text-amber-500" /> Honest Reviews
          </span>
        </div>
      </div>
      <button
        @click="handleViewAll"
        class="shrink-0 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all flex items-center gap-2"
      >
        Read All Entries <ArrowUpRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-medium">Loading posts...</p>
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

    <!-- Posts List -->
    <div v-else-if="displayedPosts.length > 0" class="space-y-0">
      <article
        v-for="(post, index) in displayedPosts"
        :key="post.id"
        @click="handlePostClick(post)"
        class="group cursor-pointer py-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start hover:bg-slate-50/80 -mx-4 px-4 rounded-xl transition-colors relative"
      >
        <div class="w-12 shrink-0 hidden md:block pt-1">
          <span class="text-xs font-mono text-slate-400">{{ (index + 1).toString().padStart(2, '0') }}</span>
        </div>

        <div class="flex-grow">
          <div class="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">
            <span>{{ formatDate(post.publishedAt || post.date) }}</span>
            <span
              v-if="isPremium(post)"
              class="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"
            >
              Premium
            </span>
            <span
              v-if="post.category"
              class="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
            >
              {{ post.category }}
            </span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors leading-tight">
            {{ post.title }}
          </h3>
          <p class="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
            {{ post.preview || post.excerpt || post.description }}
          </p>
        </div>

        <div class="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 bg-white">
            <ArrowRight class="w-4 h-4" />
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-slate-400">
      <BookOpen class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="text-lg font-medium">No blog posts available yet.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
} from 'lucide-vue-next'
import apiService from '@/services/api'

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
  limit: {
    type: Number,
    default: 5, // Show first 5 posts in section
  },
})

const emit = defineEmits(['view-all', 'post-click'])

const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.username || username?.value || router.currentRoute.value.params.username)

// State
const posts = ref([])
const loading = ref(false)
const error = ref(null)

// Computed
const displayedPosts = computed(() => {
  if (props.limit && props.limit > 0) {
    return posts.value.slice(0, props.limit)
  }
  return posts.value
})

// Methods
const fetchPosts = async () => {
  if (!currentUsername.value) return

  loading.value = true
  error.value = null
  try {
    const result = await apiService.getInfluencerBlogPosts(currentUsername.value, {
      per_page: props.limit || 5,
    })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      const postsData = Array.isArray(data) ? data : data?.posts || data?.data || []
      posts.value = postsData.map((post) => ({
        ...post,
        image: post.coverImage || post.image,
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : post.date,
      }))
    } else {
      error.value = result.error || 'Failed to load posts.'
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return dateString
  }
}

const isPremium = (post) => {
  return post.isPremium ||
         post.is_premium ||
         post.isPremiumContent ||
         false
}

const handlePostClick = (post) => {
  emit('post-click', post)
  if (currentUsername.value && post.slug) {
    router.push({
      name: 'influencer-blog-post',
      params: { username: currentUsername.value, slug: post.slug },
    })
  } else if (currentUsername.value) {
    router.push({ name: 'influencer-blog', params: { username: currentUsername.value } })
  }
}

const handleViewAll = () => {
  emit('view-all')
  if (currentUsername.value) {
    router.push({ name: 'influencer-blog', params: { username: currentUsername.value } })
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

