<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-green-100 text-sm font-medium">Total Earnings</span>
          <TrendingUp class="w-5 h-5 text-green-200" />
        </div>
        <PriceDisplay
          :amount="summary.total_earnings || 0"
          class="text-3xl font-bold text-white"
        />
        <p class="text-green-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
      </div>
      <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-emerald-100 text-sm font-medium">Total Payouts</span>
          <DollarSign class="w-5 h-5 text-emerald-200" />
        </div>
        <PriceDisplay
          :amount="summary.total_payouts || 0"
          class="text-3xl font-bold text-white"
        />
        <p class="text-emerald-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-amber-100 text-sm font-medium">Pending Payouts</span>
          <Clock class="w-5 h-5 text-amber-200" />
        </div>
        <PriceDisplay
          :amount="summary.pending_payouts || 0"
          class="text-3xl font-bold text-white"
        />
        <p class="text-amber-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
      </div>
      <div class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-slate-100 text-sm font-medium">Platform Fees Paid</span>
          <Percent class="w-5 h-5 text-slate-200" />
        </div>
        <PriceDisplay
          :amount="summary.platform_fees_paid || 0"
          class="text-3xl font-bold text-white"
        />
        <p class="text-slate-100 text-xs mt-1">{{ getPeriodLabel() }}</p>
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
            ? 'bg-green-600 text-white'
            : 'bg-white text-primary border border-slate-200 hover:bg-slate-50'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Filters -->
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
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
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
              ? 'bg-green-600 text-white'
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
              ? 'bg-green-600 text-white'
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
      <div class="w-12 h-12 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading payouts...</p>
    </div>

    <!-- Payouts Grid View -->
    <div v-else-if="payouts.length > 0 && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="payout in payouts"
        :key="payout.id"
        class="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer"
        @click="viewPayout(payout.id)"
      >
        <!-- Payout Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-primary mb-1">Payout #{{ payout.id }}</h3>
            <p class="text-sm text-text-muted">{{ formatDate(payout.created_at) }}</p>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              getStatusBadgeClass(payout.status)
            ]"
          >
            {{ formatStatus(payout.status) }}
          </span>
        </div>

        <!-- Payout Info -->
        <div class="mb-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-text-muted">Amount:</span>
            <PriceDisplay
              :amount="payout.amount || 0"
              class="font-bold text-lg text-green-600"
            />
          </div>
          <div v-if="payout.processed_at" class="flex justify-between text-sm">
            <span class="text-text-muted">Processed:</span>
            <span class="font-semibold text-primary">{{ formatDate(payout.processed_at) }}</span>
          </div>
          <div v-if="payout.paid_at" class="flex justify-between text-sm">
            <span class="text-text-muted">Paid:</span>
            <span class="font-semibold text-primary">{{ formatDate(payout.paid_at) }}</span>
          </div>
          <div v-if="payout.stripe_transfer_id" class="flex justify-between text-sm">
            <span class="text-text-muted">Transfer ID:</span>
            <span class="font-mono text-xs text-text-muted">{{ payout.stripe_transfer_id.substring(0, 12) }}...</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-slate-200">
          <button
            @click.stop="viewPayout(payout.id)"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>

    <!-- Payouts List View -->
    <div v-else-if="payouts.length > 0 && viewMode === 'list'" class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="divide-y divide-slate-200">
        <div
          v-for="payout in payouts"
          :key="payout.id"
          class="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewPayout(payout.id)"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Payout Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-4 mb-2">
                <h3 class="text-lg font-bold text-primary">Payout #{{ payout.id }}</h3>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap',
                    getStatusBadgeClass(payout.status)
                  ]"
                >
                  {{ formatStatus(payout.status) }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span>Created: {{ formatDate(payout.created_at) }}</span>
                <span v-if="payout.processed_at">Processed: {{ formatDate(payout.processed_at) }}</span>
                <span v-if="payout.paid_at">Paid: {{ formatDate(payout.paid_at) }}</span>
                <span v-if="payout.stripe_transfer_id" class="font-mono text-xs">
                  Transfer: {{ payout.stripe_transfer_id.substring(0, 20) }}...
                </span>
              </div>
            </div>

            <!-- Right: Amount and Actions -->
            <div class="flex items-center gap-4">
              <PriceDisplay
                :amount="payout.amount || 0"
                class="font-bold text-xl text-green-600"
              />
              <button
                @click.stop="viewPayout(payout.id)"
                class="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 text-text-muted">
      <DollarSign class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-lg mb-2">No payouts found</p>
      <p class="text-sm">Try adjusting your filters or check back later.</p>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && payouts.length > 0 && hasMore" class="mt-8 text-center">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loadingMore">Loading...</span>
        <span v-else>Load More</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Grid3x3, List, TrendingUp, DollarSign, Clock, Percent } from 'lucide-vue-next'
import apiService from '@/services/api.js'
import toast from '@/utils/toast.js'
import PriceDisplay from '../components/PriceDisplay.vue'

// Props
const props = defineProps({
  currency: {
    type: String,
    default: 'USD'
  }
})

// Emits
const emit = defineEmits(['view-payout'])

// State
const loading = ref(false)
const loadingMore = ref(false)
const payouts = ref([])
const summary = ref({})
const viewMode = ref('grid')
const selectedPeriod = ref('all_time')
const hasMore = ref(false)
const pagination = ref({})

const filters = ref({
  status: ''
})

const periods = [
  { label: 'All Time', value: 'all_time' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Year', value: 'this_year' }
]

// Computed
const getPeriodLabel = () => {
  const period = periods.find(p => p.value === selectedPeriod.value)
  return period ? period.label : 'All Time'
}

// Methods
const fetchSummary = async () => {
  try {
    const params = {
      period: selectedPeriod.value
    }
    const result = await apiService.getInfluencerEarningsSummary(params)
    if (result.success) {
      summary.value = result.data?.data || result.data || {}
    }
  } catch (err) {
    console.error('Error fetching earnings summary:', err)
  }
}

const fetchPayouts = async (page = 1) => {
  loading.value = page === 1
  loadingMore.value = page > 1

  try {
    const params = {
      page,
      per_page: 12,
      ...(filters.value.status && { status: filters.value.status })
    }

    const result = await apiService.getInfluencerPayouts(params)
    if (result.success) {
      const data = result.data?.data || result.data || {}
      const payoutsData = data.data || data.payouts || []
      
      if (page === 1) {
        payouts.value = payoutsData
      } else {
        payouts.value.push(...payoutsData)
      }

      pagination.value = data.pagination || data.meta || {}
      hasMore.value = pagination.value.current_page < pagination.value.last_page
    } else {
      throw new Error(result.error || 'Failed to fetch payouts')
    }
  } catch (err) {
    console.error('Error fetching payouts:', err)
    toast.error(err.message || 'Failed to load payouts. Please try again.')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    const nextPage = (pagination.value.current_page || 1) + 1
    fetchPayouts(nextPage)
  }
}

const applyFilters = () => {
  fetchPayouts(1)
}

const clearFilters = () => {
  filters.value = { status: '' }
  fetchPayouts(1)
}

const viewPayout = (payoutId) => {
  emit('view-payout', payoutId)
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
    paid: 'Paid',
    failed: 'Failed'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

// Lifecycle
onMounted(() => {
  fetchSummary()
  fetchPayouts(1)
})
</script>

