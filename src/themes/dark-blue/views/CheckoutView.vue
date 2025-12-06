<template>
  <div class="min-h-screen bg-surface pt-28 pb-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Back Button -->
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" /> Back to Cart
      </button>

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
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                  currentStep > index
                    ? 'bg-secondary text-white'
                    : currentStep === index
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-text-muted'
                ]"
              >
                <Check v-if="currentStep > index" class="w-6 h-6" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span
                :class="[
                  'mt-2 text-xs font-medium text-center',
                  currentStep >= index ? 'text-primary' : 'text-text-muted'
                ]"
              >
                {{ step.label }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'h-1 flex-1 mx-2 transition-colors',
                currentStep > index ? 'bg-secondary' : 'bg-slate-200'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="max-w-4xl mx-auto">
        <!-- Step 1: Cart Review -->
        <div v-if="currentStep === 0" class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          <h2 class="text-2xl font-bold text-primary mb-6">Review Your Cart</h2>
          
          <div v-if="loadingCart" class="text-center py-12">
            <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-text-muted">Loading cart...</p>
          </div>

          <div v-else-if="cartItems.length === 0" class="text-center py-12">
            <ShoppingCart class="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
            <p class="text-text-muted mb-4">Your cart is empty</p>
            <button @click="$emit('back')" class="text-secondary font-semibold hover:underline">
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
                      <h3 class="font-bold text-primary leading-tight">{{ getItemName(item) }}</h3>
                      <span
                        v-if="getItemPriceInDollars(item) === 0"
                        class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full"
                      >
                        Free
                      </span>
                    </div>
                    <p class="text-xs text-text-light uppercase font-semibold">{{ getItemTypeLabel(item) }}</p>
                  </div>
                  <button
                    @click="handleRemoveItem(item.id)"
                    :disabled="removingItemId === item.id"
                    class="ml-2 text-text-muted hover:text-red-500 transition-colors p-1 disabled:opacity-50"
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
                      <Minus class="w-4 h-4 text-text-muted" />
                    </button>
                    <span class="text-sm font-semibold text-primary min-w-[24px] text-center">{{ item.quantity || 1 }}</span>
                    <button
                      @click="updateQuantity(item, (item.quantity || 1) + 1)"
                      :disabled="updatingItemId === item.id"
                      class="p-1.5 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus class="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                  <PriceDisplay :amount="getItemPriceInDollars(item) * (item.quantity || 1)" class="font-bold text-secondary" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="cartItems.length > 0" class="border-t border-slate-200 pt-6">
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-text-muted font-medium">Subtotal</span>
                <PriceDisplay :amount="subtotal" class="font-bold text-primary" />
              </div>
              <div v-if="tax > 0" class="flex justify-between items-center">
                <span class="text-text-muted font-medium">Tax</span>
                <PriceDisplay :amount="tax" class="font-bold text-primary" />
              </div>
              <div v-else class="text-xs text-text-light text-center py-2">
                Taxes calculated at checkout
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-slate-200">
                <span class="text-lg font-bold text-primary">Total</span>
                <PriceDisplay :amount="total" class="text-xl font-bold text-secondary" />
              </div>
            </div>
            <button
              @click="nextStep"
              class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
            >
              {{ isFreeOrder ? 'Continue to Confirm' : 'Continue to Billing' }}
            </button>
          </div>
        </div>

        <!-- Step 2: Billing Information (Skip for free orders) -->
        <div v-if="currentStep === 1 && !isFreeOrder" class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          <h2 class="text-2xl font-bold text-primary mb-6">Billing Information</h2>
          
          <form @submit.prevent="nextStep" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-primary mb-2">Full Name *</label>
                <input
                  v-model="billingInfo.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-2">Email Address *</label>
                <input
                  v-model="billingInfo.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-2">Address Line 1 *</label>
              <input
                v-model="billingInfo.address_line1"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-2">Address Line 2 (Optional)</label>
              <input
                v-model="billingInfo.address_line2"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Apt 4B"
              />
            </div>

            <div class="grid md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-primary mb-2">City *</label>
                <input
                  v-model="billingInfo.city"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="New York"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-2">State/Province *</label>
                <input
                  v-model="billingInfo.state"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="NY"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-2">Postal/ZIP Code *</label>
                <input
                  v-model="billingInfo.postal_code"
                  type="text"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="10001"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-2">Country *</label>
              <select
                v-model="billingInfo.country"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <!-- Add more countries as needed -->
              </select>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 bg-white text-primary border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                class="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>

        <!-- Step 3: Payment Method (Skip for free orders) -->
        <div v-show="currentStep === 2 && !isFreeOrder" class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          <h2 class="text-2xl font-bold text-primary mb-6">Payment Method</h2>
          
          <div v-if="loadingPayment" class="text-center py-12">
            <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-text-muted">Setting up payment...</p>
          </div>

          <div v-else>
            <!-- Stripe Elements will be mounted here -->
            <!-- Using v-show instead of v-if to keep element mounted when hidden -->
            <div ref="stripeCardElementRef" id="stripe-card-element" class="mb-6" v-show="!loadingPayment">
              <!-- Stripe Card Element will be inserted here -->
            </div>

            <div v-if="paymentError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-sm text-red-600">{{ paymentError }}</p>
            </div>

            <!-- Security Badges -->
            <div class="flex items-center justify-center gap-4 mb-6 text-xs text-text-muted">
              <div class="flex items-center gap-2">
                <Lock class="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div class="flex items-center gap-2">
                <Shield class="w-4 h-4" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="prevStep"
                class="flex-1 bg-white text-primary border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                @click="handlePayment"
                :disabled="processingPayment"
                class="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ processingPayment ? 'Processing...' : 'Continue to Review' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Review & Confirm (Step 2 for free orders) -->
        <div v-if="(currentStep === 3 && !isFreeOrder) || (currentStep === 1 && isFreeOrder)" class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
          <h2 class="text-2xl font-bold text-primary mb-6">Review & Confirm</h2>
          
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
            <h3 class="font-bold text-primary mb-4">Order Summary</h3>
            <div class="space-y-3 mb-4">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="flex justify-between text-sm"
              >
                <span class="text-text-muted">{{ getItemName(item) }} x{{ item.quantity || 1 }}</span>
                <PriceDisplay :amount="getItemPriceInDollars(item) * (item.quantity || 1)" />
              </div>
            </div>
            <div class="border-t border-slate-200 pt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-text-muted">Subtotal</span>
                <PriceDisplay :amount="subtotal" />
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-text-muted">Tax</span>
                <PriceDisplay :amount="tax" />
              </div>
              <div class="flex justify-between items-center font-bold text-lg pt-2 border-t border-slate-200">
                <span class="text-primary">Total</span>
                <PriceDisplay :amount="total" class="text-secondary" />
              </div>
            </div>
          </div>

          <!-- Billing Information (Only for paid orders) -->
          <div v-if="!isFreeOrder" class="mb-8">
            <h3 class="font-bold text-primary mb-4">Billing Information</h3>
            <div class="text-sm text-text-muted space-y-1">
              <p>{{ billingInfo.name }}</p>
              <p>{{ billingInfo.email }}</p>
              <p>{{ billingInfo.address_line1 }}</p>
              <p v-if="billingInfo.address_line2">{{ billingInfo.address_line2 }}</p>
              <p>{{ billingInfo.city }}, {{ billingInfo.state }} {{ billingInfo.postal_code }}</p>
              <p>{{ billingInfo.country }}</p>
            </div>
          </div>
          
          <!-- Payment Method (Only for paid orders) -->
          <div v-if="!isFreeOrder && paymentIntent" class="mb-8">
            <h3 class="font-bold text-primary mb-4">Payment Method</h3>
            <div class="text-sm text-text-muted">
              <p>Card ending in •••• (entered in payment step)</p>
            </div>
          </div>
          
          <!-- Free Order Payment Info -->
          <div v-if="isFreeOrder" class="mb-8">
            <h3 class="font-bold text-primary mb-4">Payment Information</h3>
            <div class="text-sm text-text-muted">
              <p class="text-green-600 font-semibold">Free - No payment required</p>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="mb-8">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="agreeToTerms"
                type="checkbox"
                required
                class="mt-1 w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary"
              />
              <span class="text-sm text-text-muted">
                I agree to the <a href="#" class="text-secondary hover:underline">Terms and Conditions</a> and
                <a href="#" class="text-secondary hover:underline">Privacy Policy</a>
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
              class="flex-1 bg-white text-primary border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              @click="isFreeOrder ? handleFreeOrder() : completePurchase()"
              :disabled="!agreeToTerms || processingOrder"
              class="flex-1 bg-secondary text-white py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processingOrder ? 'Processing...' : (isFreeOrder ? 'Complete Free Order' : 'Complete Purchase') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ArrowLeft, Check, ShoppingCart, Lock, Shield, Trash2, Plus, Minus } from 'lucide-vue-next'
import { loadStripe } from '@stripe/stripe-js'
import PriceDisplay from '../components/PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'

const emit = defineEmits(['back', 'order-complete'])

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
  name: '',
  email: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US'
})

// Payment
const stripe = ref(null)
const cardElement = ref(null)
const stripeCardElementRef = ref(null) // Template ref for the container
const paymentIntent = ref(null)
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
        billingInfo.value.name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || ''
      }
    } else {
      toast.error(response.error || 'Failed to load cart')
      emit('back')
    }
  } catch (error) {
    console.error('Error fetching cart:', error)
    toast.error('Failed to load cart. Please try again.')
    emit('back')
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
        emit('back')
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
      
      // Wait for Vue to render the new step before initializing Stripe
      await nextTick()
      
      // Initialize Stripe when moving to payment step (step 2)
      // Only initialize if not already initialized and not currently loading
      if (currentStep.value === 2 && !paymentIntent.value && !loadingPayment.value) {
        // Small delay to ensure the DOM element is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100))
        initializeStripe()
      }
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
    // Only include fields that are actually set (not empty strings)
    const orderData = {
      cart_id: cartId
    }
    
    if (billingInfo.value.email) orderData.email = billingInfo.value.email
    if (billingInfo.value.name) orderData.name = billingInfo.value.name
    
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

const initializeStripe = async () => {
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
      ...billingInfo.value
    }
    
    console.log('Creating paid order with data:', { cart_id: orderData.cart_id, has_billing: !!orderData.email })
    
    const orderResult = await apiService.createOrderFromCart(orderData)
    if (!orderResult.success) {
      throw new Error(orderResult.error || 'Failed to create order')
    }
    
    // Debug: Log order response to see structure
    console.log('Order creation response:', orderResult)
    console.log('Order data object:', orderResult.data)
    console.log('Order data.data:', orderResult.data?.data)
    console.log('Order data.data keys:', orderResult.data?.data ? Object.keys(orderResult.data.data) : 'no data')
    console.log('Order data.data.id:', orderResult.data?.data?.id)
    console.log('Order data.data.order_id:', orderResult.data?.data?.order_id)
    
    // Extract order ID from response
    // The API service wraps the backend response, so we need to access data.data
    // Backend returns: { success: true, data: { id: 123, ... }, message: "..." }
    // API service returns: { success: true, data: { success: true, data: { id: 123, ... }, message: "..." } }
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
    
    // Double-check orderId is set before API call
    if (!orderId.value) {
      throw new Error('Order ID is required but was not set')
    }
    
    console.log('Creating payment intent for order ID:', orderId.value)
    
    // Create payment intent
    const intentResult = await apiService.createPaymentIntent(orderId.value)
    if (!intentResult.success) {
      throw new Error(intentResult.error || 'Failed to create payment intent')
    }
    
    // Store payment intent data (unwrap if needed, same as order response)
    // Backend returns: { success: true, data: { client_secret: "...", payment_intent_id: "..." } }
    // API service returns: { success: true, data: { success: true, data: { ... } } }
    paymentIntent.value = intentResult.data?.data || intentResult.data
    
    console.log('Payment intent stored:', paymentIntent.value)
    console.log('Payment intent ID:', paymentIntent.value?.payment_intent_id)
    console.log('Client secret:', paymentIntent.value?.client_secret)
    
    // Initialize Stripe.js with publishable key (sandbox/test mode)
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.')
    }
    
    const stripeInstance = await loadStripe(stripePublishableKey)
    if (!stripeInstance) {
      throw new Error('Failed to load Stripe.js')
    }
    
    stripe.value = stripeInstance
    
    // Set loadingPayment to false so the element is rendered (it's in v-else block)
    loadingPayment.value = false
    await nextTick() // Wait for Vue to update the DOM after setting loadingPayment to false
    
    // Additional delay to ensure the element is fully rendered and accessible
    await new Promise(resolve => setTimeout(resolve, 150))
    
    // Try template ref first, then fallback to getElementById
    const cardElementContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
    if (!cardElementContainer) {
      // If still not found, wait a bit more and try again
      await new Promise(resolve => setTimeout(resolve, 300))
      const retryContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
      if (!retryContainer) {
        console.error('Stripe card element container not found.')
        console.error('Current step:', currentStep.value)
        console.error('Loading payment:', loadingPayment.value)
        console.error('Template ref:', stripeCardElementRef.value)
        console.error('Element by ID:', document.getElementById('stripe-card-element'))
        throw new Error('Stripe card element container not found. Please try refreshing the page.')
      }
    }
    
    const elements = stripe.value.elements()
    cardElement.value = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1e293b',
          '::placeholder': {
            color: '#94a3b8',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    })
    
    // Mount the card element to the DOM
    cardElement.value.mount('#stripe-card-element')
    
    toast.success('Payment form ready')
  } catch (error) {
    console.error('Error initializing payment:', error)
    console.error('Order ID value:', orderId.value)
    paymentError.value = error.message || 'Failed to initialize payment'
    toast.error(error.message || 'Failed to initialize payment')
  } finally {
    loadingPayment.value = false
  }
}

const handlePayment = async () => {
  // TODO: Handle Stripe payment confirmation
  // For now, just move to next step
  nextStep()
}

const completePurchase = async () => {
  if (!agreeToTerms.value) {
    errorMessage.value = 'Please agree to the terms and conditions'
    return
  }
  
  processingOrder.value = true
  errorMessage.value = null
  
  try {
    // Validate payment intent data
    if (!paymentIntent.value) {
      throw new Error('Payment intent not initialized. Please go back to payment step.')
    }
    
    const paymentIntentId = paymentIntent.value.payment_intent_id || paymentIntent.value.id
    if (!paymentIntentId) {
      console.error('Payment intent data:', paymentIntent.value)
      throw new Error('Payment intent ID is missing. Please go back to payment step and try again.')
    }
    
    // Validate Stripe.js is initialized
    if (!stripe.value || !cardElement.value) {
      throw new Error(
        'Payment form is not ready. Please go back to the payment step and try again.'
      )
    }
    
    // Verify the card element is still mounted
    try {
      // Try to access the element to verify it's still mounted
      const elementContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
      if (!elementContainer) {
        throw new Error('Card element container not found')
      }
    } catch (err) {
      throw new Error('Payment form element is not available. Please go back to the payment step and try again.')
    }
    
    if (!paymentIntent.value?.client_secret) {
      throw new Error('Payment intent client secret is missing. Please go back to the payment step.')
    }
    
    // Confirm payment with Stripe.js first
    // This will process the payment with the card details entered by the user
    console.log('Confirming payment with Stripe.js...')
    console.log('Card element:', cardElement.value)
    console.log('Stripe instance:', stripe.value)
    
    const { error, paymentIntent: confirmedIntent } = await stripe.value.confirmCardPayment(
      paymentIntent.value.client_secret,
      {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: billingInfo.value.name,
            email: billingInfo.value.email,
            address: {
              line1: billingInfo.value.address_line1,
              line2: billingInfo.value.address_line2 || undefined,
              city: billingInfo.value.city,
              state: billingInfo.value.state,
              postal_code: billingInfo.value.postal_code,
              country: billingInfo.value.country,
            },
          },
        },
      }
    )
    
    if (error) {
      // Handle Stripe errors (card declined, insufficient funds, etc.)
      throw new Error(error.message || 'Payment failed. Please check your card details and try again.')
    }
    
    if (!confirmedIntent || confirmedIntent.status !== 'succeeded') {
      throw new Error(`Payment status is '${confirmedIntent?.status || 'unknown'}', expected 'succeeded'. Please try again.`)
    }
    
    console.log('Stripe payment confirmed successfully:', confirmedIntent.id)
    
    console.log('Stripe payment confirmed, confirming with backend:', { payment_intent_id: paymentIntentId, order_id: orderId.value })
    
    // Confirm payment with backend (only after Stripe confirms)
    const confirmResult = await apiService.confirmPayment({
      payment_intent_id: paymentIntentId,
      order_id: orderId.value
    })
    
    if (!confirmResult.success) {
      throw new Error(confirmResult.error || 'Payment confirmation failed')
    }
    
    toast.success('Payment successful!')
    emit('order-complete', {
      orderId: orderId.value,
      order: confirmResult.data
    })
  } catch (error) {
    console.error('Error completing purchase:', error)
    errorMessage.value = error.message || 'Failed to complete purchase. Please try again.'
    toast.error(error.message || 'Failed to complete purchase')
  } finally {
    processingOrder.value = false
  }
}

// Watch for step changes to initialize Stripe when moving to payment step
watch(currentStep, (newStep) => {
  // Only initialize Stripe for paid orders
  if (!isFreeOrder.value && newStep === 2 && !paymentIntent.value && !loadingPayment.value) {
    // Step 2 is the payment step - initialize Stripe if not already done
    initializeStripe()
  }
})

onMounted(async () => {
  await fetchCart()
})

onBeforeUnmount(() => {
  // Cleanup Stripe Elements if mounted
  if (cardElement.value) {
    try {
      cardElement.value.unmount()
    } catch (error) {
      console.warn('Error unmounting Stripe card element:', error)
    }
    cardElement.value = null
  }
  stripe.value = null
})
</script>

