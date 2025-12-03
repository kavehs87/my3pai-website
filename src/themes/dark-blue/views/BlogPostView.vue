<template>
  <article class="pt-28 pb-20 bg-surface min-h-screen">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <button
        @click="$emit('back')"
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
      <div v-if="post" class="relative">
        <!-- Content -->
        <div
          class="text-slate-700 rich-text"
          :class="[
            'prose prose-lg prose-slate max-w-none',
            'prose-headings:text-primary prose-headings:font-bold',
            'prose-p:text-slate-700 prose-p:leading-relaxed',
            'prose-a:text-secondary prose-a:font-medium hover:prose-a:text-secondary/80',
            'prose-strong:text-slate-900 prose-strong:font-bold',
            'prose-ul:text-slate-700 prose-li:marker:text-secondary',
            'prose-img:rounded-2xl prose-img:shadow-lg',
            post.isPremium ? 'mask-image-gradient pb-8' : ''
          ]"
          :style="{
            maskImage: post.isPremium ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none',
            WebkitMaskImage: post.isPremium ? 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' : 'none'
          }"
          v-html="post.content || post.body || ''"
        />

        <!-- Premium Lock Overlay -->
        <div
          v-if="post.isPremium"
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
import { ref, computed, onMounted, inject } from 'vue'

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

defineEmits(['back'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.post?.username || username?.value)

const post = ref(props.post)
const loading = ref(false)
const error = ref(null)

const fetchPost = async () => {
  if (props.post) return // Already have post data
  if (!currentUsername.value || !props.slug) return

  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerBlogPost(currentUsername.value, props.slug)
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      post.value = data
    } else {
      error.value = result.error || 'Failed to load blog post.'
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!props.post && props.slug) {
    fetchPost()
  }
})
</script>

