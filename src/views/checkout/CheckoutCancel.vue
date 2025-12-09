<template>
  <div class="checkout-cancel">
    <div class="cancel-container">
      <div class="cancel-icon">
        <i class="fas fa-times-circle"></i>
      </div>
      
      <h1 class="cancel-title">Payment Cancelled</h1>
      <p class="cancel-message">
        Your payment was not completed. No charges have been made.
      </p>
      
      <div class="cancel-actions">
        <button 
          @click="tryAgain" 
          class="btn btn-primary"
        >
          <i class="fas fa-redo"></i>
          Try Again
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
export default {
  name: 'CheckoutCancel',
  methods: {
    tryAgain() {
      // Navigate back to cart or booking page
      // Check if there's a stored redirect path, otherwise go to home
      const redirectPath = sessionStorage.getItem('checkout_redirect_path') || '/'
      sessionStorage.removeItem('checkout_redirect_path')
      this.$router.push(redirectPath)
    },
    goHome() {
      this.$router.push({ path: '/' })
    }
  }
}
</script>

<style scoped>
.checkout-cancel {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  padding: var(--spacing-xl);
}

.cancel-container {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.cancel-icon {
  margin-bottom: var(--spacing-xl);
}

.cancel-icon i {
  font-size: 5rem;
  color: var(--error-color);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.cancel-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.cancel-message {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
}

.cancel-actions {
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
  .cancel-container {
    padding: var(--spacing-xl);
  }
  
  .cancel-title {
    font-size: var(--font-size-2xl);
  }
  
  .cancel-icon i {
    font-size: 4rem;
  }
}
</style>

