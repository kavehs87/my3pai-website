<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading order details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="$emit('back')"
        class="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        Go Back
      </button>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="max-w-4xl mx-auto space-y-6">
      <!-- Order Header -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-primary mb-2">{{ order.order_number }}</h1>
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
            <span
              v-if="order.perspective"
              class="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
            >
              {{ order.perspective === 'purchased' ? 'Purchased' : 'Sold' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
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
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
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
          <div
            v-if="order.perspective === 'sold' && getPlatformFee() > 0"
            class="flex justify-between text-base"
          >
            <span class="text-text-muted">Platform Fee</span>
            <PriceDisplay :amount="getPlatformFee()" class="font-semibold text-primary" />
          </div>
          <div
            v-if="order.perspective === 'sold' && getInfluencerPayout() > 0"
            class="flex justify-between text-base text-green-600"
          >
            <span>Your Payout</span>
            <PriceDisplay :amount="getInfluencerPayout()" class="font-semibold" />
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
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Billing Information</h2>
        <div class="space-y-2 text-text-muted">
          <p><strong class="text-primary">Email:</strong> {{ order.billing_email }}</p>
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
      <div v-if="order.payments && order.payments.length > 0" class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Payment Information</h2>
        <div
          v-for="payment in order.payments"
          :key="payment.id"
          class="space-y-2 p-4 border border-slate-200 rounded-xl"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm text-text-muted">
                <strong class="text-primary">Payment Method:</strong> {{ payment.payment_method || 'Credit Card' }}
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
              <p v-if="payment.stripe_payment_intent_id" class="text-sm text-text-muted">
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

      <!-- Invoice Link -->
      <div v-if="order.invoice" class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Invoice</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-muted">Invoice Number: <strong class="text-primary">{{ order.invoice.invoice_number }}</strong></p>
            <p class="text-sm text-text-muted mt-1">Created: {{ formatDate(order.invoice.created_at) }}</p>
          </div>
          <button
            @click="viewInvoice(order.invoice.id)"
            class="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View Invoice
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Actions</h2>
        <div class="flex flex-wrap gap-4">
          <button
            v-if="canCancel()"
            @click="handleCancel"
            :disabled="processing"
            class="px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Order
          </button>
          <button
            v-if="canRequestRefund()"
            @click="handleRequestRefund"
            :disabled="processing"
            class="px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Refund
          </button>
          <button
            @click="handleDownloadReceipt"
            :disabled="processing"
            class="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PriceDisplay from '../../../themes/dark-blue/components/PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'

const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['back', 'view-invoice'])

// State
const order = ref(null)
const loading = ref(false)
const error = ref(null)
const processing = ref(false)

// Methods
const fetchOrder = async () => {
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

const handleCancel = async () => {
  if (!confirm(`Are you sure you want to cancel order ${order.value.order_number}?`)) {
    return
  }

  processing.value = true
  try {
    const reason = prompt('Please provide a reason for cancelling this order:')
    if (reason === null) {
      processing.value = false
      return
    }
    if (!reason || reason.trim() === '') {
      toast.error('A cancellation reason is required.')
      processing.value = false
      return
    }

    const result = await apiService.cancelOrder(order.value.id, reason.trim())
    if (result.success) {
      toast.success('Order cancelled successfully')
      await fetchOrder()
    } else {
      throw new Error(result.error || 'Failed to cancel order')
    }
  } catch (err) {
    console.error('Error cancelling order:', err)
    toast.error(err.message || 'Failed to cancel order. Please try again.')
  } finally {
    processing.value = false
  }
}

const handleRequestRefund = async () => {
  const reason = prompt('Please provide a reason for the refund (optional):')
  if (reason === null) return

  processing.value = true
  try {
    const result = await apiService.requestRefund(order.value.id, reason || undefined)
    if (result.success) {
      toast.success('Refund request submitted successfully')
      await fetchOrder()
    } else {
      throw new Error(result.error || 'Failed to request refund')
    }
  } catch (err) {
    console.error('Error requesting refund:', err)
    toast.error(err.message || 'Failed to request refund. Please try again.')
  } finally {
    processing.value = false
  }
}

const handleDownloadReceipt = () => {
  toast.info('Receipt download feature coming soon')
}

const viewInvoice = (invoiceId) => {
  emit('view-invoice', invoiceId)
}

const canCancel = () => {
  if (!order.value) return false
  return order.value.status === 'pending' && order.value.payment_status === 'pending'
}

const canRequestRefund = () => {
  if (!order.value) return false
  return (
    order.value.status === 'completed' &&
    order.value.payment_status === 'paid' &&
    order.value.payment_status !== 'refunded' &&
    order.value.payment_status !== 'partially_refunded'
  )
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

const formatDateTime = (dateString, timezone = null) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  
  // If timezone is provided, use it; otherwise use browser's timezone
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone || undefined
  }
  
  return date.toLocaleString('en-US', options)
}

// Format scheduled time with timezone awareness
const formatScheduledTime = (dateString, itemMetadata) => {
  if (!dateString) return 'N/A'
  
  // Get influencer timezone from metadata if available
  const influencerTimezone = itemMetadata?.influencer_timezone || itemMetadata?.timezone || null
  
  // Determine which timezone to use based on perspective
  let targetTimezone = null
  let showTimezoneNote = false
  
  if (order.value?.perspective === 'sold') {
    // Influencer view: use influencer's timezone if available, otherwise UTC
    targetTimezone = influencerTimezone || 'UTC'
    showTimezoneNote = true
  } else {
    // Customer view: use customer's browser timezone
    targetTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  
  const formatted = formatDateTime(dateString, targetTimezone)
  
  // Add timezone note for influencer view or if using UTC
  if (showTimezoneNote || targetTimezone === 'UTC') {
    const date = new Date(dateString)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      timeZoneName: 'short'
    })
    const parts = formatter.formatToParts(date)
    const tzName = parts.find(part => part.type === 'timeZoneName')?.value || targetTimezone
    
    return `${formatted} (${tzName})`
  }
  
  return formatted
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

const getPlatformFee = () => {
  if (order.value?.platform_fee_amount_cents !== undefined) {
    return order.value.platform_fee_amount_cents / 100
  }
  return 0
}

const getInfluencerPayout = () => {
  if (order.value?.influencer_payout_amount_cents !== undefined) {
    return order.value.influencer_payout_amount_cents / 100
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

onMounted(() => {
  fetchOrder()
})
</script>

