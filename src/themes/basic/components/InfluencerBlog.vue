<template>
  <section id="blog" class="space-y-8">
    <div class="flex items-center justify-between border-b-2 border-blue-300 pb-4">
      <h2 class="text-2xl font-bold text-blue-900">Travel Blog</h2>
      <BookOpen class="w-5 h-5 text-blue-500" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 text-center text-gray-500">
      <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
      <p>Loading posts...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="py-12 text-center text-gray-500">
      <BookOpen class="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No blog posts yet</p>
    </div>

    <!-- Posts List -->
    <div v-else class="space-y-0">
      <article
        v-for="(post, index) in posts"
        :key="post.id"
        class="group cursor-pointer py-6 border-b-2 border-blue-200 flex flex-col md:flex-row gap-6 items-start hover:bg-blue-50 transition-colors relative"
        @click="openPost(post)"
      >
        <div class="w-12 shrink-0 hidden md:block pt-1">
          <span class="text-xs font-mono text-gray-500">{{ String(index + 1).padStart(2, '0') }}</span>
        </div>
        <div class="flex-grow">
          <div class="flex items-center gap-3 text-xs font-bold tracking-wider text-gray-500 mb-2 uppercase">
            <span>{{ formatDate(post.publishedAt) }}</span>
            <span v-if="post.readTime" class="text-gray-500">• {{ post.readTime }}</span>
            <span v-if="post.isPremium" class="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Lock class="w-3 h-3" /> Premium
            </span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors leading-tight">
            {{ post.title }}
          </h3>
          <p class="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
            {{ post.preview }}
          </p>
        </div>
        <div class="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <div class="w-10 h-10 rounded-full border border-blue-300 flex items-center justify-center text-blue-900">
            <ArrowRight class="w-4 h-4" />
          </div>
        </div>
      </article>
    </div>

    <button
      v-if="hasMore"
      class="text-sm font-bold text-gray-600 hover:text-blue-900 underline decoration-blue-300 underline-offset-4"
      @click="loadMore"
    >
      Read all entries
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { ArrowRight, BookOpen, Lock, Loader2 } from 'lucide-vue-next'
import api from '@/services/api'
import { BLOG_POSTS } from '@/shared/influencer/constants'

const props = defineProps({
  username: {
    type: String,
    default: null
  }
})

const posts = ref([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const useMockData = ref(false)

// Try to get username from parent context if not passed as prop
const injectedUsername = inject('influencerUsername', null)

const getUsername = () => {
  return props.username || injectedUsername?.value || null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const loadPosts = async () => {
  const username = getUsername()
  
  if (!username) {
    // Fallback to mock data
    useMockData.value = true
    posts.value = BLOG_POSTS.map((post, index) => ({
      ...post,
      publishedAt: post.date,
      readTime: '5 min read'
    }))
    return
  }

  loading.value = true
  try {
    const result = await api.getInfluencerBlogPosts(username, {
      page: currentPage.value,
      per_page: 10
    })

    if (result.success && result.data?.data) {
      const newPosts = result.data.data
      if (currentPage.value === 1) {
        posts.value = newPosts
      } else {
        posts.value = [...posts.value, ...newPosts]
      }
      hasMore.value = result.data.meta?.current_page < result.data.meta?.last_page
    } else {
      // Fallback to mock
      useMockData.value = true
      posts.value = BLOG_POSTS.map((post) => ({
        ...post,
        publishedAt: post.date,
        readTime: '5 min read'
      }))
    }
  } catch (err) {
    console.error('[InfluencerBlog] Error loading posts:', err)
    useMockData.value = true
    posts.value = BLOG_POSTS.map((post) => ({
      ...post,
      publishedAt: post.date,
      readTime: '5 min read'
    }))
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (hasMore.value) {
    currentPage.value++
    loadPosts()
  }
}

const openPost = (post) => {
  const username = getUsername()
  if (username && post.slug) {
    // Could navigate to a dedicated post page or open a modal
    console.log('Opening post:', post.slug)
    // this.$router.push(`/influencer/${username}/blog/${post.slug}`)
  }
}

onMounted(() => {
  loadPosts()
})
</script>

