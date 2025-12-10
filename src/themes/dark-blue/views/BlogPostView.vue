<template>
  <article class="pt-28 pb-20 bg-surface min-h-screen">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <button
        @click="router.push({ name: 'influencer-blog', params: { username: route.params.username } })"
        class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors font-medium"
      >
        <ArrowLeft class="w-5 h-5" /> Back to Articles
      </button>

      <div v-if="post" class="flex items-center gap-4 text-sm text-text-muted mb-4">
        <span
          v-if="post.category"
          class="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide"
        >
          {{ post.category }}
        </span>
        <div v-if="post.readTime" class="flex items-center gap-1">
          <Clock3 class="w-4 h-4" /> {{ post.readTime }} read
        </div>
        <span v-if="post.readTime && post.date">•</span>
        <span v-if="post.date">{{ post.date }}</span>
      </div>

      <h1 v-if="post" class="text-3xl md:text-5xl font-extrabold text-primary leading-tight mb-8">
        {{ post.title }}
      </h1>
    </div>

    <div v-if="post?.image" class="w-full h-[300px] md:h-[500px] mb-12 relative">
      <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/20"></div>
      <div
        v-if="post.isPremium"
        class="absolute top-8 right-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
      >
        <Star class="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span class="font-bold text-primary text-sm">Premium Content</span>
      </div>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
      <div v-if="loading" class="text-center py-12 text-text-muted">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading article...</p>
      </div>

      <div v-else-if="error && !post" class="text-center py-12 text-text-muted">
        <p class="text-lg mb-4">{{ error }}</p>
        <button @click="router.push({ name: 'influencer-blog', params: { username: currentUsername } })" class="text-secondary hover:underline">
          Back to Articles
        </button>
      </div>

      <div v-else-if="post" class="relative">
        <!-- Content -->
        <div
          v-if="post.content || post.body"
          class="text-slate-700 rich-text"
          :class="[
            'prose prose-lg prose-slate max-w-none',
            'prose-headings:text-primary prose-headings:font-bold',
            'prose-p:text-slate-700 prose-p:leading-relaxed',
            'prose-a:text-secondary prose-a:font-medium hover:prose-a:text-secondary/80',
            'prose-strong:text-slate-900 prose-strong:font-bold',
            'prose-ul:text-slate-700 prose-li:marker:text-secondary',
            'prose-img:rounded-2xl prose-img:shadow-lg',
            (post.isPremium && post.isLocked) ? 'mask-image-gradient pb-8' : ''
          ]"
          :style="{
            maskImage: (post.isPremium && post.isLocked) ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none',
            WebkitMaskImage: (post.isPremium && post.isLocked) ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none'
          }"
          v-html="post.content || post.body || ''"
        />
        
        <div v-else class="text-center py-12 text-text-muted">
          <p class="text-lg mb-4">Content not available.</p>
          <p v-if="post.isPremium && post.isLocked" class="text-sm">This is premium content that requires purchase.</p>
        </div>

        <!-- Premium Lock Overlay -->
        <div
          v-if="post.isPremium && (post.isLocked || !post.content)"
          class="absolute inset-x-0 bottom-0 top-1/3 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-surface via-surface/90 to-transparent pointer-events-none"
        >
          <div class="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-sm mx-4 pointer-events-auto transform transition-transform hover:scale-105 duration-300">
            <div class="w-16 h-16 bg-gradient-to-br from-secondary to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-secondary/20 rotate-3">
              <Lock class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-primary mb-3">Unlock Full Story</h3>
            <p class="text-slate-500 mb-8 leading-relaxed">
              This detailed guide is part of our premium travel collection. Unlock it now to read the full itinerary and see the hidden spots.
            </p>
            <button class="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group">
              <Unlock class="w-4 h-4 group-hover:scale-110 transition-transform" />
              Unlock for <PriceDisplay :amount="5" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="post?.tags && post.tags.length > 0" class="mt-16 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag class="w-4 h-4" /> Related Topics
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-secondary hover:text-white hover:border-secondary transition-colors cursor-pointer shadow-sm"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ArrowLeft, Clock3, Star, Lock, Unlock, Tag } from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import api from '@/services/api'
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    default: null,
  },
  slug: {
    type: String,
    default: null,
  },
})

const route = useRoute()
const router = useRouter()

const username = inject('influencerUsername', null)
const currentUsername = computed(() => route.params.username || props.post?.username || username?.value)

const post = ref(props.post || null)
const loading = ref(false)
const error = ref(null)

const fetchPost = async () => {
  // Get slug from route params first, then props
  const slug = route.params.slug || props.post?.slug || props.slug
  if (!currentUsername.value || !slug) {
    error.value = 'Missing username or post slug.'
    return
  }

  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerBlogPost(currentUsername.value, slug)
    
    // Check if we have data (either from success or from 402 response with data)
    let postData = null
    if (result.success && result.data) {
      postData = result.data
    } else if (result.status === 402 && result.data) {
      // 402 responses should still include post data according to API spec
      postData = result.data
    }
    
    if (postData) {
      // Unwrap nested data structure
      let data = postData
      if (data?.data) data = data.data
      
      // Map API response to component expectations
      post.value = {
        ...data,
        image: data.coverImage || data.image || '/media-placeholder.jpg',
        date: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : data.date,
        coverImage: data.coverImage || data.image,
        publishedAt: data.publishedAt || data.date,
        content: data.content || data.body || '',
        body: data.body || data.content || '',
        // Mark as locked if it's a 402 response or if isLocked is true
        isLocked: result.status === 402 || data.isLocked || false,
        isPremium: data.isPremium || result.status === 402 || false
      }
      
      // Log for debugging
      console.log('Blog post loaded:', {
        hasContent: !!post.value.content,
        contentLength: post.value.content?.length || 0,
        isPremium: post.value.isPremium,
        isLocked: post.value.isLocked,
        hasImage: !!post.value.image,
        hasTitle: !!post.value.title
      })
      
      // Set error message for locked content but don't block rendering
      if (result.status === 402 || post.value.isLocked) {
        error.value = null // Don't show error, show the lock overlay instead
      }
    } else {
      // No data at all - this is a real error
      error.value = result.error || 'Failed to load blog post.'
      
      // Fallback to props.post if available
      if (props.post) {
        post.value = {
          ...props.post,
          image: props.post.coverImage || props.post.image || '/media-placeholder.jpg',
          isLocked: true
        }
      }
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
    // Fallback to props.post if available
    if (props.post) {
      post.value = {
        ...props.post,
        image: props.post.coverImage || props.post.image || '/media-placeholder.jpg'
      }
    }
  } finally {
    loading.value = false
  }
}

// Watch for route changes to refetch post when slug changes
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    fetchPost()
  }
}, { immediate: false })

onMounted(() => {
  // Always fetch post on mount, even if we have props.post
  // This ensures we have the latest data and handle premium content correctly
  fetchPost()
})
</script>

