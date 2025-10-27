<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo" style="max-width: 80px; width: 100%;">
          <img src="/logo-small.png" alt="my3pai.com Logo" class="logo-image"
            style="width: 100%; height: auto; object-fit: contain; display: block;" />
        </div>

        <!-- Navigation -->
        <nav class="nav">
          <a href="#" class="nav-link">Discover</a>
          <a href="#" class="nav-link">Map</a>
          <a href="#" class="nav-link">My Trips</a>
          <a href="#" class="nav-link">Create</a>
          <a href="#" class="nav-link">Saved</a>
          <a href="#" class="nav-link">My Itineraries</a>
        </nav>

        <!-- Language/Currency Selector -->
        <div class="language-currency">
          <div class="language-selector">
            <i class="fas fa-globe"></i>
            <span>USD</span>
          </div>
          <div class="separator"></div>
        </div>

        <!-- User Profile -->
        <div class="user-profile">
          <div class="profile-picture">
            <img src="https://i.pravatar.cc/40?img=1" alt="Profile" />
          </div>
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
        </nav>
        <div class="mobile-user-actions">
          <div class="mobile-language">
            <i class="fas fa-globe"></i>
            <span>USD</span>
          </div>
          <div class="mobile-profile">
            <img src="https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=40&h=40&fit=crop" alt="Profile" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
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
    display: block;
  }

  .mobile-menu.active {
    display: block;
  }
}
</style>
