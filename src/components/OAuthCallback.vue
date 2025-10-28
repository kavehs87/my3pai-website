<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <h2>Completing sign in...</h2>
      <p>Please wait while we finish setting up your account.</p>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'
import eventBus from '../utils/eventBus.js'

export default {
  name: 'OAuthCallback',
  async mounted() {
    try {
      // Check if token is provided in URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      
      if (token) {
        // Store the token and get user data
        apiService.setToken(token)
        const result = await apiService.getCurrentUser()
        
        if (result.success) {
          // Emit auth success event globally with user data
          eventBus.emit('auth-success', result.data)
          this.$router.push('/')
          return
        }
      }
      
      // If no token in URL, try to get current user (in case Laravel set cookie)
      const result = await apiService.getCurrentUser()
      
      if (result.success) {
        // Store user data and redirect to home
        eventBus.emit('auth-success', result.data)
        this.$router.push('/')
      } else {
        // Handle authentication failure
        console.error('OAuth authentication failed:', result.error)
        this.$router.push('/?auth_error=1')
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      this.$router.push('/?auth_error=1')
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
</style>
