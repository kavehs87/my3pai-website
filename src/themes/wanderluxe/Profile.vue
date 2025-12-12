<template>
  <div class="min-h-screen bg-slate-50 font-sans theme-wanderluxe" data-theme="wanderluxe">
    <!-- Navigation -->
    <Navigation
      :cart-count="cartCount"
      :current-view="route.name || 'influencer-home'"
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
      class="fixed inset-0 z-[60] bg-white pt-24 px-6"
    >
      <button @click="mobileMenuOpen = false" class="absolute top-6 right-6 text-slate-600 p-2">
        <X class="w-6 h-6" />
      </button>
      <div class="flex flex-col gap-6 text-2xl font-semibold text-slate-800">
        <button
          v-for="item in ['Home', 'Digital Store', 'Consultation', 'Blog', 'Podcasts']"
          :key="item"
          @click="handleMobileNav(item)"
          class="text-left hover:text-indigo-600 transition-colors"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view
        :profile="finalProfile"
        :bio-paragraphs="finalBioParagraphs"
        :visibility-settings="visibilitySettings"
        @add-to-cart="addToCart"
        @book-click="handleBookClick"
        @order-complete="handleOrderComplete"
      />
    </main>

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

    <!-- Order Details Modal -->
    <OrderDetailsModal
      :isOpen="showOrderDetails"
      :orderId="completedOrderId"
      :orderData="completedOrderData"
      @close="handleCloseOrderDetails"
      @view-invoice="handleViewInvoice"
    />

    <!-- Footer -->
    <Footer v-if="route.name !== 'influencer-checkout'" />

    <!-- Cookie Consent -->
    <CookieConsent />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, provide, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { useInfluencer } from '@/shared/influencer/composables/useInfluencer'
import apiService from '@/services/api'
import { eventBus } from '@/utils/eventBus'
import Navigation from './components/Navigation.vue'
import CartDrawer from './components/CartDrawer.vue'
import Footer from './components/Footer.vue'
import LoginModal from '@/components/LoginModal.vue'
import SignupModal from '@/components/SignupModal.vue'
import OrderDetailsModal from './components/OrderDetailsModal.vue'
import CookieConsent from './components/CookieConsent.vue'
import toast from '@/utils/toast'
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

const route = useRoute()
const router = useRouter()

// Get influencer username from inject or props
const influencerUsername = inject('influencerUsername', null)
const finalUsername = computed(() => props.username || influencerUsername?.value || route.params.username)

// Use influencer composable
const {
  profile: composableProfile,
  loading: composableLoading,
  error: composableError,
  useMockData: composableUseMockData,
  bioParagraphs: composableBioParagraphs,
  fetchProfile,
} = useInfluencer()

// Use props profile if provided, otherwise use composable
const finalProfile = computed(() => props.profile || composableProfile.value)
const finalLoading = computed(() => props.loading || composableLoading.value)
const finalError = computed(() => props.error || composableError.value)
const finalUseMockData = computed(() => props.useMockData || composableUseMockData.value)
const finalBioParagraphs = computed(() => props.bioParagraphs.length > 0 ? props.bioParagraphs : composableBioParagraphs.value)

// Visibility settings
const visibilitySettings = computed(() => finalProfile.value?.creatorToolsVisibility || {})

// State
const cartCount = ref(0)
const isCartOpen = ref(false)
const mobileMenuOpen = ref(false)
const showLogin = ref(false)
const showSignup = ref(false)
const showOrderDetails = ref(false)
const completedOrderId = ref(null)
const completedOrderData = ref(null)

// Currency context
const currency = ref({
  code: 'USD',
  symbol: '$',
  rate: 1,
})
const setCurrency = (newCurrency) => {
  currency.value = newCurrency
}

// Provide currency context
provide('currency', currency)
provide('setCurrency', setCurrency)
provide('influencerUsername', finalUsername)

// Fetch cart count
const fetchCartCount = async () => {
  try {
    const result = await apiService.getCart()
    if (result.success && result.data) {
      const items = result.data.items || result.data.data?.items || []
      cartCount.value = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }
  } catch (error) {
    console.error('Failed to fetch cart count:', error)
  }
}

// Map item type to API format
const mapItemTypeToApi = (type) => {
  const typeMap = {
    'course': 'masterclass',
    'masterclass': 'masterclass',
    'asset': 'media_asset',
    'media_asset': 'media_asset',
    'media-asset': 'media_asset',
    'map': 'map',
    'consultation': 'consultation',
    'blog_post': 'blog_post',
  }
  return typeMap[type?.toLowerCase()] || null
}

// Add to cart
// Note: Views handle their own API calls and toasts.
// This handler only manages side effects (opening cart drawer, updating count).
const addToCart = async (item) => {
  // Open cart drawer
  isCartOpen.value = true
  // Update cart count (views already called the API, so we just refresh the count)
  await fetchCartCount()
}

// Handle navigation
const handleNavigate = (view) => {
  if (finalUsername.value) {
    router.push({ name: view, params: { username: finalUsername.value } })
  }
}

// Handle mobile navigation
const handleMobileNav = (item) => {
  mobileMenuOpen.value = false
  const routeMap = {
    'Home': 'influencer-home',
    'Digital Store': 'influencer-assets',
    'Consultation': 'influencer-consultation',
    'Blog': 'influencer-blog',
    'Podcasts': 'influencer-podcasts',
  }
  const routeName = routeMap[item]
  if (routeName && finalUsername.value) {
    router.push({ name: routeName, params: { username: finalUsername.value } })
  }
}

// Handle checkout
const handleCheckout = () => {
  if (finalUsername.value) {
    router.push({ name: 'influencer-checkout', params: { username: finalUsername.value } })
  }
}

// Handle cart updated
const handleCartUpdated = async () => {
  await fetchCartCount()
}

// Handle book click
const handleBookClick = () => {
  if (finalUsername.value) {
    router.push({ name: 'influencer-consultation', params: { username: finalUsername.value } })
  }
}

// Handle login success
const handleLoginSuccess = (userData) => {
  showLogin.value = false
  // Emit auth success event
  eventBus.emit('auth-success', userData)
  toast.success('Welcome back!')
  fetchCartCount()
}

// Handle signup success
const handleSignupSuccess = (userData) => {
  showSignup.value = false
  // Emit auth success event
  eventBus.emit('auth-success', userData)
  toast.success('Account created successfully!')
  fetchCartCount()
}

// Handle order complete
const handleOrderComplete = (orderData) => {
  // Extract order ID and order object
  // The orderData can have structure: { orderId, order, isFree } or { orderId, ...orderData }
  const orderId = orderData.orderId || orderData.id || orderData.order_id
  const order = orderData.order || orderData
  
  // Handle nested data structure from API response
  const finalOrderData = order?.data || order
  
  // Store order information for the modal
  completedOrderId.value = orderId
  completedOrderData.value = finalOrderData
  
  // Show order details modal
  showOrderDetails.value = true
  
  // Navigate back to home
  if (finalUsername.value) {
    router.push({ name: 'influencer-home', params: { username: finalUsername.value } })
  }
  
  // Refresh cart count
  fetchCartCount()
}

// Handle close order details
const handleCloseOrderDetails = () => {
  showOrderDetails.value = false
  completedOrderId.value = null
  completedOrderData.value = null
}

// Handle view invoice
const handleViewInvoice = (invoiceId) => {
  // Navigate to invoice view
  router.push({ name: 'profile', query: { tab: 'invoices', invoiceId } })
}

// Auth success handler
const handleAuthSuccess = () => {
  fetchCartCount()
}

// Listen for auth success
onMounted(() => {
  fetchCartCount()
  eventBus.on('auth-success', handleAuthSuccess)
})

// Cleanup event listeners
onBeforeUnmount(() => {
  eventBus.off('auth-success', handleAuthSuccess)
})

// Watch for route changes to update cart
watch(() => route.path, () => {
  fetchCartCount()
})
</script>

