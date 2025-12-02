<template>
  <div class="my-consultation-bookings">
    <div class="section-header">
      <h2><i class="fas fa-calendar-check"></i> My Consultation Bookings</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading bookings...
    </div>

    <div v-else-if="shouldShowEmptyState" class="empty-state">
      <i class="fas fa-calendar-times"></i>
      <h3>No consultation bookings yet</h3>
      <p>Book a consultation with an influencer to get personalized trip planning advice</p>
    </div>

    <div v-else class="bookings-container">
      <!-- Upcoming Bookings -->
      <div v-if="upcomingBookings.length > 0" class="bookings-section">
        <h3 class="section-title">Upcoming</h3>
        <div class="bookings-list">
          <article
            v-for="booking in upcomingBookings"
            :key="booking.id"
            class="booking-card"
            :class="{
              'status-pending': booking.status === 'pending',
              'status-confirmed': booking.status === 'confirmed',
            }"
          >
            <div class="booking-header">
              <div class="booking-influencer">
                <div
                  v-if="booking.influencer?.avatar"
                  class="influencer-avatar"
                  :style="{ backgroundImage: `url(${booking.influencer.avatar})` }"
                ></div>
                <div v-else class="influencer-avatar placeholder">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <h4>{{ booking.influencer?.name || 'Influencer' }}</h4>
                  <p class="influencer-handle">
                    {{ booking.influencer?.username ? `@${booking.influencer.username}` : '' }}
                  </p>
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
                <i class="fas fa-clock"></i>
                <span>{{ booking.consultation?.durationMinutes || 60 }} minutes</span>
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
              <button
                v-if="booking.status === 'pending' && booking.paymentStatus === 'pending'"
                class="action-btn primary"
                @click="handlePayment(booking)"
                :disabled="actionLoading"
              >
                <i class="fas fa-credit-card"></i> Complete Payment
              </button>
              <button
                v-if="canCancel(booking)"
                class="action-btn cancel"
                @click="cancelBooking(booking.id)"
                :disabled="actionLoading"
              >
                <i class="fas fa-times"></i> Cancel
              </button>
              <a
                v-if="booking.influencer?.username"
                :href="`/influencer/${booking.influencer.username}`"
                class="action-btn link"
              >
                <i class="fas fa-external-link-alt"></i> View Profile
              </a>
            </div>
          </article>
        </div>
      </div>

      <!-- Past Bookings -->
      <div v-if="pastBookings.length > 0" class="bookings-section">
        <h3 class="section-title">Past Consultations</h3>
        <div class="bookings-list">
          <article
            v-for="booking in pastBookings"
            :key="booking.id"
            class="booking-card"
            :class="{
              'status-completed': booking.status === 'completed',
              'status-cancelled': booking.status === 'cancelled',
            }"
          >
            <div class="booking-header">
              <div class="booking-influencer">
                <div
                  v-if="booking.influencer?.avatar"
                  class="influencer-avatar"
                  :style="{ backgroundImage: `url(${booking.influencer.avatar})` }"
                ></div>
                <div v-else class="influencer-avatar placeholder">
                  <i class="fas fa-user"></i>
                </div>
                <div>
                  <h4>{{ booking.influencer?.name || 'Influencer' }}</h4>
                  <p class="influencer-handle">
                    {{ booking.influencer?.username ? `@${booking.influencer.username}` : '' }}
                  </p>
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
              </div>
              <div v-if="booking.cancellationReason" class="detail-item notes">
                <i class="fas fa-info-circle"></i>
                <span>Cancelled: {{ booking.cancellationReason }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '@/services/api'
import toast from '@/utils/toast'

export default {
  name: 'MyConsultationBookings',
  props: {
    consultationBookingsCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      actionLoading: false,
      upcomingBookings: [],
      pastBookings: [],
    }
  },
  computed: {
    hasBookings() {
      return this.upcomingBookings.length > 0 || this.pastBookings.length > 0
    },
    shouldShowEmptyState() {
      // Show empty state only if we've loaded and confirmed there are no bookings
      // If count from stats is 0 and loading is done, show empty state
      return !this.loading && !this.hasBookings && this.consultationBookingsCount === 0
    },
  },
  mounted() {
    this.loadBookings()
  },
  methods: {
    async loadBookings() {
      this.loading = true

      try {
        const result = await apiService.getMyConsultationBookings()

        if (result.success) {
          // Handle different response structures
          const responseData = result.data?.data || result.data
          if (responseData) {
            this.upcomingBookings = responseData.upcoming || []
            this.pastBookings = responseData.past || []
          }
        } else {
          console.warn('Failed to load bookings:', result.error)
          // Don't show error toast if endpoint might not exist yet or if count is 0
          if (this.consultationBookingsCount > 0) {
            toast.error(result.error || 'Failed to load bookings')
          }
        }
      } catch (err) {
        console.error('Error loading bookings:', err)
        // Only show error if we expect bookings (count > 0)
        if (this.consultationBookingsCount > 0) {
          toast.error('Failed to load bookings')
        }
      } finally {
        this.loading = false
      }
    },

    canCancel(booking) {
      if (booking.status === 'cancelled' || booking.status === 'completed') {
        return false
      }
      // Check if it's more than 24 hours before scheduled time
      const scheduledTime = new Date(booking.scheduledAt)
      const now = new Date()
      const hoursUntil = (scheduledTime - now) / (1000 * 60 * 60)
      return hoursUntil > 24 || booking.status === 'pending'
    },

    handlePayment(booking) {
      // TODO: Implement Stripe payment integration
      toast.info('Payment integration coming soon. Please check your email for payment instructions.')
    },

    async cancelBooking(bookingId) {
      if (!confirm('Are you sure you want to cancel this consultation? You may be subject to cancellation fees if less than 24 hours before the scheduled time.')) {
        return
      }

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
.my-consultation-bookings {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bookings-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.booking-card {
  background: var(--bg-primary);
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

.booking-influencer {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.influencer-avatar {
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

.influencer-avatar.placeholder {
  color: var(--text-secondary);
}

.booking-influencer h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.influencer-handle {
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

.detail-item.notes {
  font-style: italic;
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
  flex-wrap: wrap;
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn.primary {
  background: var(--secondary-color);
  color: white;
}

.action-btn.cancel {
  background: #ef4444;
  color: white;
}

.action-btn.link {
  background: transparent;
  color: var(--secondary-color);
  border: 1px solid var(--secondary-color);
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}
</style>

