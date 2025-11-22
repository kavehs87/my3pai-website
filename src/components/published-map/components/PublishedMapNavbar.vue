<template>
  <nav class="published-map-navbar">
    <div class="navbar-container">
      <!-- Logo Section -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <img src="/logo-small.png" alt="My3PAI Logo" class="logo-image" />
          <span class="brand-text">My3P Creators</span>
        </router-link>
      </div>

      <!-- Center Navigation -->
      <nav class="navbar-nav">
        <router-link to="/" class="nav-link">Discover</router-link>
        <router-link to="/profile?tab=maps" class="nav-link">My Maps</router-link>
        <a href="#" class="nav-link">Help</a>
      </nav>

      <!-- Right Side Actions -->
      <div class="navbar-actions">
        <!-- Language Selector -->
        <div class="language-selector">
          <i class="fas fa-globe"></i>
          <span>EN</span>
        </div>

        <!-- User Profile / Login -->
        <div class="user-profile">
          <div v-if="isLoggedIn" class="profile-dropdown">
            <div class="profile-picture" @click="toggleProfileDropdown">
              <img :src="user.avatar || user.picture || user.photo_url || 'https://i.pravatar.cc/40?img=41'" :alt="user.name || user.display_name" />
            </div>
            <div v-if="showProfileDropdown" class="dropdown-menu">
              <div class="dropdown-header">
                <div class="user-info">
                  <div class="user-name">{{ user.name || user.display_name || user.first_name + ' ' + user.last_name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" @click.prevent="navigateToProfile('overview')">Profile</a>
              <a href="#" class="dropdown-item" @click.prevent="navigateToProfile('settings')">Settings</a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="logout" :disabled="isLoggingOut">
                <span v-if="isLoggingOut" class="loading-spinner"></span>
                {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
              </button>
            </div>
          </div>
          <button v-else class="login-btn" @click="showLoginModal">
            <i class="fas fa-user"></i>
            <span>Sign In</span>
          </button>
        </div>
      </div>

    <!-- Login Modal -->
    <LoginModal 
      :isOpen="showLogin" 
      @close="closeLoginModal" 
      @login-success="handleLoginSuccess"
      @switch-to-signup="handleSwitchToSignup"
    />

    <!-- Signup Modal -->
    <SignupModal 
      :isOpen="showSignup" 
      @close="closeSignupModal" 
      @signup-success="handleSignupSuccess"
      @switch-to-login="handleSwitchToLogin"
    />
    </div>
  </nav>
</template>

<script>
import LoginModal from '../../LoginModal.vue'
import SignupModal from '../../SignupModal.vue'
import apiService from '../../../services/api.js'
import eventBus from '../../../utils/eventBus.js'

export default {
  name: 'PublishedMapNavbar',
  components: {
    LoginModal,
    SignupModal
  },
  data() {
    return {
      showLogin: false,
      showSignup: false,
      showProfileDropdown: false,
      isLoggedIn: false,
      isLoggingOut: false,
      user: {
        name: '',
        email: '',
        avatar: ''
      }
    }
  },
  async mounted() {
    // Check if user is already logged in on page load
    await this.checkAuthStatus()
    
    // Listen for auth success events from OAuth callback
    eventBus.on('auth-success', this.handleAuthSuccess)
    
    // Listen for profile update events (avatar, profile changes)
    eventBus.on('profile-updated', this.handleProfileUpdate)
    
    // Add click outside handler for dropdown
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // Clean up event listener
    eventBus.off('auth-success', this.handleAuthSuccess)
    eventBus.off('profile-updated', this.handleProfileUpdate)
    
    // Remove click outside handler
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    showLoginModal() {
      this.showLogin = true
    },
    closeLoginModal() {
      this.showLogin = false
    },
    handleLoginSuccess(userData) {
      this.isLoggedIn = true
      this.user = userData
      this.closeLoginModal()
    },
    handleSwitchToSignup() {
      this.showLogin = false
      this.showSignup = true
    },
    closeSignupModal() {
      this.showSignup = false
    },
    handleSignupSuccess(userData) {
      this.isLoggedIn = true
      this.user = userData
      this.closeSignupModal()
    },
    handleSwitchToLogin() {
      this.showSignup = false
      this.showLogin = true
    },
    async checkAuthStatus() {
      try {
        const result = await apiService.getCurrentUser()
        if (result.success) {
          this.isLoggedIn = true
          const userData = result.data || {}
          // Normalize user data format (handle different response structures)
          this.user = {
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.display_name || '',
            first_name: userData.first_name,
            last_name: userData.last_name,
            display_name: userData.display_name,
            email: userData.email || '',
            avatar: userData.avatar || userData.picture || userData.photo_url || '',
            picture: userData.picture || userData.avatar,
            photo_url: userData.photo_url || userData.avatar
          }
        } else {
          this.isLoggedIn = false
          this.user = { name: '', email: '', avatar: '' }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        this.isLoggedIn = false
        this.user = { name: '', email: '', avatar: '' }
      }
    },
    toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown
    },
    handleClickOutside(event) {
      // Close dropdown if clicking outside of it
      if (this.showProfileDropdown && !this.$el.querySelector('.profile-dropdown')?.contains(event.target)) {
        this.showProfileDropdown = false
      }
    },
    navigateToProfile(tab = 'overview') {
      this.showProfileDropdown = false
      // Use push to ensure navigation even if already on profile page
      this.$router.push({ 
        path: '/profile',
        query: { tab }
      })
    },
    async logout() {
      this.isLoggingOut = true
      let logoutError = null
      try {
        const response = await apiService.logout()
        if (!response?.success) {
          logoutError = response?.error || 'Unable to contact the server. Your session was cleared locally.'
        }
      } catch (error) {
        console.error('Logout failed:', error)
        logoutError = error?.message || 'Logout failed. Your session was cleared locally.'
      } finally {
        // Always clear local state regardless of API response
        this.isLoggedIn = false
        this.user = { name: '', email: '', avatar: '' }
        this.showProfileDropdown = false
        this.isLoggingOut = false
        
        // Emit logout event
        eventBus.emit('auth-logout')
        
        if (logoutError && this.$toast) {
          this.$toast.error(logoutError)
        }
      }
    },
    handleAuthSuccess(userData) {
      this.isLoggedIn = true
      // Normalize user data format
      const normalizedUser = userData || {}
      this.user = {
        name: normalizedUser.name || `${normalizedUser.first_name || ''} ${normalizedUser.last_name || ''}`.trim() || normalizedUser.display_name || '',
        first_name: normalizedUser.first_name,
        last_name: normalizedUser.last_name,
        display_name: normalizedUser.display_name,
        email: normalizedUser.email || '',
        avatar: normalizedUser.avatar || normalizedUser.picture || normalizedUser.photo_url || '',
        picture: normalizedUser.picture || normalizedUser.avatar,
        photo_url: normalizedUser.photo_url || normalizedUser.avatar
      }
    },
    handleProfileUpdate(updatedData) {
      if (updatedData.avatar) {
        this.user.avatar = updatedData.avatar
        this.user.picture = updatedData.avatar
        this.user.photo_url = updatedData.avatar
      }
      if (updatedData.username) {
        this.user.username = updatedData.username
      }
      // Force Vue reactivity update
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
.published-map-navbar {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

/* Logo Section */
.navbar-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: auto;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.brand-link:hover {
  opacity: 0.8;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
}

.brand-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

/* Center Navigation */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  flex: 1;
  justify-content: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-link {
  text-decoration: none;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: color var(--transition-fast);
  padding: var(--spacing-xs) 0;
}

.nav-link:hover {
  color: var(--secondary-color);
}

.nav-link.router-link-active {
  color: var(--secondary-color);
}

/* Right Side Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-shrink: 0;
  margin-left: auto;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.language-selector:hover {
  background: var(--bg-secondary);
}

.language-selector i {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* User Profile / Login */
.user-profile {
  position: relative;
}

.profile-dropdown {
  position: relative;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--border-light);
  transition: border-color var(--transition-fast);
}

.profile-picture:hover {
  border-color: var(--secondary-color);
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-light);
  margin: var(--spacing-xs) 0;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  text-decoration: none;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.logout-btn {
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--error-color);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.login-btn i {
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-md);
  }

  .navbar-nav {
    display: none;
  }

  .brand-text {
    display: none;
  }

  .language-selector span {
    display: none;
  }
}
</style>

