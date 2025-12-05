<template>
  <div class="space-y-6">
    <!-- Filter Tabs -->
    <div class="flex gap-2 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-3 font-semibold transition-colors border-b-2',
          activeTab === tab.id
            ? 'text-primary border-primary'
            : 'text-text-muted border-transparent hover:text-primary'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Filters and View Toggle -->
    <div class="flex flex-wrap gap-4 items-end justify-between">
      <div class="flex flex-wrap gap-4 items-end flex-1">
        <!-- Status Filter -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-primary mb-2">Status</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>
        </div>

        <!-- Payment Status Filter -->
        <div class="flex-1 min-w-[150px]">
          <label class="block text-sm font-medium text-primary mb-2">Payment Status</label>
          <select
            v-model="filters.payment_status"
            @change="applyFilters"
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-primary mb-2">Search Order Number</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="ORD-2025-..."
            class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>

        <!-- Clear Filters -->
        <button
          @click="clearFilters"
          class="px-4 py-2 text-text-muted hover:text-primary transition-colors"
        >
          Clear
        </button>
      </div>

      <!-- View Toggle -->
      <div class="flex gap-2 items-center">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-2 rounded-lg transition-colors',
            viewMode === 'grid'
              ? 'bg-primary text-white'
              : 'bg-white text-text-muted border border-slate-200 hover:bg-slate-50'
          ]"
          title="Grid View"
        >
          <Grid3x3 class="w-5 h-5" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-2 rounded-lg transition-colors',
            viewMode === 'list'
              ? 'bg-primary text-white'
              : 'bg-white text-text-muted border border-slate-200 hover:bg-slate-50'
          ]"
          title="List View"
        >
          <List class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Orders Grid View -->
    <div v-else-if="orders.length > 0 && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer"
        @click="viewOrder(order.id)"
      >
        <!-- Order Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-primary mb-1">{{ order.order_number }}</h3>
            <p class="text-sm text-text-muted">{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getStatusBadgeClass(order.status)
              ]"
            >
              {{ formatStatus(order.status) }}
            </span>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getPaymentStatusBadgeClass(order.payment_status)
              ]"
            >
              {{ formatPaymentStatus(order.payment_status) }}
            </span>
          </div>
        </div>

        <!-- Order Info -->
        <div class="mb-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Items:</span>
            <span class="font-semibold text-primary">{{ getItemCount(order) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Total:</span>
            <PriceDisplay
              :amount="getTotalAmount(order)"
              class="font-bold text-secondary text-lg"
            />
          </div>
          <div v-if="order.perspective" class="flex justify-between text-sm">
            <span class="text-text-muted">Type:</span>
            <span class="font-semibold text-primary">
              {{ order.perspective === 'purchased' ? 'Purchased' : 'Sold' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-slate-200">
          <button
            @click.stop="viewOrder(order.id)"
            class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View Details
          </button>
          <button
            v-if="canCancel(order)"
            @click.stop="handleCancelOrder(order)"
            class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Orders List View -->
    <div v-else-if="orders.length > 0 && viewMode === 'list'" class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="divide-y divide-slate-200">
        <div
          v-for="order in orders"
          :key="order.id"
          class="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewOrder(order.id)"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Order Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-4 mb-2">
                <h3 class="text-lg font-bold text-primary">{{ order.order_number }}</h3>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    getStatusBadgeClass(order.status)
                  ]"
                >
                  {{ formatStatus(order.status) }}
                </span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    getPaymentStatusBadgeClass(order.payment_status)
                  ]"
                >
                  {{ formatPaymentStatus(order.payment_status) }}
                </span>
                <span
                  v-if="order.perspective"
                  class="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-800"
                >
                  {{ order.perspective === 'purchased' ? 'Purchased' : 'Sold' }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span>Created: {{ formatDate(order.created_at) }}</span>
                <span>Items: {{ getItemCount(order) }}</span>
              </div>
            </div>

            <!-- Right: Total and Actions -->
            <div class="flex items-center gap-4">
              <PriceDisplay
                :amount="getTotalAmount(order)"
                class="font-bold text-xl text-secondary"
              />
              <div class="flex gap-2">
                <button
                  @click.stop="viewOrder(order.id)"
                  class="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
                <button
                  v-if="canCancel(order)"
                  @click.stop="handleCancelOrder(order)"
                  class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-text-muted">
      <ShoppingBag class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-lg mb-2">No orders found</p>
      <p class="text-sm">Try adjusting your filters or check back later.</p>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && orders.length > 0 && hasMore" class="mt-8 text-center">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loadingMore">Loading...</span>
        <span v-else>Load More</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { ShoppingBag, Grid3x3, List } from 'lucide-vue-next'
import PriceDisplay from '../../../themes/dark-blue/components/PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'

const emit = defineEmits(['view-order'])

// Tabs
const tabs = [
  { id: 'all', label: 'All Orders' },
  { id: 'purchased', label: 'Purchased' },
  { id: 'sold', label: 'Sold' }
]

const activeTab = ref('all')

// View Mode
const viewMode = ref('grid') // 'grid' or 'list'

// State
const loading = ref(false)
const loadingMore = ref(false)
const allOrders = ref([])
const purchasedOrders = ref([])
const soldOrders = ref([])
const allPage = ref(1)
const purchasedPage = ref(1)
const soldPage = ref(1)
const allHasMore = ref(false)
const purchasedHasMore = ref(false)
const soldHasMore = ref(false)

// Filters
const filters = ref({
  status: '',
  payment_status: '',
  search: '',
  from_date: '',
  to_date: ''
})

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// Computed
const displayedOrders = computed(() => {
  if (activeTab.value === 'all') {
    return allOrders.value
  } else if (activeTab.value === 'purchased') {
    return purchasedOrders.value.map(o => ({ ...o, perspective: 'purchased' }))
  } else {
    return soldOrders.value.map(o => ({ ...o, perspective: 'sold' }))
  }
})

// Apply filters to displayed orders
const orders = computed(() => {
  let filtered = displayedOrders.value

  if (filters.value.status) {
    filtered = filtered.filter(o => o.status === filters.value.status)
  }

  if (filters.value.payment_status) {
    filtered = filtered.filter(o => o.payment_status === filters.value.payment_status)
  }

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(o =>
      o.order_number?.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

// Check if there are more orders to load
const hasMore = computed(() => {
  if (activeTab.value === 'all') {
    return allHasMore.value
  } else if (activeTab.value === 'purchased') {
    return purchasedHasMore.value
  } else {
    return soldHasMore.value
  }
})

// Methods
const fetchOrders = async (reset = false) => {
  if (reset) {
    if (activeTab.value === 'all') {
      allOrders.value = []
      allPage.value = 1
    } else if (activeTab.value === 'purchased') {
      purchasedOrders.value = []
      purchasedPage.value = 1
    } else if (activeTab.value === 'sold') {
      soldOrders.value = []
      soldPage.value = 1
    }
  }

  loading.value = true

  try {
    if (activeTab.value === 'all') {
      await fetchAllOrders(reset)
    } else if (activeTab.value === 'purchased') {
      await fetchPurchasedOrders(reset)
    } else {
      await fetchSoldOrders(reset)
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    // Check if it's a 404 error (backend route issue)
    if (error.message && (error.message.includes('No query results') || error.message.includes('404'))) {
      toast.error('Order filtering is temporarily unavailable. Please use "All Orders" tab or contact support.')
    } else {
      toast.error('Failed to load orders. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

const fetchAllOrders = async (reset = true) => {
  if (reset) {
    allOrders.value = []
    allPage.value = 1
  }

  try {
    const params = {
      page: allPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.payment_status && { payment_status: filters.value.payment_status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getAllOrders(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const orders = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(orders)) {
        allOrders.value = reset ? orders : [...allOrders.value, ...orders]
        allHasMore.value = meta.current_page < meta.last_page
      } else {
        throw new Error('Invalid response format from API')
      }
    } else {
      throw new Error(result.error || 'Failed to fetch orders')
    }
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}

const fetchPurchasedOrders = async (reset = true) => {
  if (reset) {
    purchasedOrders.value = []
    purchasedPage.value = 1
  }

  try {
    const params = {
      page: purchasedPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.payment_status && { payment_status: filters.value.payment_status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getPurchasedOrders(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const orders = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(orders)) {
        purchasedOrders.value = reset ? orders : [...purchasedOrders.value, ...orders]
        purchasedHasMore.value = meta.current_page < meta.last_page
      } else {
        throw new Error('Invalid response format from API')
      }
    } else {
      throw new Error(result.error || 'Failed to fetch purchased orders')
    }
  } catch (error) {
    console.error('Error fetching purchased orders:', error)
    // Check if it's a 404 error (backend route issue)
    if (error.message && (error.message.includes('No query results') || error.message.includes('404'))) {
      throw new Error('Purchased orders endpoint not found. Please check backend routes.')
    }
    throw error
  }
}

const fetchSoldOrders = async (reset = true) => {
  if (reset) {
    soldOrders.value = []
    soldPage.value = 1
  }

  try {
    const params = {
      page: soldPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.payment_status && { payment_status: filters.value.payment_status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getSoldOrders(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const orders = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(orders)) {
        soldOrders.value = reset ? orders : [...soldOrders.value, ...orders]
        soldHasMore.value = meta.current_page < meta.last_page
      } else {
        throw new Error('Invalid response format from API')
      }
    } else {
      throw new Error(result.error || 'Failed to fetch sold orders')
    }
  } catch (error) {
    console.error('Error fetching sold orders:', error)
    // Check if it's a 404 error (backend route issue)
    if (error.message && (error.message.includes('No query results') || error.message.includes('404'))) {
      throw new Error('Sold orders endpoint not found. Please check backend routes.')
    }
    throw error
  }
}

const loadMore = async () => {
  loadingMore.value = true
  try {
    if (activeTab.value === 'all') {
      allPage.value++
      await fetchAllOrders(false)
    } else if (activeTab.value === 'purchased') {
      purchasedPage.value++
      await fetchPurchasedOrders(false)
    } else if (activeTab.value === 'sold') {
      soldPage.value++
      await fetchSoldOrders(false)
    }
  } catch (error) {
    console.error('Error loading more orders:', error)
    toast.error('Failed to load more orders.')
  } finally {
    loadingMore.value = false
  }
}

const applyFilters = () => {
  fetchOrders(true)
}

const clearFilters = () => {
  filters.value = {
    status: '',
    payment_status: '',
    search: '',
    from_date: '',
    to_date: ''
  }
  applyFilters()
}

const viewOrder = (orderId) => {
  emit('view-order', orderId)
}

const handleCancelOrder = async (order) => {
  if (!confirm(`Are you sure you want to cancel order ${order.order_number}?`)) {
    return
  }

  const reason = prompt('Please provide a reason for cancelling this order:')
  if (reason === null) {
    return
  }
  if (!reason || reason.trim() === '') {
    toast.error('A cancellation reason is required.')
    return
  }

  try {
    const result = await apiService.cancelOrder(order.id, reason.trim())
    if (result.success) {
      toast.success('Order cancelled successfully')
      fetchOrders(true)
    } else {
      throw new Error(result.error || 'Failed to cancel order')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    toast.error(error.message || 'Failed to cancel order. Please try again.')
  }
}

const canCancel = (order) => {
  return order.status === 'pending' && order.payment_status === 'pending'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

const getItemCount = (order) => {
  if (order.items && Array.isArray(order.items)) {
    return order.items.length
  }
  if (order.items_count !== undefined) {
    return order.items_count
  }
  return 0
}

const getTotalAmount = (order) => {
  if (order.total_amount_cents !== undefined) {
    return order.total_amount_cents / 100
  }
  if (order.total_amount !== undefined) {
    if (order.total_amount < 10000) {
      return order.total_amount
    }
    return order.total_amount / 100
  }
  if (order.total !== undefined) {
    return typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0
  }
  return 0
}

// Watch for tab changes
watch(activeTab, () => {
  fetchOrders(true)
})

// Lifecycle
onMounted(() => {
  fetchOrders(true)
})
</script>

