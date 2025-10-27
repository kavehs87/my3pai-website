<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo" style="max-width: 160px; width: 100%;">
          <img src="/logo.svg" alt="my3pai.com Logo" class="logo-image"
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
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  font-family: 'Inter', sans-serif;
}

.nav {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: #000000;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.3s ease;
  padding: 8px 0;
}

.nav-link:hover {
  color: #333333;
}

.language-currency {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #000000;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.language-selector:hover {
  background-color: #f8f9fa;
}

.language-selector i {
  font-size: 14px;
}

.separator {
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
}

.user-profile {
  display: flex;
  align-items: center;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
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
  font-size: 20px;
  color: #000000;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 0;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.mobile-nav-link {
  text-decoration: none;
  color: #000000;
  font-weight: 500;
  padding: 8px 0;
  font-size: 16px;
}

.mobile-user-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-language {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #000000;
  font-weight: 500;
}

.mobile-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.mobile-profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1024px) {
  .nav {
    gap: 24px;
  }

  .header-content {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .header-content {
    gap: 16px;
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
