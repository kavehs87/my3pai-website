<template>
  <div class="min-h-screen bg-surface font-sans selection:bg-secondary selection:text-white flex flex-col theme-dark-blue" data-theme="dark-blue">
    <!-- Navigation -->
    <Navigation
      :cart-count="cart.length"
      :current-view="currentView"
      @menu-click="mobileMenuOpen = true"
      @navigate="handleNavigate"
      @cart-click="isCartOpen = true"
    />

    <!-- Cart Drawer -->
    <CartDrawer
      :is-open="isCartOpen"
      :items="cart"
      @close="isCartOpen = false"
      @remove="removeFromCart"
      @checkout="handleCheckout"
    />

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-[60] bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 transition-opacity"
    >
      <button @click="mobileMenuOpen = false" class="absolute top-6 right-6 text-white p-2">
        <X class="w-8 h-8" />
      </button>
      <div class="flex flex-col gap-8 text-center">
        <a
          v-for="item in ['Profile', 'Courses', 'Maps', 'Blog', 'Assets']"
          :key="item"
          :href="`#${item.toLowerCase()}`"
          @click.prevent="handleMobileNav(item)"
          class="text-2xl font-bold text-white hover:text-secondary"
        >
          {{ item }}
        </a>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <HomeView
        v-if="currentView === 'home'"
        :profile="finalProfile"
        :bio-paragraphs="finalBioParagraphs"
        @add-to-cart="addToCart"
        @book-click="handleBookClick"
        @view-assets="currentView = 'assets'"
        @view-classes="currentView = 'classes'"
        @view-maps="currentView = 'maps'"
        @view-blog="currentView = 'blog'"
        @view-post="handleViewPost"
        @view-podcasts="currentView = 'podcasts'"
        @view-socials="currentView = 'socials'"
      />

      <!-- Other Views -->
      <ClassesView
        v-else-if="currentView === 'classes'"
        @back="currentView = 'home'"
        @add-to-cart="addToCart"
      />
      <MapsView
        v-else-if="currentView === 'maps'"
        @back="currentView = 'home'"
        @add-to-cart="addToCart"
      />
      <BlogView
        v-else-if="currentView === 'blog'"
        @back="currentView = 'home'"
        @view-post="handleViewPost"
      />
      <BlogPostView
        v-else-if="currentView === 'blog-post'"
        :post="selectedPost"
        @back="currentView = 'blog'"
      />
      <AssetsView
        v-else-if="currentView === 'assets'"
        @back="currentView = 'home'"
        @add-to-cart="addToCart"
      />
      <PodcastsView
        v-else-if="currentView === 'podcasts'"
        @back="currentView = 'home'"
      />
      <SocialsView
        v-else-if="currentView === 'socials'"
        @back="currentView = 'home'"
      />
      <ConsultationView
        v-else-if="currentView === 'consultation'"
        @back="currentView = 'home'"
        @book="handleBookSuccess"
      />
      <div v-else-if="currentView !== 'home'" class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <div class="text-center text-text-muted">
          <p>{{ currentView }} view - Coming soon</p>
          <button @click="currentView = 'home'" class="mt-4 text-secondary hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer v-if="currentView !== 'checkout' && currentView !== 'success'" :profile="finalProfile" />
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import Navigation from './components/Navigation.vue'
import CartDrawer from './components/CartDrawer.vue'
import Footer from './components/Footer.vue'
import HomeView from './views/HomeView.vue'
import ClassesView from './views/ClassesView.vue'
import MapsView from './views/MapsView.vue'
import BlogView from './views/BlogView.vue'
import BlogPostView from './views/BlogPostView.vue'
import AssetsView from './views/AssetsView.vue'
import PodcastsView from './views/PodcastsView.vue'
import SocialsView from './views/SocialsView.vue'
import ConsultationView from './views/ConsultationView.vue'
import { useInfluencer } from '@/shared/influencer/composables/useInfluencer'
import './styles/theme.css'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  useMockData: {
    type: Boolean,
    default: false,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
})

// Get profile data if not provided
const {
  profile: fetchedProfile,
  loading: profileLoading,
  bioParagraphs: fetchedBioParagraphs,
  fetchProfile,
  loadMockData,
} = useInfluencer()

const finalProfile = computed(() => props.profile || fetchedProfile.value)
const finalBioParagraphs = computed(() => props.bioParagraphs.length > 0 ? props.bioParagraphs : fetchedBioParagraphs.value)

// State
const cart = ref([])
const isCartOpen = ref(false)
const mobileMenuOpen = ref(false)
const currentView = ref('home')
const selectedPost = ref(null)

// Currency context
const currency = ref({ code: 'USD', symbol: '$', rate: 1 })
const setCurrency = (c) => {
  currency.value = c
}
provide('currency', currency)
provide('setCurrency', setCurrency)

// Provide username for child components
const currentUsername = computed(() => props.username || finalProfile.value?.username || null)
provide('influencerUsername', currentUsername)

// Methods
const addToCart = (item) => {
  cart.value = [...cart.value, item]
  isCartOpen.value = true
}

const removeFromCart = (id) => {
  const index = cart.value.findIndex((item) => item.id === id)
  if (index !== -1) {
    cart.value.splice(index, 1)
  }
}

const handleNavigate = (view) => {
  currentView.value = view
  window.scrollTo(0, 0)
}

const handleCheckout = () => {
  isCartOpen.value = false
  currentView.value = 'checkout'
  window.scrollTo(0, 0)
}

const handleBookClick = () => {
  currentView.value = 'consultation'
  window.scrollTo(0, 0)
}

const handleBookSuccess = () => {
  // Booking success is handled in ConsultationView
  // Could show toast or redirect here if needed
}

const handleViewPost = (post) => {
  selectedPost.value = post
  currentView.value = 'blog-post'
  window.scrollTo(0, 0)
}

const handleMobileNav = (item) => {
  mobileMenuOpen.value = false
  if (currentView.value !== 'home') {
    currentView.value = 'home'
    setTimeout(() => {
      const element = document.getElementById(item.toLowerCase())
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } else {
    const element = document.getElementById(item.toLowerCase())
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Load profile on mount if needed
onMounted(async () => {
  if (!props.profile && props.username) {
    await fetchProfile(props.username)
  } else if (!props.profile && !props.username && props.useMockData) {
    loadMockData()
  }
})
</script>

