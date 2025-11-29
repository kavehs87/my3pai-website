<template>
  <div class="consultation-settings">
    <div class="container">
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

        <div v-if="bookingsLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading bookings...
        </div>

        <div v-else-if="bookings.length === 0" class="empty-state">
          <i class="fas fa-calendar-times"></i>
          <h3>No bookings yet</h3>
          <p>When clients book consultations, they'll appear here</p>
        </div>

        <div v-else class="bookings-list">
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

export default {
  name: 'ProfileConsultationSettings',
  data() {
    return {
      loading: false,
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
      bookings: [],
      bookingsStats: {
        upcoming: 0,
        total: 0,
      },
      confirmModal: {
        visible: false,
        bookingId: null,
        videoCallLink: '',
      },
    }
  },
  mounted() {
    this.loadConsultation()
    this.loadBookings()
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

    async loadBookings() {
      this.bookingsLoading = true

      try {
        const result = await apiService.getInfluencerConsultationBookings()

        if (result.success && result.data?.data) {
          const data = result.data.data
          const upcoming = data.upcoming || []
          const past = data.past || []
          this.bookings = [...upcoming, ...past]
          this.bookingsStats = {
            upcoming: upcoming.length,
            total: this.bookings.length,
          }
        }
      } catch (err) {
        console.error('Error loading bookings:', err)
        toast.error('Failed to load bookings')
      } finally {
        this.bookingsLoading = false
      }
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
  color: #06b6d4;
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
  color: #06b6d4;
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
  accent-color: #06b6d4;
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
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
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
  background: #06b6d4;
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
  background: #0891b2;
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
  background: #06b6d4;
  color: white;
}

.modal-btn.primary:hover:not(:disabled) {
  background: #0891b2;
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
</style>

