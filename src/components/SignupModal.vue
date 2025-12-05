<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Create Account</h2>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="form-input"
              placeholder="Enter first name"
              required
            />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="form-input"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

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
            placeholder="Create a password"
            required
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.agreeTerms" required />
            <span class="checkmark"></span>
            I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a>
          </label>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="signup-btn" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="social-login">
          <button type="button" class="social-btn google-btn" @click="signupWithGoogle">
            <i class="fab fa-google"></i>
            Continue with Google
          </button>
        </div>

        <div class="login-link">
          Already have an account? 
          <a href="#" @click.prevent="switchToLogin">Sign in</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'

export default {
  name: 'SignupModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      isLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    isFormValid() {
      return this.form.firstName && 
             this.form.lastName && 
             this.form.email && 
             this.form.password && 
             this.form.confirmPassword && 
             this.form.password === this.form.confirmPassword &&
             this.form.agreeTerms
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    async handleSignup() {
      if (!this.isFormValid) return
      
      this.isLoading = true
      this.errorMessage = ''
      try {
        const result = await apiService.register({
          first_name: this.form.firstName,
          last_name: this.form.lastName,
          email: this.form.email,
          password: this.form.password,
          password_confirmation: this.form.confirmPassword
        })
        
        if (result.success) {
          let user = result?.data?.user || result?.data?.data || null

          // After registration, verify that the session is established
          // If not, explicitly log in to establish the session
          const authCheck = await apiService.getCurrentUser()
          if (!authCheck.success) {
            // Session not established, explicitly log in
            const loginResult = await apiService.login({
              email: this.form.email,
              password: this.form.password
            })
            
            if (loginResult.success) {
              // Get user data after login
            const profileResult = await apiService.getCurrentUser()
            if (profileResult.success) {
              user = profileResult.data
              }
            } else {
              this.errorMessage = 'Account created, but automatic login failed. Please sign in manually.'
              return
            }
          } else {
            // Session is established, use the user data from auth check
            user = authCheck.data
          }

          this.$emit('signup-success', user)
          this.closeModal()
          return
        }

        this.errorMessage = result.error || 'Registration failed'
      } catch (error) {
        console.error('Signup failed:', error)
        this.errorMessage = error.message || 'Registration failed. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    
    signupWithGoogle() {
      // Store current route before redirecting to OAuth
      const currentRoute = this.$route.fullPath
      sessionStorage.setItem('oauth_redirect_path', currentRoute)
      
      // The backend now manages the session with HTTP-only cookies, so the callback page just looks up /api/me.
      window.location.href = apiService.getGoogleAuthUrl()
    },
    
    switchToLogin() {
      this.errorMessage = ''
      this.$emit('switch-to-login')
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
  max-width: 450px;
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

.signup-form {
  padding: var(--spacing-xl);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
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
  margin-bottom: var(--spacing-xl);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  margin-right: var(--spacing-sm);
  margin-top: 2px;
}

.terms-link {
  color: var(--secondary-color);
  text-decoration: none;
  transition: var(--transition-normal);
}

.terms-link:hover {
  text-decoration: underline;
}

.signup-btn {
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

.signup-btn:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.signup-btn:disabled {
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

.login-link {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.login-link a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
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
  .signup-form {
    padding: var(--spacing-lg);
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
