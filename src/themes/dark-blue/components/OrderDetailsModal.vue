<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 class="text-2xl font-bold text-primary">Order Confirmation</h2>
          <button
            @click="handleClose"
            class="text-text-muted hover:text-primary transition-colors p-2"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12 text-text-muted">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading order details...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p class="text-red-600 mb-4">{{ error }}</p>
            <button
              @click="handleClose"
              class="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>

          <!-- Order Details -->
          <div v-else-if="order" class="space-y-6">
            <!-- Order Header -->
            <div class="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 class="text-3xl font-bold text-primary mb-2">{{ order.order_number || `Order #${order.id}` }}</h1>
                  <p class="text-text-muted">{{ formatDate(order.created_at) }}</p>
                </div>
                <div class="flex flex-col gap-2 items-start md:items-end">
                  <span
                    :class="[
                      'px-4 py-2 rounded-full text-sm font-semibold',
                      getStatusBadgeClass(order.status)
                    ]"
                  >
                    {{ formatStatus(order.status) }}
                  </span>
                  <span
                    :class="[
                      'px-4 py-2 rounded-full text-sm font-semibold',
                      getPaymentStatusBadgeClass(order.payment_status)
                    ]"
                  >
                    {{ formatPaymentStatus(order.payment_status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <i class="fas fa-check-circle text-green-600 text-2xl"></i>
              <div>
                <p class="font-semibold text-green-800">Order completed successfully!</p>
                <p class="text-sm text-green-700">Your order has been confirmed and processed.</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="bg-white rounded-xl p-6 border border-slate-100">
              <h2 class="text-2xl font-bold text-primary mb-6">Order Items</h2>
              <div class="space-y-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex gap-4 p-4 border border-slate-200 rounded-xl"
                >
                  <div class="flex-1">
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h3 class="font-bold text-primary text-lg mb-1">{{ item.item_name }}</h3>
                        <span
                          :class="[
                            'inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2',
                            getItemTypeBadgeClass(item.item_type)
                          ]"
                        >
                          {{ getItemTypeLabel(item.item_type) }}
                        </span>
                      </div>
                      <PriceDisplay
                        :amount="getItemTotalPrice(item)"
                        class="font-bold text-secondary text-lg"
                      />
                    </div>
                    <p v-if="item.item_description" class="text-sm text-text-muted mb-2">
                      {{ item.item_description }}
                    </p>
                    <div class="flex items-center gap-4 text-sm text-text-muted">
                      <span>Quantity: <strong class="text-primary">{{ item.quantity }}</strong></span>
                      <span>
                        Unit Price: <PriceDisplay :amount="getItemUnitPrice(item)" />
                      </span>
                    </div>
                    <div v-if="item.metadata" class="mt-2 text-xs text-text-muted">
                      <div v-if="item.metadata.scheduled_at" class="mb-1">
                        Scheduled: {{ formatScheduledTime(item.metadata.scheduled_at, item.metadata) }}
                      </div>
                      <div v-if="item.metadata.duration" class="mb-1">
                        Duration: {{ item.metadata.duration }} minutes
                      </div>
                      <div v-if="item.metadata.access_type" class="mb-1">
                        Access: {{ item.metadata.access_type }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="bg-white rounded-xl p-6 border border-slate-100">
              <h2 class="text-2xl font-bold text-primary mb-6">Order Summary</h2>
              <div class="space-y-3">
                <div class="flex justify-between text-base">
                  <span class="text-text-muted">Subtotal</span>
                  <PriceDisplay :amount="getSubtotal()" class="font-semibold text-primary" />
                </div>
                <div v-if="getTax() > 0" class="flex justify-between text-base">
                  <span class="text-text-muted">Tax</span>
                  <PriceDisplay :amount="getTax()" class="font-semibold text-primary" />
                </div>
                <div v-if="getDiscount() > 0" class="flex justify-between text-base text-green-600">
                  <span>Discount</span>
                  <PriceDisplay :amount="getDiscount()" class="font-semibold" />
                </div>
                <div class="border-t border-slate-200 pt-4 mt-4">
                  <div class="flex justify-between text-2xl font-bold text-secondary">
                    <span>Total</span>
                    <PriceDisplay :amount="getTotal()" class="text-3xl font-bold text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing Information -->
            <div v-if="order.billing_email || order.billing_name" class="bg-white rounded-xl p-6 border border-slate-100">
              <h2 class="text-2xl font-bold text-primary mb-6">Billing Information</h2>
              <div class="space-y-2 text-text-muted">
                <p v-if="order.billing_email"><strong class="text-primary">Email:</strong> {{ order.billing_email }}</p>
                <p v-if="order.billing_name">
                  <strong class="text-primary">Name:</strong> {{ order.billing_name }}
                </p>
                <div v-if="order.billing_address">
                  <p><strong class="text-primary">Address:</strong></p>
                  <div class="ml-4 space-y-1">
                    <p>{{ order.billing_address.line1 || order.billing_address.address_line1 }}</p>
                    <p v-if="order.billing_address.line2 || order.billing_address.address_line2">
                      {{ order.billing_address.line2 || order.billing_address.address_line2 }}
                    </p>
                    <p>
                      {{ order.billing_address.city }}, {{ order.billing_address.state }}
                      {{ order.billing_address.postal_code }}
                    </p>
                    <p>{{ order.billing_address.country }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div v-if="order.payments && order.payments.length > 0" class="bg-white rounded-xl p-6 border border-slate-100">
              <h2 class="text-2xl font-bold text-primary mb-6">Payment Information</h2>
              <div
                v-for="payment in order.payments"
                :key="payment.id"
                class="space-y-2 p-4 border border-slate-200 rounded-xl"
              >
                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <p class="text-sm text-text-muted">
                      <strong class="text-primary">Payment Method:</strong> 
                      <span v-if="payment.payment_method === 'free'" class="text-green-600 font-semibold">
                        Free - No payment required
                      </span>
                      <span v-else>{{ payment.payment_method || 'Credit Card' }}</span>
                    </p>
                    <p class="text-sm text-text-muted">
                      <strong class="text-primary">Status:</strong>
                      <span
                        :class="[
                          'ml-2 px-3 py-1 rounded-full text-xs font-semibold',
                          getPaymentStatusBadgeClass(payment.status)
                        ]"
                      >
                        {{ formatPaymentStatus(payment.status) }}
                      </span>
                    </p>
                    <p v-if="payment.stripe_payment_intent_id && payment.payment_method !== 'free'" class="text-sm text-text-muted">
                      <strong class="text-primary">Transaction ID:</strong> {{ payment.stripe_payment_intent_id }}
                    </p>
                    <p v-if="payment.processed_at" class="text-sm text-text-muted">
                      <strong class="text-primary">Processed:</strong> {{ formatDateTime(payment.processed_at) }}
                    </p>
                  </div>
                  <PriceDisplay
                    :amount="getPaymentAmount(payment)"
                    class="font-bold text-secondary text-lg"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-4 pt-4">
              <button
                @click="handleClose"
                class="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                v-if="order.invoice"
                @click="handleViewInvoice"
                class="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
              >
                View Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: [Number, String],
    default: null
  },
  orderData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'view-invoice'])

// State
const order = ref(null)
const loading = ref(false)
const error = ref(null)

// Methods
const fetchOrder = async () => {
  if (!props.orderId) {
    // If orderData is provided directly, use it
    if (props.orderData) {
      order.value = props.orderData
      return
    }
    error.value = 'Order ID is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await apiService.getOrder(props.orderId)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      order.value = backendResponse
    } else {
      throw new Error(result.error || 'Failed to fetch order details')
    }
  } catch (err) {
    console.error('Error fetching order:', err)
    error.value = err.message || 'Failed to load order details. Please try again.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const handleViewInvoice = () => {
  if (order.value?.invoice?.id) {
    emit('view-invoice', order.value.invoice.id)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatScheduledTime = (dateString, itemMetadata) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: itemMetadata?.influencer_timezone || itemMetadata?.timezone || undefined
  })
}

const formatStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  }
  return statusMap[status] || status
}

const formatPaymentStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    paid: 'Paid',
    free: 'Free',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-red-100 text-red-800',
    partially_refunded: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

const getPaymentStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    free: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-red-100 text-red-800',
    partially_refunded: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

const getItemTypeLabel = (itemType) => {
  const typeMap = {
    consultation: 'Consultation',
    masterclass: 'Masterclass',
    media_asset: 'Media Asset',
    map: 'Travel Map',
    course: 'Course'
  }
  return typeMap[itemType] || itemType
}

const getItemTypeBadgeClass = (itemType) => {
  const classes = {
    consultation: 'bg-purple-100 text-purple-800',
    masterclass: 'bg-blue-100 text-blue-800',
    media_asset: 'bg-green-100 text-green-800',
    map: 'bg-orange-100 text-orange-800',
    course: 'bg-teal-100 text-teal-800'
  }
  return classes[itemType] || 'bg-slate-100 text-slate-800'
}

const getItemUnitPrice = (item) => {
  if (item.unit_price_cents !== undefined) {
    return item.unit_price_cents / 100
  }
  return 0
}

const getItemTotalPrice = (item) => {
  if (item.total_price_cents !== undefined) {
    return item.total_price_cents / 100
  }
  return getItemUnitPrice(item) * (item.quantity || 1)
}

const getSubtotal = () => {
  if (order.value?.subtotal_cents !== undefined) {
    return order.value.subtotal_cents / 100
  }
  return 0
}

const getTax = () => {
  if (order.value?.tax_amount_cents !== undefined) {
    return order.value.tax_amount_cents / 100
  }
  return 0
}

const getDiscount = () => {
  if (order.value?.discount_amount_cents !== undefined) {
    return order.value.discount_amount_cents / 100
  }
  return 0
}

const getTotal = () => {
  if (order.value?.total_amount_cents !== undefined) {
    return order.value.total_amount_cents / 100
  }
  return 0
}

const getPaymentAmount = (payment) => {
  if (payment.amount_cents !== undefined) {
    return payment.amount_cents / 100
  }
  return 0
}

// Watch for modal opening and fetch order
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset state
    order.value = props.orderData || null
    error.value = null
    // Fetch order if we have orderId
    if (props.orderId) {
      fetchOrder()
    } else if (props.orderData) {
      // Use provided order data directly
      order.value = props.orderData
    }
  }
})
</script>

