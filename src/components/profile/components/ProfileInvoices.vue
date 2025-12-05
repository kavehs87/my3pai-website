<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-blue-100 text-sm font-medium">Total Paid</span>
          <TrendingDown class="w-5 h-5 text-blue-200" />
        </div>
        <PriceDisplay
          :amount="getTotalPaid()"
          class="text-3xl font-bold text-white"
        />
        <p class="text-blue-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-green-100 text-sm font-medium">Total Received</span>
          <TrendingUp class="w-5 h-5 text-green-200" />
        </div>
        <PriceDisplay
          :amount="getTotalReceived()"
          class="text-3xl font-bold text-white"
        />
        <p class="text-green-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
      </div>
    </div>

    <!-- Period Selector -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectedPeriod = period.value; fetchSummary()"
        :class="[
          'px-4 py-2 rounded-xl font-medium text-sm transition-colors',
          selectedPeriod === period.value
            ? 'bg-primary text-white'
            : 'bg-white text-primary border border-slate-200 hover:bg-slate-50'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

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
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-primary mb-2">Search Invoice Number</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="INV-2025-..."
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
      <p>Loading invoices...</p>
    </div>

    <!-- Invoices Grid View -->
    <div v-else-if="invoices.length > 0 && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="invoice in invoices"
        :key="invoice.id"
        class="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer"
        @click="viewInvoice(invoice.id)"
      >
        <!-- Invoice Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-primary mb-1">{{ invoice.invoice_number }}</h3>
            <p class="text-sm text-text-muted">{{ formatDate(invoice.issued_at || invoice.created_at) }}</p>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getStatusBadgeClass(invoice.status)
              ]"
            >
              {{ formatStatus(invoice.status) }}
            </span>
            <span
              v-if="invoice.perspective"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                invoice.perspective === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              ]"
            >
              {{ invoice.perspective === 'paid' ? 'Paid Invoice' : 'Received Invoice' }}
            </span>
          </div>
        </div>

        <!-- Invoice Info -->
        <div class="mb-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Amount:</span>
            <PriceDisplay
              :amount="getInvoiceAmount(invoice)"
              :class="[
                'font-bold text-lg',
                invoice.perspective === 'paid' ? 'text-blue-600' : 'text-green-600'
              ]"
            />
          </div>
          <div v-if="invoice.due_at" class="flex justify-between text-sm">
            <span class="text-text-muted">Due Date:</span>
            <span class="font-semibold text-primary">{{ formatDate(invoice.due_at) }}</span>
          </div>
          <div v-if="invoice.order" class="flex justify-between text-sm">
            <span class="text-text-muted">Order:</span>
            <span class="font-semibold text-primary">{{ invoice.order.order_number }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-slate-200">
          <button
            @click.stop="viewInvoice(invoice.id)"
            class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            View Details
          </button>
          <button
            v-if="invoice.status === 'paid' || invoice.status === 'issued'"
            @click.stop="handleDownloadPDF(invoice)"
            class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            title="Download PDF"
          >
            <Download class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Invoices List View -->
    <div v-else-if="invoices.length > 0 && viewMode === 'list'" class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="divide-y divide-slate-200">
        <div
          v-for="invoice in invoices"
          :key="invoice.id"
          class="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewInvoice(invoice.id)"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Invoice Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-4 mb-2">
                <h3 class="text-lg font-bold text-primary">{{ invoice.invoice_number }}</h3>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    getStatusBadgeClass(invoice.status)
                  ]"
                >
                  {{ formatStatus(invoice.status) }}
                </span>
                <span
                  v-if="invoice.perspective"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    invoice.perspective === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ invoice.perspective === 'paid' ? 'Paid Invoice' : 'Received Invoice' }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span>Issued: {{ formatDate(invoice.issued_at || invoice.created_at) }}</span>
                <span v-if="invoice.due_at">Due: {{ formatDate(invoice.due_at) }}</span>
                <span v-if="invoice.order">Order: {{ invoice.order.order_number }}</span>
              </div>
            </div>

            <!-- Right: Amount and Actions -->
            <div class="flex items-center gap-4">
              <PriceDisplay
                :amount="getInvoiceAmount(invoice)"
                :class="[
                  'font-bold text-xl',
                  invoice.perspective === 'paid' ? 'text-blue-600' : 'text-green-600'
                ]"
              />
              <div class="flex gap-2">
                <button
                  @click.stop="viewInvoice(invoice.id)"
                  class="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
                <button
                  v-if="invoice.status === 'paid' || invoice.status === 'issued'"
                  @click.stop="handleDownloadPDF(invoice)"
                  class="px-4 py-2 bg-white text-primary border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  title="Download PDF"
                >
                  <Download class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-text-muted">
      <FileText class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-lg mb-2">No invoices found</p>
      <p class="text-sm">Try adjusting your filters or check back later.</p>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && invoices.length > 0 && hasMore" class="mt-8 text-center">
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
import { ref, computed, onMounted, watch } from 'vue'
import { FileText, Download, TrendingUp, TrendingDown, Grid3x3, List } from 'lucide-vue-next'
import PriceDisplay from '../../../themes/dark-blue/components/PriceDisplay.vue'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'

const emit = defineEmits(['view-invoice'])

// Tabs
const tabs = [
  { id: 'all', label: 'All Invoices' },
  { id: 'paid', label: 'Paid' },
  { id: 'received', label: 'Received' }
]

const activeTab = ref('all')

// Periods
const periods = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'all_time', label: 'All Time' }
]

const selectedPeriod = ref('this_month')

// View Mode
const viewMode = ref('grid') // 'grid' or 'list'

// State
const loading = ref(false)
const loadingMore = ref(false)
const allInvoices = ref([])
const paidInvoices = ref([])
const receivedInvoices = ref([])
const allPage = ref(1)
const paidPage = ref(1)
const receivedPage = ref(1)
const allHasMore = ref(false)
const paidHasMore = ref(false)
const receivedHasMore = ref(false)
const summary = ref(null)

// Filters
const filters = ref({
  status: '',
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
const displayedInvoices = computed(() => {
  if (activeTab.value === 'all') {
    // If allInvoices is empty, combine paid and received invoices
    if (allInvoices.value.length === 0 && (paidInvoices.value.length > 0 || receivedInvoices.value.length > 0)) {
      const combined = [
        ...paidInvoices.value.map(i => ({ ...i, perspective: 'paid' })),
        ...receivedInvoices.value.map(i => ({ ...i, perspective: 'received' }))
      ]
      // Remove duplicates based on invoice ID
      const uniqueInvoices = combined.filter((invoice, index, self) =>
        index === self.findIndex(i => i.id === invoice.id)
      )
      return uniqueInvoices
    }
    return allInvoices.value
  } else if (activeTab.value === 'paid') {
    return paidInvoices.value.map(i => ({ ...i, perspective: 'paid' }))
  } else {
    return receivedInvoices.value.map(i => ({ ...i, perspective: 'received' }))
  }
})

const invoices = computed(() => {
  let filtered = displayedInvoices.value

  if (filters.value.status) {
    filtered = filtered.filter(i => i.status === filters.value.status)
  }

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(i =>
      i.invoice_number?.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
})

const hasMore = computed(() => {
  if (activeTab.value === 'all') {
    // If we're using the fallback (combining paid and received), check both
    if (allInvoices.value.length === 0 && (paidInvoices.value.length > 0 || receivedInvoices.value.length > 0)) {
      return paidHasMore.value || receivedHasMore.value
    }
    return allHasMore.value
  } else if (activeTab.value === 'paid') {
    return paidHasMore.value
  } else {
    return receivedHasMore.value
  }
})

const fetchSummary = async () => {
  try {
    const params = getPeriodParams()
    const result = await apiService.getInvoiceSummary(params)
    if (result.success) {
      // Handle different response structures
      const backendResponse = result.data?.data || result.data || result
      console.log('[ProfileInvoices] Summary response:', backendResponse)
      summary.value = backendResponse
    } else {
      console.warn('[ProfileInvoices] Summary fetch failed:', result.error)
      summary.value = null
    }
  } catch (error) {
    console.error('Error fetching invoice summary:', error)
    summary.value = null
  }
}

const getPeriodParams = () => {
  const now = new Date()
  const params = {}

  switch (selectedPeriod.value) {
    case 'this_month':
      params.from_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      params.to_date = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      break
    case 'last_month':
      params.from_date = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      params.to_date = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
      break
    case 'this_year':
      params.from_date = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      params.to_date = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
      break
  }

  return params
}

const getPeriodLabel = () => {
  const period = periods.find(p => p.value === selectedPeriod.value)
  return period ? period.label : 'All Time'
}

const fetchInvoices = async (reset = false) => {
  if (reset) {
    if (activeTab.value === 'all') {
      allInvoices.value = []
      allPage.value = 1
    } else if (activeTab.value === 'paid') {
      paidInvoices.value = []
      paidPage.value = 1
    } else if (activeTab.value === 'received') {
      receivedInvoices.value = []
      receivedPage.value = 1
    }
  }

  loading.value = true

  try {
    if (activeTab.value === 'all') {
      await fetchAllInvoices(reset)
    } else if (activeTab.value === 'paid') {
      await fetchPaidInvoices(reset)
    } else {
      await fetchReceivedInvoices(reset)
    }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    // Check if it's a 404 error (backend route issue)
    if (error.message && (error.message.includes('No query results') || error.message.includes('404'))) {
      toast.error('Invoice filtering is temporarily unavailable. Please use "All Invoices" tab or contact support.')
    } else {
      toast.error('Failed to load invoices. Please try again.')
    }
  } finally {
    loading.value = false
  }
}

const fetchAllInvoices = async (reset = true) => {
  if (reset) {
    allInvoices.value = []
    allPage.value = 1
  }

  try {
    const params = {
      page: allPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getAllInvoices(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const invoiceList = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(invoiceList) && invoiceList.length > 0) {
        allInvoices.value = reset ? invoiceList : [...allInvoices.value, ...invoiceList]
        allHasMore.value = meta.current_page < meta.last_page
      } else {
        // If getAllInvoices returns empty, fetch both paid and received as fallback
        console.log('[ProfileInvoices] getAllInvoices returned empty, fetching paid and received as fallback')
        if (reset) {
          // Reset both lists
          paidInvoices.value = []
          receivedInvoices.value = []
          paidPage.value = 1
          receivedPage.value = 1
        }
        // Fetch both in parallel
        await Promise.all([
          fetchPaidInvoices(reset).catch(err => {
            console.warn('[ProfileInvoices] Failed to fetch paid invoices for all tab:', err)
          }),
          fetchReceivedInvoices(reset).catch(err => {
            console.warn('[ProfileInvoices] Failed to fetch received invoices for all tab:', err)
          })
        ])
        // The displayedInvoices computed will combine them
        allHasMore.value = false // We'll handle pagination through the combined lists
      }
    } else {
      // If API call failed, try fallback
      console.log('[ProfileInvoices] getAllInvoices failed, fetching paid and received as fallback')
      if (reset) {
        paidInvoices.value = []
        receivedInvoices.value = []
        paidPage.value = 1
        receivedPage.value = 1
      }
      await Promise.all([
        fetchPaidInvoices(reset).catch(err => {
          console.warn('[ProfileInvoices] Failed to fetch paid invoices for all tab:', err)
        }),
        fetchReceivedInvoices(reset).catch(err => {
          console.warn('[ProfileInvoices] Failed to fetch received invoices for all tab:', err)
        })
      ])
      allHasMore.value = false
    }
  } catch (error) {
    console.error('Error fetching all invoices:', error)
    // Try fallback: fetch both paid and received
    console.log('[ProfileInvoices] Error in getAllInvoices, trying fallback')
    try {
      if (reset) {
        paidInvoices.value = []
        receivedInvoices.value = []
        paidPage.value = 1
        receivedPage.value = 1
      }
      await Promise.all([
        fetchPaidInvoices(reset).catch(err => {
          console.warn('[ProfileInvoices] Failed to fetch paid invoices for all tab:', err)
        }),
        fetchReceivedInvoices(reset).catch(err => {
          console.warn('[ProfileInvoices] Failed to fetch received invoices for all tab:', err)
        })
      ])
      allHasMore.value = false
    } catch (fallbackError) {
      console.error('Fallback fetch also failed:', fallbackError)
      throw error // Throw original error
    }
  }
}

const fetchPaidInvoices = async (reset = true) => {
  if (reset) {
    paidInvoices.value = []
    paidPage.value = 1
  }

  try {
    const params = {
      page: paidPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getPaidInvoices(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const invoiceList = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(invoiceList)) {
        paidInvoices.value = reset ? invoiceList : [...paidInvoices.value, ...invoiceList]
        paidHasMore.value = meta.current_page < meta.last_page
      } else {
        throw new Error('Invalid response format from API')
      }
    } else {
      throw new Error(result.error || 'Failed to fetch paid invoices')
    }
  } catch (error) {
    console.error('Error fetching paid invoices:', error)
    throw error
  }
}

const fetchReceivedInvoices = async (reset = true) => {
  if (reset) {
    receivedInvoices.value = []
    receivedPage.value = 1
  }

  try {
    const params = {
      page: receivedPage.value,
      per_page: 15,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.search && { search: filters.value.search })
    }

    const result = await apiService.getReceivedInvoices(params)
    if (result.success) {
      const backendResponse = result.data?.data || result.data
      const invoiceList = backendResponse?.data || backendResponse || []
      const meta = backendResponse?.meta || result.data?.meta || result.meta || {}

      if (Array.isArray(invoiceList)) {
        receivedInvoices.value = reset ? invoiceList : [...receivedInvoices.value, ...invoiceList]
        receivedHasMore.value = meta.current_page < meta.last_page
      } else {
        throw new Error('Invalid response format from API')
      }
    } else {
      throw new Error(result.error || 'Failed to fetch received invoices')
    }
  } catch (error) {
    console.error('Error fetching received invoices:', error)
    throw error
  }
}

const loadMore = async () => {
  loadingMore.value = true
  try {
    if (activeTab.value === 'all') {
      // If using fallback (combining paid and received), load more from both
      if (allInvoices.value.length === 0 && (paidInvoices.value.length > 0 || receivedInvoices.value.length > 0)) {
        // Load more from both lists
        if (paidHasMore.value) {
          paidPage.value++
          await fetchPaidInvoices(false).catch(err => {
            console.warn('[ProfileInvoices] Failed to load more paid invoices:', err)
          })
        }
        if (receivedHasMore.value) {
          receivedPage.value++
          await fetchReceivedInvoices(false).catch(err => {
            console.warn('[ProfileInvoices] Failed to load more received invoices:', err)
          })
        }
      } else {
        // Use normal getAllInvoices pagination
        allPage.value++
        await fetchAllInvoices(false)
      }
    } else if (activeTab.value === 'paid') {
      paidPage.value++
      await fetchPaidInvoices(false)
    } else if (activeTab.value === 'received') {
      receivedPage.value++
      await fetchReceivedInvoices(false)
    }
  } catch (error) {
    console.error('Error loading more invoices:', error)
    toast.error('Failed to load more invoices.')
  } finally {
    loadingMore.value = false
  }
}

const applyFilters = () => {
  fetchInvoices(true)
}

const clearFilters = () => {
  filters.value = {
    status: '',
    search: '',
    from_date: '',
    to_date: ''
  }
  applyFilters()
}

const viewInvoice = (invoiceId) => {
  emit('view-invoice', invoiceId)
}

const handleDownloadPDF = (invoice) => {
  toast.info('PDF download feature coming soon')
}

const getTotalPaid = () => {
  // If summary exists, use it
  if (summary.value) {
    // Try multiple possible field names
    const total = summary.value.total_paid_cents || 
                  summary.value.total_paid || 
                  summary.value.paid_total_cents ||
                  summary.value.paid_total ||
                  summary.value.paid_amount_cents ||
                  summary.value.paid_amount ||
                  null
    
    if (total !== null && total !== undefined) {
      console.log('[ProfileInvoices] Total paid from summary:', {
        summary: summary.value,
        total,
        type: typeof total
      })
      
      if (typeof total === 'number') {
        // If it's a very large number (> 10000), it's likely in cents
        if (total > 10000) {
          return total / 100
        }
        return total
      }
      
      // Try to parse as string
      if (typeof total === 'string') {
        const parsed = parseFloat(total)
        if (!isNaN(parsed)) {
          return parsed > 10000 ? parsed / 100 : parsed
        }
      }
    }
  }
  
  // Fallback: calculate from paid invoices list
  if (paidInvoices.value && paidInvoices.value.length > 0) {
    const calculated = paidInvoices.value.reduce((sum, invoice) => {
      return sum + getInvoiceAmount(invoice)
    }, 0)
    console.log('[ProfileInvoices] Total paid calculated from invoices:', calculated)
    return calculated
  }
  
  console.log('[ProfileInvoices] No summary or paid invoices data for total paid')
  return 0
}

const getTotalReceived = () => {
  // If summary exists, use it
  if (summary.value) {
    // Try multiple possible field names
    const total = summary.value.total_received_cents || 
                  summary.value.total_received || 
                  summary.value.received_total_cents ||
                  summary.value.received_total ||
                  summary.value.received_amount_cents ||
                  summary.value.received_amount ||
                  null
    
    if (total !== null && total !== undefined) {
      console.log('[ProfileInvoices] Total received from summary:', {
        summary: summary.value,
        total,
        type: typeof total
      })
      
      if (typeof total === 'number') {
        // If it's a very large number (> 10000), it's likely in cents
        if (total > 10000) {
          return total / 100
        }
        return total
      }
      
      // Try to parse as string
      if (typeof total === 'string') {
        const parsed = parseFloat(total)
        if (!isNaN(parsed)) {
          return parsed > 10000 ? parsed / 100 : parsed
        }
      }
    }
  }
  
  // Fallback: calculate from received invoices list
  if (receivedInvoices.value && receivedInvoices.value.length > 0) {
    const calculated = receivedInvoices.value.reduce((sum, invoice) => {
      return sum + getInvoiceAmount(invoice)
    }, 0)
    console.log('[ProfileInvoices] Total received calculated from invoices:', calculated)
    return calculated
  }
  
  console.log('[ProfileInvoices] No summary or received invoices data for total received')
  return 0
}

const getInvoiceAmount = (invoice) => {
  // Helper to parse amount string, handling both US (.) and European (,) decimal separators
  const parseAmount = (value) => {
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string') {
      // Replace comma with period for European format (e.g., "39,99" -> "39.99")
      const normalized = value.replace(',', '.')
      const parsed = parseFloat(normalized)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  if (invoice.perspective === 'received') {
    if (invoice.influencer_payout_amount_cents !== undefined && invoice.influencer_payout_amount_cents !== null) {
      return invoice.influencer_payout_amount_cents / 100
    }
    if (invoice.influencer_payout_amount !== undefined) {
      const amount = parseAmount(invoice.influencer_payout_amount)
      // If it's very large (> 10000), it's definitely in cents
      if (amount > 10000) {
        return amount / 100
      }
      // For whole numbers > 100, treat as cents
      if (Number.isInteger(amount) && amount > 100) {
        return amount / 100
      }
      // Otherwise, assume it's already in dollars
      return amount
    }
  }
  
  // Always prefer _cents field if available
  if (invoice.total_amount_cents !== undefined && invoice.total_amount_cents !== null) {
    return invoice.total_amount_cents / 100
  }
  
  if (invoice.total_amount !== undefined && invoice.total_amount !== null) {
    const amount = parseAmount(invoice.total_amount)
    
    // If it has decimal places, assume it's already in dollars (e.g., 39.99)
    if (!Number.isInteger(amount)) {
      return amount
    }
    
    // For small whole numbers (<= 100), assume they're already in dollars
    // (e.g., 5 = $5.00, not 5 cents = $0.05)
    if (amount <= 100) {
      return amount
    }
    
    // For whole numbers > 100, they're likely in cents
    // This handles cases where backend returns cents in total_amount field
    // Example: 3999 cents should become $39.99, not $3999.00
    // Exception: if it's unreasonably large (> 1 million), assume it's already in dollars
    if (amount > 1000000) {
      return amount
    }
    
    // Default: treat whole numbers > 100 as cents
    return amount / 100
  }
  
  return 0
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
    draft: 'Draft',
    issued: 'Issued',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
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

watch(activeTab, () => {
  fetchInvoices(true)
})

onMounted(() => {
  fetchSummary()
  fetchInvoices(true)
})
</script>

