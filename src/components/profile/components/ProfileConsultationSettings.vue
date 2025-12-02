<template>
  <div class="consultation-settings">
    <div class="container">
      <DisabledFeatureBanner 
        :is-enabled="isEnabled" 
        feature-name="Consultations"
        tool-id="consultation"
        @enabled="handleEnabled"
      />
      
      <div class="settings-intro">
        <h1><i class="fas fa-video"></i> Consultation Settings</h1>
        <p>Configure your 1-on-1 trip planning consultation service. Set your pricing, duration, and availability.</p>
      </div>

      <!-- Consultation Settings Form -->
      <div class="settings-section">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading consultation settings...
        </div>

        <form v-else class="consultation-form" @submit.prevent="saveConsultation">
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="checkbox-input"
              />
              <span>Enable Consultation Service</span>
            </label>
            <p class="helper-text">When enabled, visitors can book 1-on-1 consultations with you</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Title *</label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="e.g., 1-on-1 Trip Planning"
                required
                maxlength="255"
              />
            </div>

            <div class="form-group">
              <label>Duration (minutes) *</label>
              <select v-model="form.durationMinutes" class="form-input" required>
                <option :value="15">15 minutes</option>
                <option :value="30">30 minutes</option>
                <option :value="45">45 minutes</option>
                <option :value="60">60 minutes</option>
                <option :value="90">90 minutes</option>
                <option :value="120">120 minutes</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Description *</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="4"
              placeholder="Describe what clients will get from the consultation..."
              required
              maxlength="1000"
            ></textarea>
            <span class="char-count">{{ (form.description || '').length }}/1000</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price *</label>
              <div class="price-input-group">
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                  placeholder="0.00"
                  required
                />
                <select v-model="form.currency" class="form-input currency-select">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
              {{ saving ? 'Saving...' : 'Save Consultation Settings' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Bookings Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-calendar-check"></i> Consultation Bookings</h2>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ bookingsStats.upcoming }}</span>
              <span class="stat-label">Upcoming</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ bookingsStats.total }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>

        <!-- Filters and Controls -->
        <div v-if="!bookingsLoading && allBookings.length > 0" class="bookings-controls">
          <div class="controls-row">
            <!-- View Toggle -->
            <div class="view-toggle">
              <button
                class="toggle-btn"
                :class="{ active: filters.view === 'all' }"
                @click="setViewFilter('all')"
              >
                All
              </button>
              <button
                class="toggle-btn"
                :class="{ active: filters.view === 'upcoming' }"
                @click="setViewFilter('upcoming')"
              >
                Upcoming
              </button>
              <button
                class="toggle-btn"
                :class="{ active: filters.view === 'past' }"
                @click="setViewFilter('past')"
              >
                Past
              </button>
            </div>

            <!-- Status Filter -->
            <div class="filter-group">
              <label class="filter-label">Status:</label>
              <select v-model="filters.status" @change="handleStatusFilterChange" class="filter-select">
                <option :value="null">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-label">Sort by:</label>
              <select v-model="sortBy" @change="setSortBy(sortBy)" class="filter-select">
                <option value="scheduled_at">Scheduled Date</option>
                <option value="created_at">Created Date</option>
                <option value="customer_name">Customer Name</option>
                <option value="status">Status</option>
              </select>
              <button
                class="sort-order-btn"
                @click="toggleSortOrder"
                :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
              >
                <i :class="sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
              </button>
            </div>

            <!-- Items Per Page -->
            <div class="filter-group">
              <label class="filter-label">Per page:</label>
              <select v-model="pagination.perPage" @change="changePerPage(pagination.perPage)" class="filter-select">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="bookingsLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading bookings...
        </div>

        <div v-else-if="filteredAndSortedBookings.length === 0" class="empty-state">
          <i class="fas fa-calendar-times"></i>
          <h3>No bookings found</h3>
          <p v-if="allBookings.length > 0">
            No bookings match your current filters. Try adjusting your filter settings.
          </p>
          <p v-else>When clients book consultations, they'll appear here</p>
        </div>

        <div v-else>
          <div class="bookings-info">
            <span class="bookings-count">
              Showing {{ ((pagination.currentPage - 1) * pagination.perPage) + 1 }} - 
              {{ Math.min(pagination.currentPage * pagination.perPage, filteredAndSortedBookings.length) }} 
              of {{ filteredAndSortedBookings.length }} bookings
            </span>
          </div>
          
          <div class="bookings-list">
            <article
              v-for="booking in bookings"
              :key="booking.id"
            class="booking-card"
            :class="{
              'status-pending': booking.status === 'pending',
              'status-confirmed': booking.status === 'confirmed',
              'status-completed': booking.status === 'completed',
              'status-cancelled': booking.status === 'cancelled',
            }"
          >
            <div class="booking-header">
              <div class="booking-customer">
                <div
                  v-if="booking.customer?.avatar"
                  class="customer-avatar"
                  :style="{ backgroundImage: `url(${booking.customer.avatar})` }"
                ></div>
                <div v-else class="customer-avatar placeholder">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <h4>{{ booking.customer?.name || 'Unknown Customer' }}</h4>
                  <p class="customer-email">{{ booking.customer?.email || '' }}</p>
                </div>
              </div>
              <span :class="['status-badge', `status-${booking.status}`]">
                {{ booking.status }}
              </span>
            </div>

            <div class="booking-details">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDateTime(booking.scheduledAt, booking.timezone) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span>{{ formatPrice(booking.consultation?.price, booking.consultation?.currency) }}</span>
                <span :class="['payment-status', `payment-${booking.paymentStatus}`]">
                  ({{ booking.paymentStatus }})
                </span>
              </div>
              <div v-if="booking.notes" class="detail-item notes">
                <i class="fas fa-sticky-note"></i>
                <span>{{ booking.notes }}</span>
              </div>
              <div v-if="booking.videoCallLink" class="detail-item">
                <i class="fas fa-video"></i>
                <a :href="booking.videoCallLink" target="_blank" rel="noopener noreferrer">
                  Join Video Call →
                </a>
              </div>
            </div>

            <div class="booking-actions">
              <template v-if="booking.status === 'pending'">
                <button
                  class="action-btn confirm"
                  @click="confirmBooking(booking.id)"
                  :disabled="actionLoading"
                >
                  <i class="fas fa-check"></i> Confirm
                </button>
                <button
                  class="action-btn cancel"
                  @click="cancelBooking(booking.id)"
                  :disabled="actionLoading"
                >
                  <i class="fas fa-times"></i> Cancel
                </button>
              </template>
              <template v-else-if="booking.status === 'confirmed'">
                <button
                  class="action-btn complete"
                  @click="completeBooking(booking.id)"
                  :disabled="actionLoading"
                >
                  <i class="fas fa-check-circle"></i> Mark Complete
                </button>
              </template>
              <template v-if="booking.status === 'cancelled' && booking.cancellationReason">
                <p class="cancellation-reason">
                  <strong>Cancelled:</strong> {{ booking.cancellationReason }}
                </p>
              </template>
            </div>
          </article>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="pagination.currentPage === 1"
              @click="changePage(pagination.currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            
            <div class="pagination-pages">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="pagination-page"
                :class="{ active: page === pagination.currentPage, disabled: page === '...' }"
                :disabled="page === '...'"
                @click="page !== '...' && changePage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="pagination-btn"
              :disabled="pagination.currentPage === totalPages"
              @click="changePage(pagination.currentPage + 1)"
            >
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <transition name="fade">
      <div v-if="confirmModal.visible" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Confirm Booking</h3>
            <button class="close-btn" @click="closeConfirmModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form class="modal-body" @submit.prevent="submitConfirmBooking">
            <div class="form-group">
              <label>Video Call Link (Optional)</label>
              <input
                v-model="confirmModal.videoCallLink"
                type="url"
                class="form-input"
                placeholder="https://zoom.us/j/..."
              />
              <p class="helper-text">Share a Zoom, Google Meet, or other video call link</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeConfirmModal">
                Cancel
              </button>
              <button type="submit" class="modal-btn primary" :disabled="actionLoading">
                {{ actionLoading ? 'Confirming...' : 'Confirm Booking' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import apiService from '@/services/api'
import toast from '@/utils/toast'
import DisabledFeatureBanner from './DisabledFeatureBanner.vue'
import eventBus from '@/utils/eventBus'

export default {
  name: 'ProfileConsultationSettings',
  components: {
    DisabledFeatureBanner
  },
  data() {
    return {
      loading: false,
      isEnabled: true,
      saving: false,
      error: null,
      bookingsLoading: false,
      actionLoading: false,
      form: {
        title: '1-on-1 Trip Planning',
        description: '',
        durationMinutes: 60,
        price: 150,
        currency: 'USD',
        isActive: true,
      },
      allBookings: [], // Store all bookings for client-side operations
      bookingsStats: {
        upcoming: 0,
        total: 0,
      },
      // Pagination, filtering, sorting
      pagination: {
        currentPage: 1,
        perPage: 10,
        total: 0,
        lastPage: 1,
      },
      useBackendFiltering: false, // Whether to use backend filtering/sorting vs client-side
      filters: {
        status: null, // null = all, or comma-separated statuses
        view: 'all', // 'all', 'upcoming', 'past'
      },
      sortBy: 'scheduled_at', // 'scheduled_at', 'created_at', 'customer_name', 'status'
      sortOrder: 'desc', // 'asc', 'desc'
      confirmModal: {
        visible: false,
        bookingId: null,
        videoCallLink: '',
      },
    }
  },
  computed: {
    // Check if all records are loaded (client-side mode) or we need backend filtering
    allRecordsLoaded() {
      if (!this.pagination.total) return false
      return this.allBookings.length >= this.pagination.total
    },
    filteredAndSortedBookings() {
      // Bookings are already sorted by backend (if backend filtering)
      // Status is already filtered by backend (if backend filtering)
      let result = [...this.allBookings]

      // Always apply view filter client-side (backend returns upcoming/past separately)
      if (this.filters.view === 'upcoming') {
        result = result.filter(b => {
          const scheduled = new Date(b.scheduledAt)
          const now = new Date()
          return scheduled >= now && b.status !== 'cancelled' && b.status !== 'completed'
        })
      } else if (this.filters.view === 'past') {
        result = result.filter(b => {
          const scheduled = new Date(b.scheduledAt)
          const now = new Date()
          return scheduled < now || b.status === 'cancelled' || b.status === 'completed'
        })
      }

      // Apply status filter client-side only if NOT using backend filtering
      // (backend already filtered if useBackendFiltering is true)
      if (!this.useBackendFiltering && this.filters.status && this.filters.status !== null) {
        const filterStatus = String(this.filters.status).toLowerCase().trim()
        result = result.filter(b => {
          const bookingStatus = String(b.status || '').toLowerCase().trim()
          return bookingStatus === filterStatus
        })
      }

      // Client-side sorting only if all records loaded (not using backend filtering)
      if (this.allRecordsLoaded && !this.useBackendFiltering) {
        result.sort((a, b) => {
          let aVal, bVal

          switch (this.sortBy) {
            case 'scheduled_at':
              aVal = new Date(a.scheduledAt || 0)
              bVal = new Date(b.scheduledAt || 0)
              break
            case 'created_at':
              aVal = new Date(a.createdAt || a.scheduledAt || 0)
              bVal = new Date(b.createdAt || b.scheduledAt || 0)
              break
            case 'customer_name':
              aVal = (a.customer?.name || '').toLowerCase()
              bVal = (b.customer?.name || '').toLowerCase()
              break
            case 'status':
              aVal = (a.status || '').toLowerCase()
              bVal = (b.status || '').toLowerCase()
              break
            default:
              return 0
          }

          if (this.sortBy === 'customer_name' || this.sortBy === 'status') {
            return this.sortOrder === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal)
          } else {
            return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
          }
        })
      }

      return result
    },
    paginatedBookings() {
      // If using backend pagination, bookings are already paginated
      if (this.useBackendFiltering) {
        return this.filteredAndSortedBookings
      }
      
      // Client-side pagination
      const start = (this.pagination.currentPage - 1) * this.pagination.perPage
      const end = start + this.pagination.perPage
      return this.filteredAndSortedBookings.slice(start, end)
    },
    bookings() {
      return this.paginatedBookings
    },
    totalPages() {
      if (this.useBackendFiltering) {
        return this.pagination.lastPage || 1
      }
      return Math.ceil(this.filteredAndSortedBookings.length / this.pagination.perPage)
    },
    totalFilteredCount() {
      if (this.useBackendFiltering) {
        return this.pagination.total
      }
      return this.filteredAndSortedBookings.length
    },
    visiblePages() {
      const total = this.totalPages
      const current = this.pagination.currentPage
      const pages = []
      
      if (total <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)
        
        if (current > 3) {
          pages.push('...')
        }
        
        // Show pages around current
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (current < total - 2) {
          pages.push('...')
        }
        
        // Always show last page
        pages.push(total)
      }
      
      return pages
    },
  },
  mounted() {
    this.loadConsultation()
    this.loadBookings()
    this.loadVisibilityStatus()
    eventBus.on('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  beforeUnmount() {
    eventBus.off('creator-tools-visibility-changed', this.handleVisibilityChange)
  },
  watch: {
    filters: {
      handler(newVal, oldVal) {
        this.pagination.currentPage = 1
        
        // If using backend filtering and status changed, reload
        if (this.useBackendFiltering && oldVal && newVal.status !== oldVal.status) {
          this.loadBookings()
        }
        // View filter is always client-side, no reload needed
      },
      deep: true,
    },
    sortBy() {
      this.pagination.currentPage = 1
      // Always reload when sort changes (either backend or will trigger reload if switching modes)
      this.loadBookings()
    },
    sortOrder() {
      this.pagination.currentPage = 1
      // Always reload when sort order changes
      this.loadBookings()
    },
  },
  methods: {
    async loadConsultation() {
      this.loading = true
      this.error = null

      try {
        const result = await apiService.getMyConsultation()

        if (result.success && result.data?.data) {
          const consultation = result.data.data
          this.form = {
            title: consultation.title || '1-on-1 Trip Planning',
            description: consultation.description || '',
            durationMinutes: consultation.durationMinutes || 60,
            price: consultation.price || 150,
            currency: consultation.currency || 'USD',
            isActive: consultation.isActive !== false,
          }
        }
      } catch (err) {
        console.error('Error loading consultation:', err)
        this.error = err.message || 'Failed to load consultation settings'
      } finally {
        this.loading = false
      }
    },

    async loadVisibilityStatus() {
      try {
        const result = await apiService.getCreatorToolsVisibility()
        if (result.success) {
          const settings = result.data?.data || result.data || {}
          this.isEnabled = settings.consultation !== false // Default to true if not set
        }
      } catch (err) {
        console.error('Failed to load visibility status:', err)
        this.isEnabled = true
      }
    },
    handleVisibilityChange(data) {
      if (data.toolId === 'consultation') {
        this.isEnabled = data.enabled
      }
    },
    handleEnabled() {
      this.isEnabled = true
    },

    async saveConsultation() {
      this.saving = true
      this.error = null

      try {
        const result = await apiService.updateConsultation({
          title: this.form.title,
          description: this.form.description,
          duration_minutes: this.form.durationMinutes,
          price: this.form.price,
          currency: this.form.currency,
          is_active: this.form.isActive,
        })

        if (result.success) {
          toast.success('Consultation settings saved successfully!')
        } else {
          this.error = result.error || 'Failed to save consultation settings'
          toast.error(this.error)
        }
      } catch (err) {
        this.error = err.message || 'Failed to save consultation settings'
        toast.error(this.error)
      } finally {
        this.saving = false
      }
    },

    async loadBookings(forceBackendMode = false) {
      this.bookingsLoading = true

      try {
        // Build query parameters
        const params = {
          sort_by: this.sortBy,
          sort_order: this.sortOrder,
        }
        
        // Determine if we should use backend filtering
        // Force backend mode if explicitly requested, or if already in backend mode
        const shouldUseBackend = forceBackendMode || this.useBackendFiltering
        
        // Add status filter if using backend filtering
        if (shouldUseBackend && this.filters.status) {
          params.status = this.filters.status
        }
        
        if (shouldUseBackend) {
          // Use backend pagination and filtering
          params.per_page = this.pagination.perPage
          params.page = this.pagination.currentPage
        } else {
          // Try to load all records (up to 100) for client-side filtering
          params.per_page = 100
          params.page = 1
        }

        const result = await apiService.getInfluencerConsultationBookings(params)

        if (result.success && result.data?.data) {
          const data = result.data.data
          const upcoming = data.upcoming || []
          const past = data.past || []
          const loadedBookings = [...upcoming, ...past]
          
          // Get total from pagination meta
          let total = loadedBookings.length
          if (result.data?.meta) {
            total = result.data.meta.total || total
            this.pagination.lastPage = result.data.meta.last_page || Math.ceil(total / this.pagination.perPage)
          }
          
          // Check if we need to switch to backend filtering mode
          if (!shouldUseBackend && total > loadedBookings.length) {
            // More records exist than we loaded - switch to backend filtering mode
            this.useBackendFiltering = true
            this.pagination.total = total
            this.pagination.currentPage = 1
            // Reload with backend pagination
            await this.loadBookings(true)
            return
          }
          
          // Store bookings
          this.allBookings = loadedBookings
          this.pagination.total = total
          
          // Update stats
          this.bookingsStats.total = total
          this.bookingsStats.upcoming = upcoming.length
          
          // If using client-side filtering and all records loaded, update lastPage
          if (!shouldUseBackend && total <= loadedBookings.length) {
            this.pagination.lastPage = Math.ceil(loadedBookings.length / this.pagination.perPage)
          }
        }
      } catch (err) {
        console.error('Error loading bookings:', err)
        toast.error('Failed to load bookings')
      } finally {
        this.bookingsLoading = false
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.currentPage = page
        // If using backend filtering, reload for new page
        if (this.useBackendFiltering) {
          this.loadBookings(true)
        }
        // Scroll to top of bookings section
        this.$nextTick(() => {
          const bookingsSection = this.$el.querySelector('.settings-section')
          if (bookingsSection) {
            bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }
    },
    changePerPage(perPage) {
      this.pagination.perPage = perPage
      this.pagination.currentPage = 1
      // Reload if using backend filtering
      if (this.useBackendFiltering) {
        this.loadBookings(true)
      }
    },
    handleStatusFilterChange() {
      this.pagination.currentPage = 1
      // If using backend filtering, watcher will reload
      // If client-side, computed property handles it
    },
    setViewFilter(view) {
      this.filters.view = view
      // Watcher will handle page reset, no reload needed (client-side filter)
    },
    setSortBy(field) {
      this.sortBy = field
      // Watcher will handle page reset and reload
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      // Watcher will handle page reset and reload
    },

    confirmBooking(bookingId) {
      this.confirmModal.bookingId = bookingId
      this.confirmModal.videoCallLink = ''
      this.confirmModal.visible = true
    },

    async submitConfirmBooking() {
      if (!this.confirmModal.bookingId) return

      this.actionLoading = true

      try {
        const result = await apiService.confirmConsultationBooking(
          this.confirmModal.bookingId,
          this.confirmModal.videoCallLink || null
        )

        if (result.success) {
          toast.success('Booking confirmed successfully!')
          this.closeConfirmModal()
          this.loadBookings()
        } else {
          toast.error(result.error || 'Failed to confirm booking')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to confirm booking')
      } finally {
        this.actionLoading = false
      }
    },

    closeConfirmModal() {
      this.confirmModal.visible = false
      this.confirmModal.bookingId = null
      this.confirmModal.videoCallLink = ''
    },

    async completeBooking(bookingId) {
      if (!confirm('Mark this consultation as completed?')) return

      this.actionLoading = true

      try {
        const result = await apiService.completeConsultationBooking(bookingId)

        if (result.success) {
          toast.success('Booking marked as completed!')
          this.loadBookings()
        } else {
          toast.error(result.error || 'Failed to complete booking')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to complete booking')
      } finally {
        this.actionLoading = false
      }
    },

    async cancelBooking(bookingId) {
      const reason = prompt('Please provide a reason for cancellation (optional):')
      if (reason === null) return // User cancelled

      this.actionLoading = true

      try {
        const result = await apiService.cancelConsultationBooking(bookingId, reason || null)

        if (result.success) {
          toast.success('Booking cancelled successfully')
          this.loadBookings()
        } else {
          toast.error(result.error || 'Failed to cancel booking')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to cancel booking')
      } finally {
        this.actionLoading = false
      }
    },

    formatDateTime(dateTimeString, timezone) {
      if (!dateTimeString) return 'N/A'
      try {
        const date = new Date(dateTimeString)
        return new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: timezone || 'UTC',
        }).format(date)
      } catch (err) {
        return dateTimeString
      }
    },

    formatPrice(price, currency = 'USD') {
      if (price === undefined || price === null) return 'N/A'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(price)
    },
  },
}
</script>

<style scoped>
.consultation-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.settings-intro {
  margin-bottom: var(--spacing-xl);
}

.settings-intro h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-intro h1 i {
  color: var(--secondary-color);
}

.settings-intro p {
  color: var(--text-secondary);
  margin: 0;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-header h2 i {
  color: var(--secondary-color);
}

.stats-row {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.consultation-form {
  max-width: 100%;
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.form-row .form-group {
  flex: 1;
  min-width: 200px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--secondary-color);
}

.helper-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.price-input-group {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-sm);
}

.currency-select {
  min-width: 100px;
}

.form-input {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px var(--secondary-light);
}

textarea.form-input {
  resize: vertical;
  font-family: var(--font-family);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
}

.form-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.save-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.save-btn:hover:not(:disabled) {
  background: var(--secondary-hover);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.booking-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.booking-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.booking-customer {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.customer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.customer-avatar.placeholder {
  color: var(--text-secondary);
}

.booking-customer h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.customer-email {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-item i {
  width: 16px;
  color: var(--text-tertiary);
}

.payment-status {
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: var(--spacing-xs);
}

.payment-status.payment-paid {
  background: #d1fae5;
  color: #065f46;
}

.payment-status.payment-pending {
  background: #fef3c7;
  color: #92400e;
}

.payment-status.payment-refunded {
  background: #fee2e2;
  color: #991b1b;
}

.booking-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn.confirm {
  background: #10b981;
  color: white;
}

.action-btn.complete {
  background: #3b82f6;
  color: white;
}

.action-btn.cancel {
  background: #ef4444;
  color: white;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancellation-reason {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
}

.loading-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.2;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.empty-state p {
  margin: 0 0 var(--spacing-lg) 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: var(--spacing-md);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: min(500px, 95%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.modal-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.modal-btn.ghost {
  background: transparent;
  color: var(--text-secondary);
}

.modal-btn.ghost:hover {
  background: var(--bg-secondary);
}

.modal-btn.primary {
  background: var(--secondary-color);
  color: white;
}

.modal-btn.primary:hover:not(:disabled) {
  background: var(--secondary-hover);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bookings Controls */
.bookings-controls {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.controls-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
}

.toggle-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.toggle-btn.active {
  background: var(--secondary-color);
  color: white;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.filter-select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-select:hover {
  border-color: var(--border-medium);
}

.filter-select:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(72, 196, 200, 0.1);
}

.sort-order-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
}

.sort-order-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.sort-order-btn i {
  font-size: var(--font-size-sm);
}

.bookings-info {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.bookings-count {
  font-weight: 500;
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-page:hover:not(:disabled):not(.active) {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.pagination-page.active {
  background: var(--secondary-color);
  border-color: var(--secondary-color);
  color: white;
}

.pagination-page.disabled {
  border: none;
  background: transparent;
  cursor: default;
}

.pagination-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }

  .view-toggle {
    width: 100%;
    justify-content: stretch;
  }

  .toggle-btn {
    flex: 1;
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
    max-width: 200px;
  }

  .pagination-controls {
    flex-direction: column;
  }

  .pagination-pages {
    order: -1;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>

