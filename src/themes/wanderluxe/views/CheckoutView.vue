<template>
  <div class="min-h-screen bg-slate-50 pt-24 pb-20">
    <div class="container mx-auto px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl">
      <!-- Back Button -->
      <button
        @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ChevronLeft class="w-5 h-5" /> Back to Home
      </button>

      <h1 class="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <!-- Step Indicators -->
      <div class="mb-12">
        <div class="flex items-center justify-between max-w-3xl mx-auto">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center flex-1"
          >
            <div class="flex flex-col items-center flex-1">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                  currentStep > index
                    ? 'bg-slate-900 text-white'
                    : currentStep === index
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                ]"
              >
                <Check v-if="currentStep > index" class="w-5 h-5" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span
                :class="[
                  'mt-2 text-xs font-medium text-center',
                  currentStep >= index ? 'text-slate-900' : 'text-slate-500'
                ]"
              >
                {{ step.label }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'h-1 flex-1 mx-2 transition-colors',
                currentStep > index ? 'bg-slate-900' : 'bg-slate-200'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2 space-y-8">
          <!-- Step 1: Cart Review -->
          <div v-if="currentStep === 0" class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Review Your Cart</h2>
            
            <div v-if="loadingCart" class="text-center py-12">
              <div class="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-slate-500">Loading cart...</p>
            </div>

            <div v-else-if="cartItems.length === 0" class="text-center py-12">
              <ShoppingCart class="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-20" />
              <p class="text-slate-500 mb-4">Your cart is empty</p>
              <button @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })" class="text-indigo-600 font-bold hover:underline">
                Return to shopping
              </button>
            </div>

            <!-- Free Order Message -->
            <div v-if="isFreeOrder && cartItems.length > 0" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <Check class="w-5 h-5 text-green-600 flex-shrink-0" />
              <p class="text-green-800 font-medium">🎉 This is a free order - no payment required!</p>
            </div>

            <div v-else class="space-y-4 mb-6">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="flex gap-4 p-4 border border-slate-200 rounded-xl"
              >
                <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img
                    :src="getItemImage(item)"
                    :alt="getItemName(item)"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-slate-900 leading-tight">{{ getItemName(item) }}</h3>
                        <span
                          v-if="getItemPriceInDollars(item) === 0"
                          class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full"
                        >
                          Free
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 uppercase font-semibold">{{ getItemTypeLabel(item) }}</p>
                    </div>
                    <button
                      @click="handleRemoveItem(item.id)"
                      :disabled="removingItemId === item.id"
                      class="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                      title="Remove item"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-2 border border-slate-200 rounded-lg">
                      <button
                        @click="updateQuantity(item, (item.quantity || 1) - 1)"
                        :disabled="(item.quantity || 1) <= 1 || updatingItemId === item.id"
                        class="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus class="w-4 h-4 text-slate-500" />
                      </button>
                      <span class="text-sm font-semibold text-slate-900 min-w-[24px] text-center">{{ item.quantity || 1 }}</span>
                      <button
                        @click="updateQuantity(item, (item.quantity || 1) + 1)"
                        :disabled="updatingItemId === item.id"
                        class="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus class="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                    <PriceDisplay :amount="getItemPriceInDollars(item) * (item.quantity || 1)" class="font-bold text-slate-900" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="cartItems.length > 0" class="border-t border-slate-200 pt-6">
              <div class="space-y-3 mb-6">
                <div class="flex justify-between items-center">
                  <span class="text-slate-500 font-medium">Subtotal</span>
                  <PriceDisplay :amount="subtotal" class="font-bold text-slate-900" />
                </div>
                <div v-if="tax > 0" class="flex justify-between items-center">
                  <span class="text-slate-500 font-medium">Tax</span>
                  <PriceDisplay :amount="tax" class="font-bold text-slate-900" />
                </div>
                <div v-else class="text-xs text-slate-400 text-center py-2">
                  Taxes calculated at checkout
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span class="text-lg font-bold text-slate-900">Total</span>
                  <PriceDisplay :amount="total" class="text-xl font-bold text-slate-900" />
                </div>
              </div>
              <button
                @click="nextStep"
                class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                {{ isFreeOrder ? 'Continue to Confirm' : 'Continue to Billing' }}
              </button>
            </div>
          </div>

          <!-- Step 2: Billing Information (Skip for free orders) -->
          <div v-if="currentStep === 1 && !isFreeOrder" class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>
            
            <form @submit.prevent="nextStep" class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    v-model="billingInfo.firstName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    v-model="billingInfo.lastName"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  v-model="billingInfo.email"
                  type="email"
                  required
                  class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  @click="prevStep"
                  class="flex-1 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Payment Method (Skip for free orders) -->
          <div v-show="currentStep === 2 && !isFreeOrder" class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Payment Details</h2>
            
            <div v-if="loadingPayment" class="text-center py-12">
              <div class="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-slate-500">Setting up secure payment...</p>
            </div>

            <div v-else>
              <!-- Payment Error -->
              <div v-if="paymentError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-600">{{ paymentError }}</p>
                <button 
                  @click="initializePayment" 
                  class="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Try again
                </button>
              </div>

              <!-- Payment Info Notice -->
              <div v-else class="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <ShieldCheck class="w-5 h-5 text-green-600" />
                <span class="text-sm text-slate-600">Transactions are secure and encrypted.</span>
              </div>

              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  @click="prevStep"
                  class="flex-1 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  @click="handlePayment"
                  :disabled="processingPayment || loadingPayment"
                  class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ processingPayment ? 'Redirecting...' : 'Complete Purchase' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Step 4: Review & Confirm (Step 2 for free orders) -->
          <div v-if="(currentStep === 3 && !isFreeOrder) || (currentStep === 1 && isFreeOrder)" class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Review & Confirm</h2>
            
            <!-- Free Order Badge -->
            <div v-if="isFreeOrder" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div class="flex items-center gap-3">
                <Check class="w-6 h-6 text-green-600" />
                <div>
                  <h3 class="font-bold text-green-800 mb-1">Free Order</h3>
                  <p class="text-sm text-green-700">No payment required for this order</p>
                </div>
              </div>
            </div>
            
            <!-- Order Summary -->
            <div class="mb-8">
              <h3 class="font-bold text-slate-900 mb-4">Order Summary</h3>
              <div class="space-y-3 mb-4">
                <div
                  v-for="item in cartItems"
                  :key="item.id"
                  class="flex justify-between text-sm"
                >
                  <span class="text-slate-600">{{ getItemName(item) }} x{{ item.quantity || 1 }}</span>
                  <PriceDisplay :amount="getItemPriceInDollars(item) * (item.quantity || 1)" />
                </div>
              </div>
              <div class="border-t border-slate-200 pt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-slate-500">Subtotal</span>
                  <PriceDisplay :amount="subtotal" />
                </div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-slate-500">Tax</span>
                  <PriceDisplay :amount="tax" />
                </div>
                <div class="flex justify-between items-center font-bold text-lg pt-2 border-t border-slate-200">
                  <span class="text-slate-900">Total</span>
                  <PriceDisplay :amount="total" class="text-slate-900" />
                </div>
              </div>
            </div>

            <!-- Billing Information (Only for paid orders) -->
            <div v-if="!isFreeOrder && billingInfo.email" class="mb-8">
              <h3 class="font-bold text-slate-900 mb-4">Contact Information</h3>
              <div class="text-sm text-slate-500 space-y-1">
                <p>{{ billingInfo.firstName }} {{ billingInfo.lastName }}</p>
                <p>{{ billingInfo.email }}</p>
              </div>
            </div>
          
            <!-- Terms & Conditions -->
            <div class="mb-8">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  v-model="agreeToTerms"
                  type="checkbox"
                  required
                  class="mt-1 w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span class="text-sm text-slate-500">
                  I agree to the <a href="#" class="text-slate-900 hover:underline">Terms and Conditions</a> and
                  <a href="#" class="text-slate-900 hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>

            <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>

            <div class="flex gap-4">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 bg-white text-slate-600 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                @click="completePurchase"
                :disabled="!agreeToTerms || processingOrder || processingPayment"
                class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ processingOrder || processingPayment ? 'Processing...' : (isFreeOrder ? 'Complete Free Order' : 'Complete Purchase') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-fit">
          <h3 class="font-bold text-lg mb-4 text-slate-900">Order Summary</h3>
          <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex justify-between items-center text-sm"
            >
              <span class="text-slate-600 truncate max-w-[180px]">{{ getItemName(item) }}</span>
              <PriceDisplay :amount="getItemPriceInDollars(item) * (item.quantity || 1)" class="font-bold text-slate-900" />
            </div>
          </div>
          <div class="border-t border-slate-200 pt-4 flex justify-between items-center">
            <span class="font-bold text-slate-900">Total</span>
            <PriceDisplay :amount="total" class="font-bold text-xl text-slate-900" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Check, ShoppingCart, ShieldCheck, Trash2, Plus, Minus } from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'
import eventBus from '@/utils/eventBus.js'

const emit = defineEmits(['order-complete'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

// Steps - will be filtered based on free order
const allSteps = [
  { label: 'Cart Review', id: 'cart' },
  { label: 'Billing', id: 'billing' },
  { label: 'Payment', id: 'payment' },
  { label: 'Review', id: 'review' }
]

const currentStep = ref(0)

// Cart data
const cartItems = ref([])
const cartData = ref(null)
const loadingCart = ref(false)
const updatingItemId = ref(null)
const removingItemId = ref(null)

// Billing information
const billingInfo = ref({
  firstName: '',
  lastName: '',
  email: '',
})

// Payment
const loadingPayment = ref(false)
const processingPayment = ref(false)
const paymentError = ref(null)

// Order
const orderId = ref(null)
const processingOrder = ref(false)
const agreeToTerms = ref(false)
const errorMessage = ref(null)

// Computed
const subtotal = computed(() => {
  if (cartData.value?.subtotal_cents !== undefined) {
    return cartData.value.subtotal_cents / 100
  }
  return cartItems.value.reduce((sum, item) => {
    const price = getItemPriceInDollars(item)
    return sum + (price * (item.quantity || 1))
  }, 0)
})

const tax = computed(() => {
  // For now, no tax calculation - can be added later
  return 0
})

const total = computed(() => {
  return subtotal.value + tax.value
})

// Free order detection
const cartTotal = computed(() => {
  return total.value
})

const isFreeOrder = computed(() => {
  return cartTotal.value === 0
})

// Filtered steps based on free order
const steps = computed(() => {
  if (isFreeOrder.value) {
    // For free orders: only show Cart Review and Review
    return [
      { label: 'Cart Review', id: 'cart' },
      { label: 'Confirm Order', id: 'review' }
    ]
  }
  return allSteps
})

// Methods
const fetchCart = async () => {
  loadingCart.value = true
  try {
    const response = await apiService.getCart()
    if (response.success) {
      cartData.value = response.data
      cartItems.value = response.data.items || []
      
      // Pre-fill billing info with user data if available
      const userResult = await apiService.getCurrentUser()
      if (userResult.success && userResult.data) {
        const user = userResult.data
        billingInfo.value.email = user.email || ''
        billingInfo.value.firstName = user.first_name || ''
        billingInfo.value.lastName = user.last_name || ''
      }
    } else {
      toast.error(response.error || 'Failed to load cart')
      router.push({ name: 'influencer-home', params: { username: currentUsername.value } })
    }
  } catch (error) {
    console.error('Error fetching cart:', error)
    toast.error('Failed to load cart. Please try again.')
    router.push({ name: 'influencer-home', params: { username: currentUsername.value } })
  } finally {
    loadingCart.value = false
  }
}

const getItemName = (item) => {
  if (item.item_name) return item.item_name
  if (item.item) {
    return item.item.title || item.item.name || 'Unknown Item'
  }
  return item.name || 'Unknown Item'
}

const getItemImage = (item) => {
  if (item.image_url) return item.image_url
  if (item.item) {
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
  if (item.price_cents !== undefined) {
    return item.price_cents / 100
  }
  if (typeof item.price === 'number') {
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

const handleImageError = (event) => {
  event.target.src = '/media-placeholder.jpg'
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
      toast.success('Quantity updated')
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

const handleRemoveItem = async (itemId) => {
  if (removingItemId.value === itemId) return
  
  removingItemId.value = itemId
  try {
    const response = await apiService.removeCartItem(itemId)
    if (response.success) {
      await fetchCart()
      toast.success('Item removed from cart')
      
      // If cart is empty, go back
      if (cartItems.value.length === 0) {
        router.push({ name: 'influencer-home', params: { username: currentUsername.value } })
      }
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

const nextStep = async () => {
  if (isFreeOrder.value) {
    // For free orders: Step 0 (Cart) → Step 1 (Review)
    if (currentStep.value === 0) {
      currentStep.value = 1 // Skip directly to Review
    }
  } else {
    // For paid orders: normal flow
    if (currentStep.value < allSteps.length - 1) {
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// Free order handler
const handleFreeOrder = async () => {
  if (!agreeToTerms.value) {
    errorMessage.value = 'Please agree to the terms and conditions'
    return
  }
  
  processingOrder.value = true
  errorMessage.value = null
  
  try {
    // Validate cart data exists
    if (!cartData.value) {
      throw new Error('Cart data is missing. Please refresh and try again.')
    }
    
    // Get cart_id from cart data (could be id or cart_id field)
    const cartId = cartData.value.id || cartData.value.cart_id || cartData.value.data?.id || cartData.value.data?.cart_id
    
    if (!cartId) {
      console.error('Cart data structure:', cartData.value)
      throw new Error('Cart ID is missing. Please refresh your cart and try again.')
    }
    
    // For free orders, billing info is optional - use minimal data
    const orderData = {
      cart_id: cartId
    }
    
    if (billingInfo.value.email) orderData.email = billingInfo.value.email
    if (billingInfo.value.firstName || billingInfo.value.lastName) {
      orderData.name = `${billingInfo.value.firstName || ''} ${billingInfo.value.lastName || ''}`.trim()
    }
    
    console.log('Creating free order with data:', orderData)
    
    const result = await apiService.createOrderFromCart(orderData)
    
    if (result.success) {
      // Emit order complete event
      const orderData = result.data?.data || result.data
      const orderIdValue = orderData.id || orderData.order_id
      
      // Use is_free flag from backend response if available, otherwise default to true for free orders
      const isFree = orderData.is_free !== undefined ? orderData.is_free : true
      
      toast.success('Your free order has been confirmed!')
      
      emit('order-complete', {
        orderId: orderIdValue,
        order: orderData,
        isFree: isFree
      })
      
      // Navigate to success page or home
      router.push({ name: 'influencer-home', params: { username: currentUsername.value } })
    } else {
      throw new Error(result.error || 'Failed to create order')
    }
  } catch (error) {
    console.error('Error creating free order:', error)
    errorMessage.value = error.message || 'Failed to complete free order. Please try again.'
    toast.error(error.message || 'Failed to complete free order')
  } finally {
    processingOrder.value = false
  }
}

const initializePayment = async () => {
  loadingPayment.value = true
  paymentError.value = null
  
  try {
    // Validate cart data exists
    if (!cartData.value) {
      throw new Error('Cart data is missing. Please refresh and try again.')
    }
    
    // Get cart_id from cart data (could be id or cart_id field)
    const cartId = cartData.value.id || cartData.value.cart_id || cartData.value.data?.id || cartData.value.data?.cart_id
    
    if (!cartId) {
      console.error('Cart data structure:', cartData.value)
      throw new Error('Cart ID is missing. Please refresh your cart and try again.')
    }
    
    // Create order first - include cart_id and billing info
    const orderData = {
      cart_id: cartId,
      name: `${billingInfo.value.firstName || ''} ${billingInfo.value.lastName || ''}`.trim(),
      email: billingInfo.value.email,
    }
    
    console.log('Creating paid order with data:', { cart_id: orderData.cart_id, has_billing: !!orderData.email })
    
    const orderResult = await apiService.createOrderFromCart(orderData)
    if (!orderResult.success) {
      throw new Error(orderResult.error || 'Failed to create order')
    }
    
    // Extract order ID from response
    const extractedOrderId = orderResult.data?.data?.id || orderResult.data?.data?.order_id || orderResult.data?.id || orderResult.data?.order_id
    
    if (!extractedOrderId) {
      console.error('Full order response:', JSON.stringify(orderResult, null, 2))
      throw new Error('Order created but order ID is missing from response')
    }
    
    orderId.value = extractedOrderId
    
    // Validate orderId is a number before sending
    if (typeof orderId.value !== 'number' || isNaN(orderId.value)) {
      throw new Error(`Invalid order ID: ${orderId.value}`)
    }
    
    console.log('Creating payment checkout for order ID:', orderId.value)
    
    // Create payment intent/checkout session (should return redirect_url)
    const intentResult = await apiService.createPaymentIntent(orderId.value)
    if (!intentResult.success) {
      throw new Error(intentResult.error || 'Failed to create payment checkout')
    }
    
    // Extract redirect_url from response
    const responseData = intentResult.data?.data || intentResult.data
    const redirectUrl = responseData.redirect_url || responseData.checkout_url || responseData.url
    
    if (!redirectUrl) {
      throw new Error('Payment checkout URL is missing. Please contact support.')
    }
    
    // Store current path for cancel redirect
    sessionStorage.setItem('checkout_redirect_path', window.location.pathname)
    
    // Redirect to Stripe Hosted Checkout
    // Keep loading state visible until redirect happens to prevent double clicks
    window.location.href = redirectUrl
  } catch (error) {
    console.error('Error initializing payment:', error)
    paymentError.value = error.message || 'Failed to initialize payment'
    toast.error(error.message || 'Failed to initialize payment')
    loadingPayment.value = false
  }
  // Note: loadingPayment stays true during redirect to prevent double clicks
}

const handlePayment = async () => {
  // Initialize payment and redirect to Stripe Hosted Checkout
  await initializePayment()
}

const completePurchase = async () => {
  if (!agreeToTerms.value) {
    errorMessage.value = 'Please agree to the terms and conditions'
    return
  }
  
  // For paid orders, redirect to Stripe Hosted Checkout
  if (!isFreeOrder.value) {
    processingPayment.value = true
    errorMessage.value = null
    
    try {
      await initializePayment()
    } catch (error) {
      console.error('Error initializing payment:', error)
      errorMessage.value = error.message || 'Failed to initialize payment. Please try again.'
      toast.error(error.message || 'Failed to initialize payment')
      processingPayment.value = false
    }
    // Note: processingPayment stays true during redirect to prevent double clicks
    return
  }
  
  // For free orders, use the existing handleFreeOrder function
  await handleFreeOrder()
}

// Watch for step changes
watch(currentStep, (newStep) => {
  // Reset payment error when moving to payment step
  if (newStep === 2 && !isFreeOrder.value) {
    paymentError.value = null
  }
})

onMounted(async () => {
  await fetchCart()
})
</script>

