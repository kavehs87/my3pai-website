<template>
  <div class="filter-bar">
    <div class="filter-icon-wrapper">
      <i class="fas fa-filter filter-icon"></i>
    </div>
    <div class="filter-buttons">
      <button
        v-for="filter in filters"
        :key="filter.key"
        class="filter-btn"
        :class="{ active: activeFilters[filter.key] }"
        @click="toggleFilter(filter.key)"
      >
        <i :class="filter.icon"></i>
        <span>{{ filter.label }}</span>
        <i class="fas fa-chevron-down chevron"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterBar',
  data() {
    return {
      filters: [
        { key: 'region', label: 'Region', icon: 'fas fa-globe' },
        { key: 'activity', label: 'Activity', icon: 'fas fa-bullseye' },
        { key: 'duration', label: 'Duration', icon: 'fas fa-stopwatch' },
        { key: 'budget', label: 'Budget', icon: 'fas fa-dollar-sign' },
        { key: 'difficulty', label: 'Difficulty', icon: 'fas fa-chart-bar' }
      ],
      activeFilters: {}
    }
  },
  methods: {
    toggleFilter(filterKey) {
      this.activeFilters[filterKey] = !this.activeFilters[filterKey]
      this.$emit('filter-changed', {
        ...this.activeFilters
      })
    }
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.filter-icon-wrapper {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.filter-icon {
  font-size: var(--font-size-lg);
}

.filter-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.filter-btn.active {
  background: var(--secondary-light);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.filter-btn i:first-child {
  font-size: var(--font-size-sm);
}

.chevron {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    width: 100%;
  }
  
  .filter-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>

