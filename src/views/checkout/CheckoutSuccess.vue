<template>
  <div class="checkout-success">
    <div class="success-container">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      
      <h1 class="success-title">Payment Successful!</h1>
      <p class="success-message">Your booking is confirmed.</p>
      
      <!-- Order Information -->
      <div v-if="loadingOrder" class="order-info loading">
        <div class="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
      
      <div v-else-if="order && (order.order_number || order.id)" class="order-info">
        <div class="order-card">
          <div class="order-header">
            <div>
              <h3 class="order-label">Order Number</h3>
              <p class="order-value">{{ order.order_number || `#${order.id}` || 'N/A' }}</p>
            </div>
            <div v-if="order.created_at" class="order-date">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
          
          <div class="order-details">
            <div v-if="order.items && order.items.length > 0" class="detail-row">
              <span class="detail-label">Items:</span>
              <span class="detail-value">{{ order.items.length }} item(s)</span>
            </div>
            <div v-else-if="order.item_count" class="detail-row">
              <span class="detail-label">Items:</span>
              <span class="detail-value">{{ order.item_count }} item(s)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total:</span>
              <span class="detail-value total">
                {{ formatPrice(
                  getOrderTotal(order), 
                  order.currency || order.currency_code || 'USD'
                ) }}
              </span>
            </div>
            <div v-if="order.status" class="detail-row">
              <span class="detail-label">Status:</span>
              <span :class="['status-badge', getStatusClass(order.status)]">
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>
          
          <div v-if="order.id" class="order-actions">
            <button 
              @click="viewOrder" 
              class="btn btn-link"
            >
              <i class="fas fa-eye"></i>
              View Full Order Details
            </button>
          </div>
        </div>
      </div>
      
      <div v-else-if="orderError" class="order-info error">
        <p class="error-message">{{ orderError }}</p>
      </div>
      
      <div class="success-actions">
        <button 
          @click="goToBookings" 
          class="btn btn-primary"
        >
          <i class="fas fa-calendar-check"></i>
          Go to My Bookings
        </button>
        <button 
          @click="goHome" 
          class="btn btn-secondary"
        >
          <i class="fas fa-home"></i>
          Return Home
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../../services/api.js'

export default {
  name: 'CheckoutSuccess',
  data() {
    return {
      order: null,
      loadingOrder: false,
      orderError: null
    }
  },
  methods: {
    goToBookings() {
      // Navigate to profile/bookings section
      this.$router.push({ name: 'profile', hash: '#bookings' })
    },
    goHome() {
      this.$router.push({ path: '/' })
    },
    async fetchOrderDetails() {
      const urlParams = new URLSearchParams(window.location.search)
      const orderId = urlParams.get('order_id')
      const sessionId = urlParams.get('session_id')
      
      // Debug: Log URL parameters
      console.log('Checkout Success URL params:', {
        order_id: orderId,
        session_id: sessionId,
        allParams: Object.fromEntries(urlParams.entries())
      })
      
      // Try to get order_id first, then session_id
      if (!orderId && !sessionId) {
        console.log('No order_id or session_id found in URL')
        // Don't show error, just don't display order info
        return
      }
      
      this.loadingOrder = true
      this.orderError = null
      
      try {
        let result
        
        // Prefer order_id if available
        if (orderId) {
          console.log('Fetching order by order_id:', orderId)
          result = await apiService.getOrder(orderId)
          console.log('Order result:', result)
        } else if (sessionId) {
          // Try to get order by session_id
          // Note: Backend may need to support this endpoint
          console.log('Fetching order by session_id:', sessionId)
          try {
            result = await apiService.request(`/orders?session_id=${sessionId}`, {
              method: 'GET',
              requireCsrf: false
            })
            console.log('Order result by session_id:', result)
          } catch (error) {
            // If session_id lookup fails, that's okay - user can still view order in profile
            console.warn('Could not fetch order by session_id:', error)
            result = null
          }
        }
        
        if (result && result.success && result.data) {
          // Handle different response structures
          const orderData = result.data.data || result.data
          console.log('Parsed order data:', orderData)
          
          // Validate that we have meaningful order data
          if (orderData && (orderData.id || orderData.order_number || orderData.items)) {
            this.order = orderData
          } else {
            console.warn('Order data structure unexpected:', orderData)
            this.orderError = 'Order details are not available yet. Please check your profile for order information.'
          }
        } else {
          console.warn('No order data in result:', result)
          this.orderError = 'Could not load order details. You can view your order in your profile.'
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        this.orderError = 'Could not load order details. You can view your order in your profile.'
      } finally {
        this.loadingOrder = false
      }
    },
    viewOrder() {
      if (this.order && this.order.id) {
        this.$router.push({
          name: 'profile',
          query: { tab: 'order-detail', orderId: this.order.id }
        })
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getOrderTotal(order) {
      // Handle different total field formats
      if (order.total_amount_cents !== undefined) {
        return order.total_amount_cents / 100
      }
      if (order.total_amount !== undefined) {
        return typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0
      }
      if (order.total !== undefined) {
        return typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0
      }
      if (order.amount !== undefined) {
        return typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0
      }
      return 0
    },
    formatPrice(amount, currency = 'USD') {
      if (amount === 0) return 'Free'
      const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(',', '.')) : amount
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numericAmount)
    },
    formatStatus(status) {
      const statusMap = {
        pending: 'Pending',
        processing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled',
        refunded: 'Refunded'
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      const classes = {
        pending: 'status-pending',
        processing: 'status-processing',
        completed: 'status-completed',
        cancelled: 'status-cancelled',
        refunded: 'status-refunded'
      }
      return classes[status] || 'status-default'
    }
  },
  mounted() {
    this.fetchOrderDetails()
  }
}
</script>

<style scoped>
.checkout-success {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  padding: var(--spacing-xl);
}

.success-container {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  margin-bottom: var(--spacing-xl);
}

.success-icon i {
  font-size: 5rem;
  color: var(--success-color);
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.success-message {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* Order Information Styles */
.order-info {
  margin: var(--spacing-xl) 0;
  text-align: left;
}

.order-info.loading {
  text-align: center;
  padding: var(--spacing-lg);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--bg-secondary);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--spacing-sm);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-info.error {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.error-message {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.order-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.order-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.order-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
}

.order-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-date i {
  font-size: var(--font-size-xs);
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-base);
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
}

.detail-value.total {
  font-size: var(--font-size-lg);
  color: var(--primary-color);
  font-weight: 700;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #f3f4f6;
  color: #374151;
}

.status-refunded {
  background: #fee2e2;
  color: #991b1b;
}

.status-default {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.order-actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.btn-link {
  background: transparent;
  color: var(--primary-color);
  border: none;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  text-decoration: underline;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.btn-link:hover {
  color: var(--primary-hover);
}

.btn-link i {
  font-size: var(--font-size-xs);
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 52, 78, 0.3);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: var(--bg-primary);
}

.btn i {
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .success-container {
    padding: var(--spacing-xl);
  }
  
  .success-title {
    font-size: var(--font-size-2xl);
  }
  
  .success-icon i {
    font-size: 4rem;
  }
}
</style>

