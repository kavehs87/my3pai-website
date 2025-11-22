<template>
  <div class="itinerary-pois-header">
    <div class="header-left">
      <h1 class="header-title">All locations by {{ userName }}</h1>
      <h2 class="header-subtitle">{{ poisCount }} Points of Interest</h2>
      <p class="header-description">
        Every location includes photos, realistic duration, cost hints and packing tips
      </p>
    </div>
    
    <div class="header-right">
      <div class="view-controls">
        <button 
          class="view-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="setViewMode('grid')"
        >
          <i class="fas fa-th"></i>
          <span>Grid</span>
        </button>
        <button 
          class="view-btn"
          :class="{ active: viewMode === 'map' }"
          @click="setViewMode('map')"
        >
          <i class="fas fa-map"></i>
          <span>Map</span>
        </button>
      </div>
      
      <div class="sort-dropdown">
        <button class="sort-btn" @click="toggleSortDropdown">
          <span>{{ selectedSort }}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div v-if="showSortDropdown" class="sort-dropdown-menu">
          <button 
            v-for="option in sortOptions" 
            :key="option"
            class="sort-option"
            :class="{ active: selectedSort === option }"
            @click="selectSort(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItineraryPOIsHeader',
  props: {
    userName: {
      type: String,
      required: true
    },
    poisCount: {
      type: Number,
      default: 0
    },
    viewMode: {
      type: String,
      default: 'grid',
      validator: (value) => ['grid', 'map'].includes(value)
    }
  },
  data() {
    return {
      showSortDropdown: false,
      selectedSort: 'Most popular',
      sortOptions: ['Most popular', 'Newest', 'Oldest', 'A-Z', 'Z-A']
    }
  },
  methods: {
    setViewMode(mode) {
      this.$emit('view-mode-changed', mode)
    },
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown
    },
    selectSort(option) {
      this.selectedSort = option
      this.showSortDropdown = false
      this.$emit('sort-changed', option)
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showSortDropdown = false
      }
    }
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.itinerary-pois-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-xl);
}

.header-left {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.2;
}

.header-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.view-controls {
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px var(--shadow-light);
}

.view-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: none;
  border-right: 1px solid var(--border-light);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: var(--bg-secondary);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
}

.view-btn.active:hover {
  background: var(--primary-hover);
}

.view-btn i {
  font-size: var(--font-size-sm);
}

.sort-dropdown {
  position: relative;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.sort-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.sort-btn i {
  font-size: var(--font-size-xs);
  transition: transform var(--transition-fast);
}

.sort-dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px var(--shadow-medium);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.sort-option {
  display: block;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.sort-option:hover {
  background: var(--bg-secondary);
}

.sort-option.active {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .itinerary-pois-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-title {
    font-size: var(--font-size-2xl);
  }
  
  .header-subtitle {
    font-size: var(--font-size-lg);
  }
}
</style>

