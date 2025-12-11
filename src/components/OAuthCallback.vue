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
import { getGuestSessionId, clearGuestSessionId, hasGuestSessionId } from '../utils/sessionManager.js'

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
  methods: {
    /**
     * Merge guest cart into user cart after OAuth login
     */
    async mergeGuestCart() {
      if (!hasGuestSessionId()) {
        return // No guest cart to merge
      }

      try {
        const sessionId = getGuestSessionId()
        const mergeResult = await apiService.mergeCart(sessionId)
        
        if (mergeResult.success) {
          // Clear guest session ID after successful merge
          clearGuestSessionId()
        } else {
          // Show error to user if merge fails
          console.error('Cart merge failed:', mergeResult.error)
          // Note: We don't show toast here as user is on callback page
          // Error will be shown via eventBus if needed
        }
      } catch (error) {
        console.error('Error merging guest cart:', error)
      }
    },
    handleFailure(message) {
      this.isError = true
      this.statusTitle = 'Unable to complete sign in'
      this.statusDescription = message || 'Please return to the login page and try again.'
      
      // Try to redirect to original route on error, otherwise go to home
      const redirectPath = sessionStorage.getItem('oauth_redirect_path') || '/'
      sessionStorage.removeItem('oauth_redirect_path')
      
      this.redirectTimer = setTimeout(() => {
        this.$router.push(`${redirectPath}?auth_error=1`)
      }, 2500)
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
      // Log for debugging
      console.log('OAuth callback: Checking session...', {
        hostname: window.location.hostname,
        apiBaseUrl: apiService.baseURL,
        cookies: document.cookie
      })

      const result = await apiService.getCurrentUser()

      console.log('OAuth callback: getCurrentUser result:', {
        success: result.success,
        status: result.status,
        error: result.error,
        data: result.data
      })

      if (result.success) {
        // Merge guest cart silently after successful OAuth login
        await this.mergeGuestCart()
        
        eventBus.emit('auth-success', result.data)
        
        // Redirect to the original route if stored, otherwise go to home
        const redirectPath = sessionStorage.getItem('oauth_redirect_path') || '/'
        sessionStorage.removeItem('oauth_redirect_path')
        this.$router.push(redirectPath)
        return
      }

      if (result.status === 401) {
        console.error('OAuth callback: 401 Unauthorized - Session cookie not recognized', {
          apiBaseUrl: apiService.baseURL,
          cookies: document.cookie,
          response: result
        })
        this.handleFailure('We could not verify your session. Please try signing in again.')
      } else {
        console.error('OAuth callback: Unexpected error', result)
        this.handleFailure(result.error || 'Unexpected error while completing sign in.')
      }
    } catch (error) {
      console.error('OAuth callback error:', error, {
        apiBaseUrl: apiService.baseURL,
        cookies: document.cookie
      })
      this.handleFailure('Something went wrong while signing you in. Please try again.')
    }
  },
  beforeUnmount() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer)
      this.redirectTimer = null
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
