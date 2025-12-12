<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 px-4 lg:px-12 xl:px-16 2xl:px-24 pt-24 lg:pt-8 w-full">
    <!-- Sidebar Column -->
    <div
      v-if="isSidebarOpen"
      class="lg:col-span-5 xl:col-span-4"
    >
      <div class="lg:sticky lg:top-24 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden lg:h-[calc(100vh-8rem)] flex flex-col">
        <Sidebar
          :profile="profile"
          :bio-paragraphs="bioParagraphs"
          :on-collapse="() => (isSidebarOpen = false)"
          @navigate="handleNavigate"
        />
      </div>
    </div>

    <!-- Main Content Column -->
    <div
      :class="[
        'space-y-16 pb-20 mt-4 lg:mt-16',
        isSidebarOpen ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
      ]"
    >
      <!-- Sidebar Toggle Button (when collapsed) -->
      <button
        v-if="!isSidebarOpen"
        @click="isSidebarOpen = true"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm bg-white p-2 rounded-xl shadow-sm border border-slate-200 w-fit"
      >
        <PanelLeftOpen class="w-5 h-5" /> Show Profile
      </button>

      <!-- Render sections in the specified order -->
      <template v-for="sectionId in orderedVisibleSections" :key="sectionId">
        <!-- Media Section -->
        <MediaSection
          v-if="sectionId === 'media-assets'"
          :username="currentUsername"
          :limit="6"
          @add-to-cart="handleAddToCart"
          @view-all="handleViewAll('assets')"
        />

        <!-- Masterclass Section -->
        <MasterclassSection
          v-if="sectionId === 'masterclass'"
          :username="currentUsername"
          :limit="2"
          @add-to-cart="handleAddToCart"
          @view-all="handleViewAll('classes')"
        />

        <!-- Country Map Section -->
        <CountryMapSection
          v-if="sectionId === 'maps'"
          :username="currentUsername"
          :limit="2"
          @add-to-cart="handleAddToCart"
          @view-all="handleViewAll('maps')"
        />

        <!-- Podcast Section -->
        <PodcastSection
          v-if="sectionId === 'podcast'"
          :username="currentUsername"
          :limit="5"
          @view-all="handleViewAll('podcasts')"
          @episode-click="handleEpisodeClick"
        />

        <!-- Blog Section -->
        <BlogSection
          v-if="sectionId === 'blog'"
          :username="currentUsername"
          :limit="5"
          @view-all="handleViewAll('blog')"
          @post-click="handlePostClick"
        />

        <!-- Social Feed Section -->
        <SocialFeedSection
          v-if="sectionId === 'social'"
          :username="currentUsername"
          :limit="12"
          @follow-all="handleFollowAll"
        />
      </template>

      <!-- Let's work together CTA Section -->
      <div class="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-2xl font-bold mb-4">Let's work together</h2>
          <p class="text-slate-300 mb-6 max-w-md">
            Looking for a custom campaign or partnership? I'm always open to discussing new opportunities that align with sustainable travel.
          </p>
          <button
            @click="handleContact"
            class="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            Contact Me
          </button>
        </div>
        <div class="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PanelLeftOpen } from 'lucide-vue-next'
import Sidebar from '../components/Sidebar.vue'
import MediaSection from '../components/MediaSection.vue'
import MasterclassSection from '../components/MasterclassSection.vue'
import CountryMapSection from '../components/CountryMapSection.vue'
import PodcastSection from '../components/PodcastSection.vue'
import BlogSection from '../components/BlogSection.vue'
import SocialFeedSection from '../components/SocialFeedSection.vue'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
  visibilitySettings: {
    type: Object,
    default: () => ({
      blog: true,
      podcast: true,
      masterclass: true,
      maps: true,
      consultation: true,
      'media-assets': true,
      social: true,
    }),
  },
})

const emit = defineEmits(['add-to-cart', 'book-click', 'order-complete'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.profile?.username || username?.value || route.params.username)

// State
const isSidebarOpen = ref(true)

// Default order if not specified
const defaultOrder = ['media-assets', 'masterclass', 'maps', 'podcast', 'blog', 'social']

// Sections that are displayed on the public profile
const displayableSections = ['masterclass', 'maps', 'blog', 'podcast', 'social', 'media-assets']

// Get ordered visible sections based on visibilitySettings.order
const orderedVisibleSections = computed(() => {
  const order = props.visibilitySettings?.order || defaultOrder
  const settings = props.visibilitySettings || {}

  const visibleSections = []

  for (const sectionId of order) {
    // Skip sections that aren't displayable on the public profile
    if (!displayableSections.includes(sectionId)) {
      continue
    }

    // Check visibility
    const isVisible = settings[sectionId] !== false
    if (isVisible) {
      visibleSections.push(sectionId)
    }
  }

  return visibleSections
})

// Methods
const handleAddToCart = (item) => {
  emit('add-to-cart', item)
}

const handleNavigate = (view) => {
  if (currentUsername.value) {
    const routeMap = {
      consultation: 'influencer-consultation',
      contact: 'influencer-contact',
    }
    const routeName = routeMap[view]
    if (routeName) {
      router.push({ name: routeName, params: { username: currentUsername.value } })
    }
  }
}

const handleViewAll = (type) => {
  if (!currentUsername.value) return

  const routeMap = {
    assets: 'influencer-assets',
    classes: 'influencer-classes',
    maps: 'influencer-maps',
    podcasts: 'influencer-podcasts',
    blog: 'influencer-blog',
  }

  const routeName = routeMap[type]
  if (routeName) {
    router.push({ name: routeName, params: { username: currentUsername.value } })
  }
}

const handleEpisodeClick = (episode) => {
  // Could navigate to specific episode or just podcasts view
  if (currentUsername.value) {
    router.push({ name: 'influencer-podcasts', params: { username: currentUsername.value } })
  }
}

const handlePostClick = (post) => {
  if (currentUsername.value && post.slug) {
    router.push({
      name: 'influencer-blog-post',
      params: { username: currentUsername.value, slug: post.slug },
    })
  }
}

const handleFollowAll = () => {
  // Could open social links modal or navigate to social links
  // For now, just scroll to top or show a message
}

const handleContact = () => {
  if (currentUsername.value) {
    router.push({ name: 'influencer-contact', params: { username: currentUsername.value } })
  }
}

// Handle responsive sidebar collapse on mobile
const checkMobile = () => {
  if (window.innerWidth < 1024) {
    // lg breakpoint - collapse sidebar on mobile/tablet
    isSidebarOpen.value = false
  } else {
    // Desktop - show sidebar by default
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

