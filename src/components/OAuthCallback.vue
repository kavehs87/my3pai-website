<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <h2 :class="{ 'error-text': isError }">{{ statusTitle }}</h2>
      <p :class="{ 'error-text': isError }">{{ statusDescription }}</p>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'
import eventBus from '../utils/eventBus.js'

export default {
  name: 'OAuthCallback',
  data() {
    return {
      statusTitle: 'Completing sign in...',
      statusDescription: 'Please wait while we finish setting up your account.',
      isError: false,
      redirectTimer: null
    }
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search)
    const backendError = urlParams.get('error')

    if (backendError) {
      this.handleFailure(decodeURIComponent(backendError))
      return
    }

    try {
      const result = await apiService.getCurrentUser()

      if (result.success) {
        eventBus.emit('auth-success', result.data)
        this.$router.push('/')
        return
      }

      if (result.status === 401) {
        this.handleFailure('We could not verify your session. Please try signing in again.')
      } else {
        this.handleFailure(result.error || 'Unexpected error while completing sign in.')
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      this.handleFailure('Something went wrong while signing you in. Please try again.')
    }
  },
  beforeUnmount() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer)
      this.redirectTimer = null
    }
  },
  methods: {
    handleFailure(message) {
      this.isError = true
      this.statusTitle = 'Unable to complete sign in'
      this.statusDescription = message || 'Please return to the login page and try again.'
      this.redirectTimer = setTimeout(() => {
        this.$router.push('/?auth_error=1')
      }, 2500)
    }
  }
}
</script>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
}

.loading-container {
  text-align: center;
  padding: var(--spacing-xl);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.error-text {
  color: var(--error-color, #ef4444);
}
</style>
