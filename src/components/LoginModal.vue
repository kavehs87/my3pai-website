<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Welcome Back</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            <span class="checkmark"></span>
            Remember me
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="social-login">
          <button type="button" class="social-btn google-btn" @click="loginWithGoogle">
            <i class="fab fa-google"></i>
            Continue with Google
          </button>
        </div>

        <div class="signup-link">
          Don't have an account? 
          <a href="#" @click.prevent="switchToSignup">Sign up</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'
import { getGuestSessionId, clearGuestSessionId, hasGuestSessionId } from '../utils/sessionManager.js'

export default {
  name: 'LoginModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    /**
     * Merge guest cart into user cart after login
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
          if (this.$toast) {
            this.$toast.error(mergeResult.error || 'Failed to merge your cart items. Please add them again.')
          } else {
            console.error('Cart merge failed:', mergeResult.error)
          }
        }
      } catch (error) {
        console.error('Error merging guest cart:', error)
        if (this.$toast) {
          this.$toast.error('Failed to merge your cart items. Please add them again.')
        }
      }
    },
    
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const result = await apiService.login({
          email: this.form.email,
          password: this.form.password
        })
        
        if (result.success) {
          let user = result?.data?.user || result?.data?.data || null

          if (!user) {
            const profileResult = await apiService.getCurrentUser()
            if (profileResult.success) {
              user = profileResult.data
            } else {
              this.errorMessage = profileResult.error || 'Login succeeded, but we could not load your account.'
              return
            }
          }

          // Merge guest cart silently after successful login
          await this.mergeGuestCart()

          this.$emit('login-success', user)
          this.closeModal()
          return
        }

        // Show detailed error message from backend
        let errorMsg = result.error || 'Login failed'
        
        // For 500 errors, log the full error data to help debug backend issue
        if (result.status === 500) {
          console.error('Login 500 error details:', result.data)
          errorMsg = result.data?.message || result.data?.error || 'Server error occurred during login. Please check the console for details.'
        }
        
        this.errorMessage = errorMsg
      } catch (error) {
        console.error('Login failed:', error)
        console.error('Error details:', error)
        
        // Provide more specific error messages
        if (error.status === 500) {
          this.errorMessage = 'Server error occurred during login. Please check the console for details.'
        } else if (error.status === 401 || error.status === 422) {
          this.errorMessage = error.message || 'Invalid email or password. Please check your credentials and try again.'
        } else {
        this.errorMessage = error.message || 'Login failed. Please check your credentials and try again.'
        }
      } finally {
        this.isLoading = false
      }
    },
    
    loginWithGoogle() {
      // Store current route before redirecting to OAuth
      const currentRoute = this.$route.fullPath
      sessionStorage.setItem('oauth_redirect_path', currentRoute)
      
      // The backend now finishes login via HTTP-only cookies, so the callback page only needs to read /api/me.
      window.location.href = apiService.getGoogleAuthUrl()
    },
    
    switchToSignup() {
      this.errorMessage = ''
      this.$emit('switch-to-signup')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.login-form {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.checkbox-label input[type="checkbox"] {
  margin-right: var(--spacing-sm);
}

.forgot-link {
  color: var(--secondary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: var(--transition-normal);
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.login-btn:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  text-align: center;
  margin: var(--spacing-xl) 0;
  position: relative;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-light);
}

.divider span {
  background: var(--bg-primary);
  padding: 0 var(--spacing-md);
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.social-btn:hover {
  background: var(--bg-primary);
  border-color: var(--border-medium);
}

.google-btn:hover {
  border-color: #db4437;
  color: #db4437;
}


.signup-link {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.signup-link a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  text-align: center;
}

@media (max-width: 480px) {
  .modal-content {
    margin: var(--spacing-sm);
  }
  
  .modal-header,
  .login-form {
    padding: var(--spacing-lg);
  }
}
</style>
