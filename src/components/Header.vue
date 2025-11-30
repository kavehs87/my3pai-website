<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/" class="logo" style="max-width: 80px; width: 100%;">
          <img src="/logo-small.png" alt="my3p.ai Logo" class="logo-image"
            style="width: 100%; height: auto; object-fit: contain; display: block;" />
        </router-link>

        <!-- Navigation -->
        <nav class="nav">
          <router-link to="/map-builder" class="nav-link">POIs</router-link>
          <a href="#" class="nav-link">Map</a>
          <a href="#" class="nav-link">Consult</a>
          <a href="#" class="nav-link">Media</a>
          <a href="#" class="nav-link">Plan</a>
          <router-link v-if="!showPresentationLinks" to="/studio" class="nav-link">Studio</router-link>
          <!-- Presentation links for specific users -->
          <template v-if="showPresentationLinks">
            <a href="https://mocks.my3p.ai/studio/" target="_blank" rel="noopener noreferrer" class="nav-link">Studio</a>
            <a href="https://mocks.my3p.ai/analytics/" target="_blank" rel="noopener noreferrer" class="nav-link">Analytics</a>
            <a href="https://mocks.my3p.ai/travel/" target="_blank" rel="noopener noreferrer" class="nav-link">Travel</a>
          </template>
        </nav>

        <!-- Language/Currency Selector -->
        <div class="language-currency">
          <div class="language-selector">
            <i class="fas fa-globe"></i>
            <span>USD</span>
          </div>
          <div class="separator"></div>
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

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
        <nav class="mobile-nav">
          <router-link to="/map-builder" class="mobile-nav-link" @click="toggleMobileMenu">POIs</router-link>
          <a href="#" class="mobile-nav-link">Map</a>
          <a href="#" class="mobile-nav-link">Consult</a>
          <a href="#" class="mobile-nav-link">Media</a>
          <a href="#" class="mobile-nav-link">Plan</a>
          <router-link v-if="!showPresentationLinks" to="/studio" class="mobile-nav-link" @click="toggleMobileMenu">Studio</router-link>
          <!-- Presentation links for specific users -->
          <template v-if="showPresentationLinks">
            <a href="https://mocks.my3p.ai/studio/" target="_blank" rel="noopener noreferrer" class="mobile-nav-link" @click="toggleMobileMenu">Studio</a>
            <a href="https://mocks.my3p.ai/analytics/" target="_blank" rel="noopener noreferrer" class="mobile-nav-link" @click="toggleMobileMenu">Analytics</a>
            <a href="https://mocks.my3p.ai/travel/" target="_blank" rel="noopener noreferrer" class="mobile-nav-link" @click="toggleMobileMenu">Travel</a>
          </template>
        </nav>
        <div class="mobile-user-actions">
          <div class="mobile-language">
            <i class="fas fa-globe"></i>
            <span>USD</span>
          </div>
          <div class="mobile-profile">
            <img :src="user.avatar || user.picture || user.photo_url || 'https://i.pravatar.cc/40?img=41'" :alt="user.name || user.display_name || 'Profile'" />
          </div>
        </div>
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
  </header>
</template>

<script>
import LoginModal from './LoginModal.vue'
import SignupModal from './SignupModal.vue'
import apiService from '../services/api.js'
import eventBus from '../utils/eventBus.js'

export default {
  name: 'Header',
  components: {
    LoginModal,
    SignupModal
  },
  data() {
    return {
      mobileMenuOpen: false,
      showLogin: false,
      showSignup: false,
      showProfileDropdown: false,
      isLoggedIn: false,
      isLoggingOut: false,
      user: {
        name: '',
        email: '',
        avatar: '',
        username: ''
      }
    }
  },
  computed: {
    showPresentationLinks() {
      // Show presentation links only for specific registered users
      const allowedUsernames = ['kavehs86', 'nikookar7', 'frzdmhb']
      // Try multiple ways to get username
      const username = this.user?.username || 
                      this.user?.user_name || 
                      this.user?.userName ||
                      (this.user?.email ? this.user.email.split('@')[0] : '') ||
                      ''
      // Remove @ prefix if present
      const cleanUsername = username.replace(/^@/, '')
      const shouldShow = this.isLoggedIn && cleanUsername && allowedUsernames.includes(cleanUsername)
      // Debug log (only log once per user load to avoid spam)
      if (this.isLoggedIn && !this._debugLogged) {
        console.log('[Header] showPresentationLinks check:', {
          isLoggedIn: this.isLoggedIn,
          username: cleanUsername,
          rawUsername: username,
          userObject: this.user,
          allowedUsernames,
          shouldShow
        })
        this._debugLogged = true
      }
      return shouldShow
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
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
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
      // TODO: Store user data in localStorage or Vuex
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
      // TODO: Store user data in localStorage or Vuex
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
            photo_url: userData.photo_url || userData.avatar,
            username: userData.username || userData.user_name || userData.userName || ''
          }
          // Debug: Log user data to check username
          console.log('[Header] User data loaded:', {
            username: this.user.username,
            isLoggedIn: this.isLoggedIn,
            showPresentationLinks: this.showPresentationLinks,
            rawUserData: userData
          })
        } else {
          this.isLoggedIn = false
          this.user = { name: '', email: '', avatar: '', username: '' }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        this.isLoggedIn = false
        this.user = { name: '', email: '', avatar: '', username: '' }
      }
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
        if (logoutError && this.$toast) {
          this.$toast.error(logoutError)
        } else if (this.$toast) {
          this.$toast.success('You have been logged out.')
        }
        this.resetAuthState()
        this.isLoggingOut = false
      }
    },
    resetAuthState() {
      this.isLoggedIn = false
      this.user = { name: '', email: '', avatar: '', username: '' }
      this.showProfileDropdown = false
      this.showSignup = false
      this.showLogin = true
      this.$router.push('/')
    },
    toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown
    },
    handleAuthSuccess(userData) {
      this.isLoggedIn = true
      // Ensure username is extracted properly
      if (userData && typeof userData === 'object') {
        this.user = {
          ...userData,
          username: userData.username || userData.user_name || userData.userName || this.user.username || ''
        }
      } else {
        this.user = userData
      }
      this.showProfileDropdown = false
      // Debug: Log user data
      console.log('[Header] Auth success - user data:', {
        username: this.user.username,
        showPresentationLinks: this.showPresentationLinks
      })
    },
    handleProfileUpdate(updatedUser) {
      // Update user data when profile is updated (e.g., avatar change)
      if (updatedUser && this.isLoggedIn) {
        // Update specific fields
        if (updatedUser.avatar) {
          this.user.avatar = updatedUser.avatar
          this.user.picture = updatedUser.avatar
          this.user.photo_url = updatedUser.avatar
        }
        if (updatedUser.firstName) {
          this.user.first_name = updatedUser.firstName
          this.user.name = `${updatedUser.firstName} ${this.user.last_name || updatedUser.lastName || ''}`.trim()
        }
        if (updatedUser.lastName) {
          this.user.last_name = updatedUser.lastName
          this.user.name = `${this.user.first_name || updatedUser.firstName || ''} ${updatedUser.lastName}`.trim()
        }
        if (updatedUser.username) {
          this.user.username = updatedUser.username
        }
        // Force Vue reactivity update
        this.$forceUpdate()
      }
    },
    handleClickOutside(event) {
      // Close dropdown if clicking outside of it
      if (this.showProfileDropdown && !this.$el.querySelector('.profile-dropdown').contains(event.target)) {
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
    }
  }
}
</script>

<style scoped>
.header {
  background: var(--bg-primary);
  box-shadow: 0 2px 4px var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  gap: var(--spacing-2xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: inherit;
  transition: opacity var(--transition-normal);
}

.logo:hover {
  opacity: 0.8;
}

.logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-family);
}

.nav {
  display: flex;
  gap: var(--spacing-xl);
  flex: 1;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
  transition: color var(--transition-normal);
  padding: var(--spacing-sm) 0;
}

.nav-link:hover {
  color: var(--text-secondary);
}

.language-currency {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.language-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-normal);
}

.language-selector:hover {
  background-color: var(--bg-secondary);
}

.language-selector i {
  font-size: var(--font-size-sm);
}

.separator {
  width: 1px;
  height: 20px;
  background-color: var(--border-light);
}

.user-profile {
  display: flex;
  align-items: center;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.profile-picture:hover {
  transform: scale(1.05);
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-normal);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.login-btn:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.login-btn i {
  font-size: var(--font-size-sm);
}

/* Profile Dropdown Styles */
.profile-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10000;
  margin-top: var(--spacing-sm);
}

.dropdown-header {
  padding: var(--spacing-md);
  /* border-bottom: 1px solid var(--border-light); */
}

.user-info {
  text-align: center;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.user-email {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-light);
  margin: var(--spacing-xs) 0;
}

.dropdown-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition-normal);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.logout-btn {
  color: var(--error-color, #ef4444) !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 6px;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
}

.mobile-menu {
  display: none;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg) 0;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.mobile-nav-link {
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-base);
}

.mobile-user-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-language {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  font-weight: 500;
}

.mobile-profile {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mobile-profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1024px) {
  .nav {
    gap: var(--spacing-lg);
  }

  .header-content {
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .header-content {
    gap: var(--spacing-md);
  }

  .nav {
    display: none;
  }

  .language-currency {
    display: none;
  }

  .user-profile {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: none;
  }

  .mobile-menu.active {
    display: block;
  }
}
</style>
