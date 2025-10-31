<template>
  <div class="profile-tabs">
    <div class="container">
      <nav class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="$emit('tab-change', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileTabs',
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.profile-tabs {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tabs-nav {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  white-space: nowrap;
  position: relative;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.tab-btn.active {
  color: var(--secondary-color);
  border-bottom-color: var(--secondary-color);
  font-weight: 600;
}

.tab-btn i {
  font-size: var(--font-size-lg);
}

.tab-count {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-left: var(--spacing-xs);
}

.tab-btn.active .tab-count {
  background: var(--secondary-color);
  color: white;
}

@media (max-width: 768px) {
  .tab-btn span:not(.tab-count) {
    display: none;
  }
  
  .tab-btn {
    padding: var(--spacing-md);
  }
}
</style>

