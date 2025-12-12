<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto animate-fade-in">
    <!-- Navigation Buttons -->
    <div class="flex gap-4 mb-6">
      <button
        @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <ChevronLeft class="w-4 h-4" /> Home
      </button>
      <button
        @click="router.push({ name: 'influencer-blog', params: { username: currentUsername } })"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium border-l border-slate-300 pl-4 transition-colors"
      >
        Back to Blog
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-slate-500">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading article...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && !post" class="text-center py-12 text-slate-500">
      <p class="text-lg mb-4">{{ error }}</p>
      <button
        @click="router.push({ name: 'influencer-blog', params: { username: currentUsername } })"
        class="text-indigo-600 hover:underline font-medium"
      >
        Back to Articles
      </button>
    </div>

    <!-- Blog Post Content -->
    <div v-else-if="post" class="relative">
      <!-- Hero Image -->
      <div class="relative rounded-3xl overflow-hidden mb-8 h-64 md:h-96">
        <img
          :src="getPostImage(post)"
          :alt="post.title"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
          <div class="flex items-center gap-2 mb-2">
            <span
              v-if="post.category"
              class="text-sm font-bold opacity-80 uppercase tracking-wider"
            >
              {{ post.category }}
            </span>
            <span v-if="post.category && postDate" class="opacity-60">•</span>
            <span v-if="postDate" class="text-sm font-medium opacity-80">{{ postDate }}</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold">{{ post.title }}</h1>
        </div>
      </div>

      <!-- Content Area -->
      <div class="prose prose-slate lg:prose-lg mx-auto relative">
        <!-- Preview/Lead Text -->
        <p v-if="post.preview || post.excerpt || post.description" class="lead font-medium text-slate-600 text-lg mb-6">
          {{ post.preview || post.excerpt || post.description }}
        </p>

        <!-- Rich Text Content -->
        <div
          v-if="post.content || post.body"
          :class="[
            'rich-text',
            'prose prose-slate lg:prose-lg max-w-none',
            'prose-headings:text-slate-900 prose-headings:font-bold',
            'prose-p:text-slate-700 prose-p:leading-relaxed',
            'prose-a:text-indigo-600 prose-a:font-medium hover:prose-a:text-indigo-700',
            'prose-strong:text-slate-900 prose-strong:font-bold',
            'prose-ul:text-slate-700 prose-li:marker:text-indigo-600',
            'prose-img:rounded-2xl prose-img:shadow-lg',
            (post.isPremium && post.isLocked) ? 'mask-image-gradient pb-8' : ''
          ]"
          :style="{
            maskImage: (post.isPremium && post.isLocked) ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none',
            WebkitMaskImage: (post.isPremium && post.isLocked) ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none'
          }"
          v-html="post.content || post.body || ''"
        />

        <div v-else class="text-center py-12 text-slate-500">
          <p class="text-lg mb-4">Content not available.</p>
          <p v-if="post.isPremium && post.isLocked" class="text-sm">This is premium content that requires purchase.</p>
        </div>

        <!-- Premium Lock Overlay -->
        <div
          v-if="post.isPremium && (post.isLocked || !post.content)"
          class="my-12 p-8 bg-slate-900 rounded-3xl text-center text-white relative overflow-hidden"
        >
          <div class="relative z-10 flex flex-col items-center">
            <Lock class="w-12 h-12 mb-4 text-amber-400" />
            <h3 class="text-2xl font-bold mb-2">Unlock Full Article</h3>
            <p class="text-slate-300 mb-6 max-w-md mx-auto">
              This is premium content available for purchase. Get access to the full gear list including links and discount codes.
            </p>
            <button
              @click="handleUnlock"
              class="bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-900/20 flex items-center gap-2"
            >
              Unlock for <PriceDisplay :amount="post.price || 5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tags Section -->
      <div v-if="post.tags && post.tags.length > 0" class="mt-16 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Tag class="w-4 h-4" /> Related Topics
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors cursor-pointer shadow-sm"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Lock, Tag } from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import apiService from '@/services/api'
import toast from '@/utils/toast'
import eventBus from '@/utils/eventBus'

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

const emit = defineEmits(['add-to-cart'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => route.params.username || props.post?.username || username?.value)

const post = ref(props.post || null)
const loading = ref(false)
const error = ref(null)

const postDate = computed(() => {
  if (!post.value) return ''
  if (post.value.publishedAt) {
    return new Date(post.value.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  if (post.value.published_at) {
    return new Date(post.value.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return post.value.date || ''
})

const getPostImage = (post) => {
  if (post.coverImage) return post.coverImage
  if (post.image) return post.image
  if (post.cover_image) return post.cover_image
  return '/media-placeholder.jpg'
}

const handleImageError = (e) => {
  e.target.src = '/media-placeholder.jpg'
}

const handleUnlock = async () => {
  if (!post.value) return

  try {
    const result = await apiService.addCartItem({
      item_type: 'blog_post',
      item_id: post.value.id,
      quantity: 1,
    })

    if (result.success) {
      toast.success('Added to cart!')
      eventBus.emit('cart-updated')
      eventBus.emit('cart-item-added', {
        id: post.value.id,
        title: `Unlock: ${post.value.title}`,
        price: post.value.price || 5,
        type: 'Digital',
        image: getPostImage(post.value),
      })
      emit('add-to-cart', {
        id: post.value.id,
        title: `Unlock: ${post.value.title}`,
        price: post.value.price || 5,
        type: 'Digital',
        image: getPostImage(post.value),
      })
      // Navigate to checkout
      router.push({
        name: 'influencer-checkout',
        params: { username: currentUsername.value },
      })
    } else {
      toast.error(result.error || 'Failed to add to cart')
    }
  } catch (err) {
    console.error('Error adding to cart:', err)
    toast.error('Failed to add to cart. Please try again.')
  }
}

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
    const result = await apiService.getInfluencerBlogPost(currentUsername.value, slug)

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
        image: data.coverImage || data.image || data.cover_image || '/media-placeholder.jpg',
        date: data.publishedAt
          ? new Date(data.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : data.published_at
            ? new Date(data.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : data.date,
        coverImage: data.coverImage || data.image || data.cover_image,
        publishedAt: data.publishedAt || data.published_at || data.date,
        content: data.content || data.body || '',
        body: data.body || data.content || '',
        preview: data.preview || data.excerpt || data.description || '',
        // Mark as locked if it's a 402 response or if isLocked is true
        isLocked: result.status === 402 || data.isLocked || false,
        isPremium: data.isPremium || data.is_premium || result.status === 402 || false,
        price: data.price || 5,
      }

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
          isLocked: true,
        }
      }
    }
  } catch (err) {
    console.error('Error fetching blog post:', err)
    error.value = err.message || 'An unexpected error occurred.'
    // Fallback to props.post if available
    if (props.post) {
      post.value = {
        ...props.post,
        image: props.post.coverImage || props.post.image || '/media-placeholder.jpg',
      }
    }
  } finally {
    loading.value = false
  }
}

// Watch for route changes to refetch post when slug changes
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      fetchPost()
    }
  },
  { immediate: false }
)

onMounted(() => {
  // Always fetch post on mount, even if we have props.post
  // This ensures we have the latest data and handle premium content correctly
  fetchPost()
})
</script>

