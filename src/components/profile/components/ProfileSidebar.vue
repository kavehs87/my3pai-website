<template>
  <aside :class="['profile-sidebar', { collapsed: isCollapsed }]">
    <!-- User Mini Profile -->
    <div class="sidebar-user">
      <img 
        :src="user.avatar" 
        :alt="user.firstName" 
        class="sidebar-avatar"
        @error="handleAvatarError"
      />
      <div class="sidebar-user-info">
        <h3 class="sidebar-user-name">{{ user.firstName }} {{ user.lastName }}</h3>
        <p class="sidebar-user-email">{{ user.email }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <span class="nav-section-title">Dashboard</span>
        <button
          v-for="tab in mainTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="$emit('tab-change', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span class="nav-label">{{ tab.label }}</span>
          <span v-if="tab.count" class="nav-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="nav-section">
        <span class="nav-section-title">Creator Tools</span>
        <button
          v-for="tab in creatorTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="$emit('tab-change', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span class="nav-label">{{ tab.label }}</span>
          <span v-if="tab.count" class="nav-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="nav-section">
        <span class="nav-section-title">Account</span>
        <button
          v-for="tab in accountTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="$emit('tab-change', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </div>
    </nav>

    <!-- Collapse Toggle (Mobile) -->
    <button class="sidebar-toggle" @click="toggleCollapse">
      <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </button>
  </aside>
</template>

<script>
export default {
  name: 'ProfileSidebar',
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isCollapsed: false
    }
  },
  computed: {
    mainTabs() {
      return this.tabs.filter(t => ['overview', 'maps'].includes(t.id))
    },
    creatorTabs() {
      return this.tabs.filter(t => ['blog', 'podcast', 'masterclass', 'consultation', 'media-assets', 'creator'].includes(t.id))
    },
    accountTabs() {
      return this.tabs.filter(t => ['settings'].includes(t.id))
    }
  },
  mounted() {
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize)
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
      this.$emit('collapse-change', this.isCollapsed)
    },
    checkScreenSize() {
      // Auto-collapse on smaller screens
      if (window.innerWidth < 1024) {
        this.isCollapsed = true
      } else {
        this.isCollapsed = false
      }
    },
    handleAvatarError(event) {
      event.target.src = 'https://i.pravatar.cc/200?img=41'
    }
  }
}
</script>

<style scoped>
.profile-sidebar {
  width: 280px;
  min-width: 280px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow-y: auto;
  overflow-x: hidden;
}

.profile-sidebar.collapsed {
  width: 72px;
  min-width: 72px;
}

/* User Section */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(135deg, var(--primary-color) 0%, #004d6d 100%);
  color: white;
}

.sidebar-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.collapsed .sidebar-avatar {
  width: 40px;
  height: 40px;
}

.sidebar-user-info {
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.3s ease;
}

.collapsed .sidebar-user-info {
  opacity: 0;
  width: 0;
  display: none;
}

.sidebar-user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-email {
  font-size: var(--font-size-xs);
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--spacing-md);
}

.nav-section-title {
  display: block;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  transition: opacity 0.2s ease;
}

.collapsed .nav-section-title {
  opacity: 0;
  height: 0;
  padding: 0;
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
  position: relative;
}

.collapsed .nav-item {
  padding: var(--spacing-sm);
  justify-content: center;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(72, 196, 200, 0.1) 0%, transparent 100%);
  color: var(--secondary-color);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--secondary-color);
  border-radius: 0 3px 3px 0;
}

.nav-item i {
  width: 20px;
  font-size: var(--font-size-base);
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.2s ease, width 0.3s ease;
}

.collapsed .nav-label {
  opacity: 0;
  width: 0;
  display: none;
}

.nav-count {
  margin-left: auto;
  background: var(--secondary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.collapsed .nav-count {
  display: none;
}

/* Collapse Toggle */
.sidebar-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: none;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--border-light);
  color: var(--text-primary);
}

/* Tooltip for collapsed state */
.collapsed .nav-item {
  position: relative;
}

.collapsed .nav-item::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--text-primary);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
  margin-left: 8px;
}

.collapsed .nav-item:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-sidebar {
    width: 72px;
    min-width: 72px;
  }

  .sidebar-user-info {
    display: none;
  }

  .nav-section-title {
    opacity: 0;
    height: 0;
    padding: 0;
    overflow: hidden;
  }

  .nav-item {
    padding: var(--spacing-sm);
    justify-content: center;
  }

  .nav-label,
  .nav-count {
    display: none;
  }

  .sidebar-toggle {
    display: flex;
  }
}

@media (max-width: 768px) {
  .profile-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  }

  .profile-sidebar.collapsed {
    width: 0;
    min-width: 0;
    border-right: none;
    overflow: hidden;
  }

  .sidebar-toggle {
    display: flex;
    position: fixed;
    left: 0;
    bottom: var(--spacing-lg);
    width: 48px;
    height: 48px;
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    background: var(--secondary-color);
    color: white;
    border: none;
    box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 101;
  }

  .collapsed .sidebar-toggle {
    left: 0;
  }

  .profile-sidebar:not(.collapsed) ~ .sidebar-toggle {
    left: 72px;
  }
}

/* Scrollbar styling */
.profile-sidebar::-webkit-scrollbar {
  width: 4px;
}

.profile-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.profile-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

.profile-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--border-medium);
}
</style>

