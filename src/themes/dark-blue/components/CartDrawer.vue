<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      :class="[
        'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      ]"
      @click="$emit('close')"
    />

    <!-- Drawer -->
    <div
      :class="[
        'fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-surface">
        <div class="flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-primary" />
          <h2 class="text-xl font-bold text-primary">Your Cart ({{ cartItems.length }})</h2>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X class="w-5 h-5 text-text-muted" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Loading State -->
        <div v-if="loading" class="h-full flex flex-col items-center justify-center text-text-light space-y-4">
          <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-lg font-medium">Loading your cart...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && cartItems.length === 0" class="h-full flex flex-col items-center justify-center text-text-light space-y-4">
          <ShoppingCart class="w-16 h-16 opacity-20" />
          <p class="text-lg font-medium">Your cart is empty</p>
          <button @click="$emit('close')" class="text-secondary font-semibold hover:underline">
            Browse courses & assets
          </button>
        </div>

        <!-- Cart Items -->
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="flex gap-4"
        >
          <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
            <img
              :src="getItemImage(item)"
              :alt="getItemName(item)"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h3 class="font-bold text-primary leading-tight line-clamp-2">{{ getItemName(item) }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-text-light uppercase font-semibold">{{ getItemTypeLabel(item) }}</span>
                <span
                  v-if="item.metadata && item.metadata.scheduled_at"
                  class="text-xs text-text-muted"
                >
                  • {{ formatScheduledDate(item.metadata.scheduled_at) }}
                </span>
              </div>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center gap-3">
                <!-- Quantity Selector -->
                <div class="flex items-center gap-2 border border-slate-200 rounded-lg">
                  <button
                    @click="updateQuantity(item, item.quantity - 1)"
                    :disabled="item.quantity <= 1 || updatingItemId === item.id"
                    class="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus class="w-4 h-4 text-text-muted" />
                  </button>
                  <span class="text-sm font-semibold text-primary min-w-[24px] text-center">{{ item.quantity }}</span>
                  <button
                    @click="updateQuantity(item, item.quantity + 1)"
                    :disabled="updatingItemId === item.id"
                    class="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus class="w-4 h-4 text-text-muted" />
                  </button>
                </div>
                <PriceDisplay :amount="getItemPriceInDollars(item)" class="font-bold text-secondary" />
              </div>
              <button
                @click="handleRemove(item.id)"
                :disabled="removingItemId === item.id"
                class="text-text-muted hover:text-red-500 transition-colors p-1 disabled:opacity-50"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && cartItems.length > 0" class="p-6 border-t border-slate-100 bg-surface space-y-4">
        <!-- Sign in message for guests -->
        <div v-if="!isAuthenticated" class="bg-secondary/10 border border-secondary/20 rounded-xl p-4 flex items-center gap-3">
          <div class="flex-1">
            <p class="text-sm font-semibold text-primary mb-1">Sign in to save your cart</p>
            <p class="text-xs text-text-muted">Your items will be saved to your account</p>
          </div>
          <button
            @click="handleSignInClick"
            class="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-secondary/90 transition-colors whitespace-nowrap"
          >
            Sign In
          </button>
        </div>
        
        <div class="flex justify-between items-end">
          <span class="text-text-muted font-medium">Subtotal</span>
          <PriceDisplay :amount="subtotal" class="text-2xl font-bold text-primary" />
        </div>
        <p class="text-xs text-text-light text-center">Taxes and shipping calculated at checkout</p>
        <button
          @click="$emit('checkout')"
          class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
        >
          Checkout <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Teleport } from 'vue'
import { ShoppingCart, X, Trash2, ArrowRight, Plus, Minus } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'
import eventBus from '@/utils/eventBus.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'checkout', 'cart-updated'])

// State
const cartItems = ref([])
const loading = ref(false)
const updatingItemId = ref(null)
const removingItemId = ref(null)
const cartData = ref(null)
const isAuthenticated = ref(false)

// Computed
const subtotal = computed(() => {
  if (cartData.value) {
    // Prefer subtotal_cents if available (backend stores in cents)
    if (cartData.value.subtotal_cents !== undefined) {
      return cartData.value.subtotal_cents / 100
    }
    // Fallback to subtotal if already in dollars
    if (cartData.value.subtotal !== undefined) {
      return cartData.value.subtotal
    }
  }
  
  // Calculate from items if subtotal not provided
  return cartItems.value.reduce((sum, item) => {
    const priceInDollars = getItemPriceInDollars(item)
    return sum + (priceInDollars * (item.quantity || 1))
  }, 0)
})

// Methods
const checkAuthStatus = async () => {
  try {
    isAuthenticated.value = await apiService.isAuthenticated()
  } catch (error) {
    isAuthenticated.value = false
  }
}

const handleSignInClick = () => {
  emit('close')
  // Show toast message directing user to sign in
  toast.info('Please sign in to save your cart. You can sign in from the navigation menu.')
  // Optionally navigate to home page where login might be available
  // This is a simple solution - in a full implementation, you'd want a login modal
}

const fetchCart = async () => {
  if (!props.isOpen) return
  
  loading.value = true
  try {
    // Check auth status when fetching cart
    await checkAuthStatus()
    
    const response = await apiService.getCart()
    if (response.success) {
      cartData.value = response.data
      cartItems.value = response.data.items || []
      emit('cart-updated', cartItems.value.length)
    } else {
      toast.error(response.error || 'Failed to load cart')
      cartItems.value = []
    }
  } catch (error) {
    console.error('Error fetching cart:', error)
    toast.error('Failed to load cart. Please try again.')
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

const handleRemove = async (itemId) => {
  if (removingItemId.value === itemId) return
  
  removingItemId.value = itemId
  try {
    const response = await apiService.removeCartItem(itemId)
    if (response.success) {
      toast.success('Item removed from cart')
      await fetchCart()
    } else {
      toast.error(response.error || 'Failed to remove item')
    }
  } catch (error) {
    console.error('Error removing item:', error)
    toast.error('Failed to remove item. Please try again.')
  } finally {
    removingItemId.value = null
  }
}

const updateQuantity = async (item, newQuantity) => {
  if (newQuantity < 1 || updatingItemId.value === item.id) return
  
  updatingItemId.value = item.id
  try {
    const response = await apiService.updateCartItem(item.id, {
      quantity: newQuantity
    })
    if (response.success) {
      await fetchCart()
    } else {
      toast.error(response.error || 'Failed to update quantity')
    }
  } catch (error) {
    console.error('Error updating quantity:', error)
    toast.error('Failed to update quantity. Please try again.')
  } finally {
    updatingItemId.value = null
  }
}

const getItemName = (item) => {
  // API returns item_name from cart_item or we can get from nested item relationship
  if (item.item_name) return item.item_name
  if (item.item) {
    // Try to get name from nested item (masterclass, media_asset, consultation)
    return item.item.title || item.item.name || 'Unknown Item'
  }
  return item.name || 'Unknown Item'
}

const getItemImage = (item) => {
  // API returns image_url from cart_item or we can get from nested item relationship
  if (item.image_url) return item.image_url
  if (item.item) {
    // Try to get image from nested item (masterclass, media_asset, consultation)
    const nestedItem = item.item
    return nestedItem.image || 
           nestedItem.thumbnail || 
           nestedItem.cover_image || 
           nestedItem.coverImage ||
           '/media-placeholder.jpg'
  }
  return '/media-placeholder.jpg'
}

const getItemPriceInDollars = (item) => {
  // API may return price_cents (in cents) or price (already in dollars)
  // Backend stores in cents, but API resources convert to dollars
  // Handle both cases for safety
  
  // Prefer price_cents if available (convert from cents to dollars)
  if (item.price_cents !== undefined) {
    return item.price_cents / 100
  }
  
  // If price is already in dollars (from API resource conversion)
  if (typeof item.price === 'number') {
    // If price > 10000, it's likely in cents (e.g., 15000 = $150.00)
    // Otherwise assume it's already in dollars
    if (item.price > 10000) {
      return item.price / 100
    }
    return item.price
  }
  
  return 0
}

const getItemTypeLabel = (item) => {
  const typeMap = {
    'consultation': 'Consultation',
    'masterclass': 'Masterclass',
    'media_asset': 'Media Asset',
    'map': 'Travel Map',
    'course': 'Course',
    'asset': 'Asset',
  }
  return typeMap[item.item_type] || item.item_type || 'Item'
}

const formatScheduledDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
}

// Watch for drawer open to fetch cart
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchCart()
  }
})

// Fetch cart on mount if drawer is already open
onMounted(() => {
  if (props.isOpen) {
    fetchCart()
  }
})
</script>

