<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/" class="logo" style="max-width: 80px; width: 100%;">
          <img src="/logo-small.png" alt="my3pai.com Logo" class="logo-image"
            style="width: 100%; height: auto; object-fit: contain; display: block;" />
        </router-link>

        <!-- Navigation -->
        <nav class="nav">
          <a href="#" class="nav-link">Discover</a>
          <a href="#" class="nav-link">Map</a>
          <a href="#" class="nav-link">My Trips</a>
          <a href="#" class="nav-link">Create</a>
          <a href="#" class="nav-link">Saved</a>
          <a href="#" class="nav-link">My Itineraries</a>
          <router-link to="/studio" class="nav-link">Studio</router-link>
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
          <div v-if="isLoggedIn" class="profile-picture">
            <img :src="user.avatar || 'https://i.pravatar.cc/40?img=41'" :alt="user.name" />
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
          <a href="#" class="mobile-nav-link">Discover</a>
          <a href="#" class="mobile-nav-link">Map</a>
          <a href="#" class="mobile-nav-link">My Trips</a>
          <a href="#" class="mobile-nav-link">Create</a>
          <a href="#" class="mobile-nav-link">Saved</a>
          <a href="#" class="mobile-nav-link">My Itineraries</a>
          <router-link to="/studio" class="mobile-nav-link">Studio</router-link>
        </nav>
        <div class="mobile-user-actions">
          <div class="mobile-language">
            <i class="fas fa-globe"></i>
            <span>USD</span>
          </div>
          <div class="mobile-profile">
            <img src="https://i.pravatar.cc/40?img=41" alt="Profile" />
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
      isLoggedIn: false,
      user: {
        name: '',
        email: '',
        avatar: ''
      }
    }
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
