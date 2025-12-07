<template>
  <div class="min-h-screen bg-surface font-sans selection:bg-secondary selection:text-white flex flex-col theme-dark-blue" data-theme="dark-blue">
    <!-- Navigation -->
    <Navigation
      :cart-count="cartCount"
      :current-view="currentView"
      :logo="finalProfile?.logo"
      :first-name="finalProfile?.firstName"
      :last-name="finalProfile?.lastName"
      @menu-click="mobileMenuOpen = true"
      @navigate="handleNavigate"
      @cart-click="isCartOpen = true"
      @show-login="showLogin = true"
      @show-signup="showSignup = true"
    />

    <!-- Cart Drawer -->
    <CartDrawer
      :is-open="isCartOpen"
      @close="isCartOpen = false"
      @checkout="handleCheckout"
      @cart-updated="handleCartUpdated"
    />

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-[60] bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 transition-opacity"
    >
      <button @click="mobileMenuOpen = false" class="absolute top-6 right-6 text-white p-2">
        <X class="w-8 h-8" />
      </button>
      <div class="flex flex-col gap-8 text-center w-full max-w-sm">
        <a
          v-for="item in ['Profile', 'Courses', 'Maps', 'Blog', 'Assets']"
          :key="item"
          :href="`#${item.toLowerCase()}`"
          @click.prevent="handleMobileNav(item)"
          class="text-2xl font-bold text-white hover:text-secondary transition-colors"
        >
          {{ item }}
        </a>
        <div class="pt-4 border-t border-white/20 flex flex-col gap-4">
          <button
            @click="mobileMenuOpen = false; showLogin = true"
            class="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Sign In
          </button>
          <button
            @click="mobileMenuOpen = false; showSignup = true"
            class="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <HomeView
        v-if="currentView === 'home'"
        :profile="finalProfile"
        :bio-paragraphs="finalBioParagraphs"
        :visibility-settings="visibilitySettings"
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
      <CheckoutView
        v-else-if="currentView === 'checkout'"
        @back="isCartOpen = true"
        @order-complete="handleOrderComplete"
      />
      <div v-else-if="currentView !== 'home' && currentView !== 'checkout'" class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
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

    <!-- Login Modal -->
    <LoginModal
      :isOpen="showLogin"
      @close="showLogin = false"
      @login-success="handleLoginSuccess"
      @switch-to-signup="showLogin = false; showSignup = true"
    />

    <!-- Signup Modal -->
    <SignupModal
      :isOpen="showSignup"
      @close="showSignup = false"
      @signup-success="handleSignupSuccess"
      @switch-to-login="showSignup = false; showLogin = true"
    />
  </div>
</template>

<script setup>
import { ref, provide, computed, onMounted, watch } from 'vue'
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
import CheckoutView from './views/CheckoutView.vue'
import LoginModal from '@/components/LoginModal.vue'
import SignupModal from '@/components/SignupModal.vue'
import { useInfluencer } from '@/shared/influencer/composables/useInfluencer'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'
import eventBus from '@/utils/eventBus.js'
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
const cartCount = ref(0)
const isCartOpen = ref(false)
const mobileMenuOpen = ref(false)
const currentView = ref('home')
const selectedPost = ref(null)
const showLogin = ref(false)
const showSignup = ref(false)
const visibilitySettings = ref({
  blog: true,
  podcast: true,
  masterclass: true,
  maps: true,
  consultation: true,
  'media-assets': true,
  social: true,
  'social-links': true,
  creator: true,
  order: ['masterclass', 'maps', 'blog', 'podcast', 'media-assets', 'consultation', 'social', 'social-links', 'creator'],
})

// Watch for profile changes to extract visibility settings
watch(finalProfile, (newProfile) => {
  if (newProfile?.creatorToolsVisibility) {
    const settings = newProfile.creatorToolsVisibility
    visibilitySettings.value = {
      blog: settings.blog ?? true,
      podcast: settings.podcast ?? true,
      masterclass: settings.masterclass ?? true,
      maps: settings.maps ?? true,
      consultation: settings.consultation ?? true,
      'media-assets': settings['media-assets'] ?? true,
      social: settings.social ?? true,
      'social-links': settings['social-links'] ?? true,
      creator: settings.creator ?? true,
      order: settings.order || ['masterclass', 'maps', 'blog', 'podcast', 'media-assets', 'consultation', 'social', 'social-links', 'creator'],
    }
    console.log('[Profile] Visibility settings updated:', visibilitySettings.value)
  } else {
    console.log('[Profile] No creatorToolsVisibility found in profile:', newProfile)
  }
}, { immediate: true })

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
const mapItemTypeToApi = (type) => {
  const typeMap = {
    'course': 'masterclass',
    'masterclass': 'masterclass',
    'asset': 'media_asset',
    'media_asset': 'media_asset',
    'map': 'map', // Maps are now supported (after backend implements map item_type)
    'consultation': 'consultation',
  }
  return typeMap[type] || null
}

const addToCart = async (item) => {
  try {
    // Check if this item type is supported
    const itemType = mapItemTypeToApi(item.type)
    
    if (!itemType) {
      toast.error('This item type is not yet available for purchase.')
      return
    }

    // Convert frontend item format to backend API format
    const itemData = {
      item_type: itemType,
      item_id: item.id,
      quantity: 1,
    }

    // Add metadata if provided (e.g., for consultations)
    if (item.metadata) {
      itemData.metadata = item.metadata
    }

    // Log the request for debugging
    console.log('Adding to cart:', {
      itemData,
      itemPrice: item.price,
      itemIsForSale: item.isForSale,
      itemType: item.type
    })

    const response = await apiService.addCartItem(itemData)
    
    if (response.success) {
      toast.success(`${item.title} added to cart`)
      isCartOpen.value = true
      // Update cart count from response
      if (response.data && response.data.items) {
        cartCount.value = response.data.items.length
      }
    } else {
      // Provide more specific error messages
      const errorMsg = response.error || response.data?.error || response.data?.message || 'Failed to add item to cart'
      
      // Check for specific backend validation errors
      if (errorMsg.includes('not available for purchase') || errorMsg.includes('not for sale')) {
        // Special message for free maps
        if (item.price === 0 || item.price === '0') {
          toast.error('Free maps must be marked as "for sale" in the creator settings. Please contact the creator.')
        } else {
          toast.error('This item is not available for purchase. The creator may need to enable it for sale.')
        }
      } else {
        toast.error(errorMsg)
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    const errorMessage = error.message || error.error || 'Failed to add item to cart. Please try again.'
    
    // Check for specific backend validation errors
    if (errorMessage.includes('not available for purchase') || errorMessage.includes('not for sale')) {
      // Special message for free maps
      if (item.price === 0 || item.price === '0') {
        toast.error('Free maps must be marked as "for sale" in the creator settings. Please contact the creator.')
      } else {
        toast.error('This item is not available for purchase. The creator may need to enable it for sale.')
      }
    } else {
      toast.error(errorMessage)
    }
  }
}

const handleCartUpdated = (count) => {
  cartCount.value = count
}

const fetchCartCount = async () => {
  try {
    const response = await apiService.getCart()
    if (response.success && response.data) {
      cartCount.value = response.data.items?.length || 0
    }
  } catch (error) {
    console.error('Error fetching cart count:', error)
    // Silently fail - cart count is not critical for page load
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

const handleOrderComplete = (orderData) => {
  // Check if this is a free order
  const isFreeOrder = orderData.isFree || false
  
  // Show appropriate success message
  if (isFreeOrder) {
    toast.success(`Your free order #${orderData.orderId} has been confirmed!`)
  } else {
    toast.success(`Order #${orderData.orderId} completed successfully!`)
  }
  
  // Navigate to success page or order details
  // For now, show success message and go back to home
  currentView.value = 'home'
  // Refresh cart count
  fetchCartCount()
}

// Orders and Invoices are now handled in the main dashboard (/profile)
// Navigation links will route to /profile?tab=orders or /profile?tab=invoices

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

const handleLoginSuccess = (userData) => {
  showLogin.value = false
  // Emit auth success event for Navigation component
  eventBus.emit('auth-success', userData)
  toast.success('Welcome back!')
}

const handleSignupSuccess = (userData) => {
  showSignup.value = false
  // Emit auth success event for Navigation component
  eventBus.emit('auth-success', userData)
  toast.success('Account created successfully!')
}

// Load profile on mount if needed
// Note: creatorToolsVisibility is now included in the profile response,
// so the watcher will automatically extract it when the profile loads
onMounted(async () => {
  if (!props.profile && props.username) {
    await fetchProfile(props.username)
  } else if (!props.profile && !props.username && props.useMockData) {
    loadMockData()
  }
  
  // Fetch initial cart count
  await fetchCartCount()
})
</script>

