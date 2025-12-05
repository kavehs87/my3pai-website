<template>
  <div class="invoice-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading invoice details...</p>
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

    <!-- Invoice Details -->
    <div v-else-if="invoice" class="invoice-content max-w-4xl mx-auto space-y-6">
      <!-- Invoice Header -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-primary mb-2">{{ invoice.invoice_number }}</h1>
            <p class="text-text-muted">{{ formatDate(invoice.issued_at || invoice.created_at) }}</p>
          </div>
          <div class="flex flex-col gap-2 items-start md:items-end">
            <span
              :class="[
                'px-4 py-2 rounded-full text-sm font-semibold',
                getStatusBadgeClass(invoice.status)
              ]"
            >
              {{ formatStatus(invoice.status) }}
            </span>
            <span
              v-if="invoice.perspective"
              :class="[
                'px-4 py-2 rounded-full text-sm font-semibold',
                invoice.perspective === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              ]"
            >
              {{ invoice.perspective === 'paid' ? 'Paid Invoice' : 'Received Invoice' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Party Information -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Party Information</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- From -->
          <div>
            <h3 class="text-sm font-semibold text-text-muted uppercase mb-3">From</h3>
            <div class="space-y-1 text-text-muted">
              <p v-if="getFromParty().name" class="font-semibold text-primary">{{ getFromParty().name }}</p>
              <p v-if="getFromParty().email">{{ getFromParty().email }}</p>
              <div v-if="getFromParty().address" class="mt-2">
                <p v-if="getFromParty().address.line1">{{ getFromParty().address.line1 }}</p>
                <p v-if="getFromParty().address.line2">{{ getFromParty().address.line2 }}</p>
                <p v-if="getFromParty().address.city">
                  {{ getFromParty().address.city }}{{ getFromParty().address.state ? `, ${getFromParty().address.state}` : '' }}
                  {{ getFromParty().address.postal_code }}
                </p>
                <p v-if="getFromParty().address.country">{{ getFromParty().address.country }}</p>
              </div>
            </div>
          </div>
          <!-- To -->
          <div>
            <h3 class="text-sm font-semibold text-text-muted uppercase mb-3">To</h3>
            <div class="space-y-1 text-text-muted">
              <p v-if="getToParty().name" class="font-semibold text-primary">{{ getToParty().name }}</p>
              <p v-if="getToParty().email">{{ getToParty().email }}</p>
              <div v-if="getToParty().address" class="mt-2">
                <p v-if="getToParty().address.line1">{{ getToParty().address.line1 }}</p>
                <p v-if="getToParty().address.line2">{{ getToParty().address.line2 }}</p>
                <p v-if="getToParty().address.city">
                  {{ getToParty().address.city }}{{ getToParty().address.state ? `, ${getToParty().address.state}` : '' }}
                  {{ getToParty().address.postal_code }}
                </p>
                <p v-if="getToParty().address.country">{{ getToParty().address.country }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div v-if="invoice.items && invoice.items.length > 0" class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Invoice Items</h2>
        <div class="space-y-4">
          <div
            v-for="item in invoice.items"
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

      <!-- Invoice Summary -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Invoice Summary</h2>
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
            v-if="invoice.perspective === 'received' && getPlatformFee() > 0"
            class="flex justify-between text-base"
          >
            <span class="text-text-muted">Platform Fee</span>
            <PriceDisplay :amount="getPlatformFee()" class="font-semibold text-primary" />
          </div>
          <div
            v-if="invoice.perspective === 'received' && getInfluencerPayout() > 0"
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

      <!-- Payment Information -->
      <div v-if="invoice.payment" class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Payment Information</h2>
        <div class="space-y-2 text-text-muted">
          <div class="flex justify-between">
            <span><strong class="text-primary">Status:</strong></span>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getPaymentStatusBadgeClass(invoice.payment.status)
              ]"
            >
              {{ formatPaymentStatus(invoice.payment.status) }}
            </span>
          </div>
          <div v-if="invoice.payment.payment_method" class="flex justify-between">
            <span><strong class="text-primary">Payment Method:</strong></span>
            <span>{{ invoice.payment.payment_method }}</span>
          </div>
          <div v-if="invoice.payment.processed_at" class="flex justify-between">
            <span><strong class="text-primary">Payment Date:</strong></span>
            <span>{{ formatDateTime(invoice.payment.processed_at) }}</span>
          </div>
          <div v-if="invoice.payment.stripe_payment_intent_id" class="flex justify-between">
            <span><strong class="text-primary">Transaction ID:</strong></span>
            <span class="font-mono text-xs">{{ invoice.payment.stripe_payment_intent_id }}</span>
          </div>
        </div>
      </div>

      <!-- Order Link -->
      <div v-if="invoice.order" class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Related Order</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text-muted">Order Number: <strong class="text-primary">{{ invoice.order.order_number }}</strong></p>
            <p class="text-sm text-text-muted mt-1">Created: {{ formatDate(invoice.order.created_at) }}</p>
          </div>
          <button
            @click="viewOrder(invoice.order.id)"
            class="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View Order
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
        <h2 class="text-2xl font-bold text-primary mb-6">Actions</h2>
        <div class="flex flex-wrap gap-4">
          <button
            @click="handlePrint"
            class="px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <i class="fas fa-print mr-2"></i>Print Invoice
          </button>
          <button
            @click="handleDownloadPDF"
            :disabled="processing"
            class="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-download mr-2"></i>Download PDF
          </button>
          <button
            @click="handleSendEmail"
            :disabled="processing"
            class="px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-envelope mr-2"></i>Send via Email
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
  invoiceId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['back', 'view-order'])

// State
const invoice = ref(null)
const loading = ref(false)
const error = ref(null)
const processing = ref(false)

// Methods
const fetchInvoice = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await apiService.getInvoice(props.invoiceId)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      invoice.value = backendResponse
    } else {
      throw new Error(result.error || 'Failed to fetch invoice details')
    }
  } catch (err) {
    console.error('Error fetching invoice:', err)
    error.value = err.message || 'Failed to load invoice details. Please try again.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const getFromParty = () => {
  if (!invoice.value) return {}
  
  if (invoice.value.perspective === 'paid') {
    // Paid invoice: From = Influencer/Seller
    return {
      name: invoice.value.seller?.name || invoice.value.influencer?.name || 'Seller',
      email: invoice.value.seller?.email || invoice.value.influencer?.email,
      address: invoice.value.seller?.address || invoice.value.influencer?.address
    }
  } else {
    // Received invoice: From = Customer
    return {
      name: invoice.value.customer?.name || invoice.value.buyer?.name || 'Customer',
      email: invoice.value.customer?.email || invoice.value.buyer?.email || invoice.value.billing_email,
      address: invoice.value.customer?.address || invoice.value.buyer?.address || invoice.value.billing_address
    }
  }
}

const getToParty = () => {
  if (!invoice.value) return {}
  
  if (invoice.value.perspective === 'paid') {
    // Paid invoice: To = Customer (current user)
    return {
      name: invoice.value.customer?.name || invoice.value.buyer?.name || 'You',
      email: invoice.value.customer?.email || invoice.value.buyer?.email || invoice.value.billing_email,
      address: invoice.value.customer?.address || invoice.value.buyer?.address || invoice.value.billing_address
    }
  } else {
    // Received invoice: To = Influencer (current user)
    return {
      name: invoice.value.seller?.name || invoice.value.influencer?.name || 'You',
      email: invoice.value.seller?.email || invoice.value.influencer?.email,
      address: invoice.value.seller?.address || invoice.value.influencer?.address
    }
  }
}

const handlePrint = () => {
  window.print()
}

const handleDownloadPDF = async () => {
  processing.value = true
  try {
    const result = await apiService.downloadInvoice(props.invoiceId)
    if (result.success && result.data?.url) {
      // Open PDF in new tab
      window.open(result.data.url, '_blank')
      toast.success('PDF download started')
    } else {
      throw new Error(result.error || 'Failed to download PDF')
    }
  } catch (err) {
    console.error('Error downloading PDF:', err)
    toast.error(err.message || 'Failed to download PDF. Please try again.')
  } finally {
    processing.value = false
  }
}

const handleSendEmail = async () => {
  processing.value = true
  try {
    const result = await apiService.sendInvoice(props.invoiceId)
    if (result.success) {
      toast.success('Invoice sent via email successfully')
    } else {
      throw new Error(result.error || 'Failed to send invoice')
    }
  } catch (err) {
    console.error('Error sending invoice:', err)
    toast.error(err.message || 'Failed to send invoice. Please try again.')
  } finally {
    processing.value = false
  }
}

const viewOrder = (orderId) => {
  emit('view-order', orderId)
}

// Formatting helpers
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
  
  if (invoice.value?.perspective === 'received') {
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
    draft: 'Draft',
    issued: 'Issued',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
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
    draft: 'bg-gray-100 text-gray-800',
    issued: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
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

// Price helpers
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
  if (invoice.value?.subtotal_cents !== undefined) {
    return invoice.value.subtotal_cents / 100
  }
  return 0
}

const getTax = () => {
  if (invoice.value?.tax_amount_cents !== undefined) {
    return invoice.value.tax_amount_cents / 100
  }
  return 0
}

const getDiscount = () => {
  if (invoice.value?.discount_amount_cents !== undefined) {
    return invoice.value.discount_amount_cents / 100
  }
  return 0
}

const getPlatformFee = () => {
  if (invoice.value?.platform_fee_amount_cents !== undefined) {
    return invoice.value.platform_fee_amount_cents / 100
  }
  return 0
}

const getInfluencerPayout = () => {
  if (invoice.value?.influencer_payout_amount_cents !== undefined) {
    return invoice.value.influencer_payout_amount_cents / 100
  }
  return 0
}

const getTotal = () => {
  if (invoice.value?.total_amount_cents !== undefined) {
    return invoice.value.total_amount_cents / 100
  }
  return 0
}

onMounted(() => {
  fetchInvoice()
})
</script>

<style scoped>
.invoice-detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media print {
  /* Reset page margins */
  @page {
    margin: 0.75in;
    size: letter;
  }

  /* Hide loading and error states */
  .invoice-detail-container > div:first-child[class*="text-center"],
  .invoice-detail-container > div:first-child[class*="bg-red"] {
    display: none !important;
  }

  /* Make invoice content full width and remove centering */
  .invoice-detail-container {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }

  .invoice-content {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Hide all buttons and actions */
  button,
  .flex.gap-4:has(button),
  h2:has(+ .flex.gap-4 button) + .flex.gap-4 {
    display: none !important;
  }

  /* Hide "Actions" section header if it's followed by buttons */
  h2:has(+ .flex.gap-4 button) {
    display: none !important;
  }

  /* Remove shadows, rounded corners, and adjust padding for print */
  .bg-white {
    background: white !important;
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0 !important;
    padding: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Optimize spacing for print */
  .space-y-6 > * {
    margin-bottom: 1.5rem !important;
  }

  .space-y-6 > *:last-child {
    margin-bottom: 0 !important;
  }

  /* Print-friendly typography - ensure black text */
  h1, h2, h3, h4, h5, h6,
  p, span, div {
    color: #000 !important;
  }

  h1, h2, h3 {
    page-break-after: avoid;
    margin-top: 0 !important;
  }

  /* Badge styling for print - simple borders */
  span[class*="rounded-full"],
  .px-4.py-2.rounded-full,
  .px-3.py-1.rounded-full {
    background: #f3f4f6 !important;
    color: #000 !important;
    border: 1px solid #d1d5db !important;
    padding: 0.25rem 0.75rem !important;
    display: inline-block !important;
  }

  /* Remove gradients - use solid colors */
  .bg-gradient-to-br {
    background: #f3f4f6 !important;
    color: #000 !important;
  }

  /* Optimize item cards for print */
  .flex.gap-4.p-4.border {
    border: 1px solid #e5e7eb !important;
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 1rem !important;
    padding: 1rem !important;
  }

  /* Party information - ensure two columns work in print */
  .grid.md\\:grid-cols-2 {
    grid-template-columns: 1fr 1fr !important;
    gap: 2rem !important;
  }

  /* Remove text-muted styling for better contrast */
  .text-text-muted {
    color: #374151 !important;
  }

  /* Ensure proper page breaks */
  .invoice-content > div {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Header section - compact for print */
  .invoice-content > div:first-child {
    padding: 1rem !important;
    margin-bottom: 1rem !important;
  }

  /* Remove empty space at top */
  .invoice-detail-container {
    padding-top: 0 !important;
  }

  /* Ensure invoice header starts at top of page */
  .invoice-content {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }

  /* Compact header for print */
  .invoice-content > div:first-child {
    padding: 1rem !important;
    margin-bottom: 1rem !important;
    border-bottom: 2px solid #000 !important;
  }

  /* Remove large margins from first element */
  .invoice-content > div:first-child h1 {
    margin-top: 0 !important;
    margin-bottom: 0.5rem !important;
  }
}
</style>

