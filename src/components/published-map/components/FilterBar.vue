<template>
  <div class="filter-bar">
    <div class="filter-icon-wrapper">
      <i class="fas fa-filter filter-icon"></i>
    </div>
    <div class="filter-buttons">
      <!-- Place Type Filter -->
      <div class="filter-dropdown" ref="placeTypeDropdown">
        <button
          class="filter-btn"
          :class="{ active: hasActiveFilter('place_type') }"
          @click="toggleDropdown('place_type')"
        >
          <i class="fas fa-globe"></i>
          <span>{{ getPlaceTypeLabel() || 'Place Type' }}</span>
          <i class="fas fa-chevron-down chevron" :class="{ rotated: openDropdown === 'place_type' }"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'place_type'" class="dropdown-menu">
            <div class="dropdown-header">
              <span>Select Place Type</span>
              <button v-if="filters.place_type" class="clear-btn" @click="clearFilter('place_type')">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
            <div class="dropdown-options">
              <label
                v-for="option in placeTypeOptions"
                :key="option.value"
                class="dropdown-option"
              >
                <input
                  type="radio"
                  :value="option.value"
                  :checked="filters.place_type === option.value"
                  @change="setFilter('place_type', option.value)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Difficulty Filter -->
      <div class="filter-dropdown" ref="difficultyDropdown">
        <button
          class="filter-btn"
          :class="{ active: hasActiveFilter('difficulty') }"
          @click="toggleDropdown('difficulty')"
        >
          <i class="fas fa-chart-bar"></i>
          <span>{{ getDifficultyLabel() || 'Difficulty' }}</span>
          <i class="fas fa-chevron-down chevron" :class="{ rotated: openDropdown === 'difficulty' }"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'difficulty'" class="dropdown-menu">
            <div class="dropdown-header">
              <span>Select Difficulty</span>
              <button v-if="filters.difficulty" class="clear-btn" @click="clearFilter('difficulty')">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
            <div class="dropdown-options">
              <label
                v-for="option in difficultyOptions"
                :key="option.value"
                class="dropdown-option"
              >
                <input
                  type="radio"
                  :value="option.value"
                  :checked="filters.difficulty === option.value"
                  @change="setFilter('difficulty', option.value)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Budget Filter -->
      <div class="filter-dropdown" ref="budgetDropdown">
        <button
          class="filter-btn"
          :class="{ active: hasActiveFilter('cost_type') }"
          @click="toggleDropdown('budget')"
        >
          <i class="fas fa-dollar-sign"></i>
          <span>{{ getBudgetLabel() || 'Budget' }}</span>
          <i class="fas fa-chevron-down chevron" :class="{ rotated: openDropdown === 'budget' }"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'budget'" class="dropdown-menu">
            <div class="dropdown-header">
              <span>Select Budget</span>
              <button v-if="filters.cost_type" class="clear-btn" @click="clearFilter('cost_type')">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
            <div class="dropdown-options">
              <label
                v-for="option in budgetOptions"
                :key="option.value"
                class="dropdown-option"
              >
                <input
                  type="radio"
                  :value="option.value"
                  :checked="filters.cost_type === option.value"
                  @change="setFilter('cost_type', option.value)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Activity Filter -->
      <div class="filter-dropdown" ref="activityDropdown">
        <button
          class="filter-btn"
          :class="{ active: hasActiveFilter('activities') }"
          @click="toggleDropdown('activity')"
        >
          <i class="fas fa-bullseye"></i>
          <span>{{ getActivityLabel() || 'Activity' }}</span>
          <i class="fas fa-chevron-down chevron" :class="{ rotated: openDropdown === 'activity' }"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'activity'" class="dropdown-menu dropdown-menu-wide">
            <div class="dropdown-header">
              <span>Select Activities</span>
              <button v-if="filters.activities?.length > 0" class="clear-btn" @click="clearFilter('activities')">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
            <div class="dropdown-search">
              <input
                v-model="activitySearch"
                type="text"
                placeholder="Search activities..."
                class="search-input"
              />
            </div>
            <div class="dropdown-options dropdown-options-multiselect">
              <label
                v-for="option in filteredActivityOptions"
                :key="option.value"
                class="dropdown-option"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  :checked="isActivitySelected(option.value)"
                  @change="toggleActivity(option.value)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Country/Region Filter -->
      <div class="filter-dropdown" ref="countryDropdown">
        <button
          class="filter-btn"
          :class="{ active: hasActiveFilter('country') }"
          @click="toggleDropdown('country')"
        >
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ getCountryLabel() || 'Country' }}</span>
          <i class="fas fa-chevron-down chevron" :class="{ rotated: openDropdown === 'country' }"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'country'" class="dropdown-menu dropdown-menu-wide">
            <div class="dropdown-header">
              <span>Select Country</span>
              <button v-if="filters.country" class="clear-btn" @click="clearFilter('country')">
                <i class="fas fa-times"></i> Clear
              </button>
            </div>
            <div class="dropdown-search">
              <input
                v-model="countrySearch"
                type="text"
                placeholder="Search countries..."
                class="search-input"
              />
            </div>
            <div class="dropdown-options">
              <label
                v-for="option in filteredCountryOptions"
                :key="option.value"
                class="dropdown-option"
              >
                <input
                  type="radio"
                  :value="option.value"
                  :checked="filters.country === option.value"
                  @change="setFilter('country', option.value)"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Clear All Filters -->
      <button
        v-if="hasAnyFilters"
        class="filter-btn filter-btn-clear"
        @click="clearAllFilters"
      >
        <i class="fas fa-times-circle"></i>
        <span>Clear All</span>
      </button>
    </div>
  </div>
</template>

<script>
import apiService from '../../../services/api.js'

export default {
  name: 'FilterBar',
  data() {
    return {
      loading: false,
      openDropdown: null,
      filters: {
        place_type: null,
        difficulty: null,
        cost_type: null,
        activities: [],
        country: null
      },
      activitySearch: '',
      countrySearch: '',
      // Options will be populated from API
      placeTypeOptions: [],
      difficultyOptions: [],
      budgetOptions: [],
      activityOptions: [],
      countryOptions: []
    }
  },
  computed: {
    hasAnyFilters() {
      return !!(
        this.filters.place_type ||
        this.filters.difficulty ||
        this.filters.cost_type ||
        (this.filters.activities && this.filters.activities.length > 0) ||
        this.filters.country
      )
    },
    filteredActivityOptions() {
      if (!this.activitySearch.trim()) {
        return this.activityOptions
      }
      const search = this.activitySearch.toLowerCase()
      return this.activityOptions.filter(opt =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search)
      )
    },
    filteredCountryOptions() {
      if (!this.countrySearch.trim()) {
        return this.countryOptions
      }
      const search = this.countrySearch.toLowerCase()
      return this.countryOptions.filter(opt =>
        opt.label.toLowerCase().includes(search) ||
        opt.value.toLowerCase().includes(search)
      )
    }
  },
  async mounted() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.handleClickOutside)
    // Fetch filter metadata from API
    await this.fetchFilterMetadata()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async fetchFilterMetadata() {
      this.loading = true
      try {
        const response = await apiService.getPoiFilterMetadata()
        
        if (!response.success) {
          console.warn('[FilterBar] Failed to fetch filter metadata:', response.error)
          return
        }
        
        // Handle both response.data.data and response.data formats
        const data = response.data?.data || response.data
        
        if (data) {
          
          // Transform place types
          if (data.placeTypes && Array.isArray(data.placeTypes)) {
            this.placeTypeOptions = data.placeTypes.map(item => ({
              value: item.value,
              label: item.label
            }))
          }
          
          // Transform difficulty levels
          if (data.difficultyLevels && Array.isArray(data.difficultyLevels)) {
            this.difficultyOptions = data.difficultyLevels.map(item => ({
              value: item.value,
              label: item.label
            }))
          }
          
          // Transform cost types
          if (data.costTypes && Array.isArray(data.costTypes)) {
            this.budgetOptions = data.costTypes.map(item => ({
              value: item.value,
              label: item.label
            }))
          }
          
          // Transform activities
          if (data.activities && Array.isArray(data.activities)) {
            this.activityOptions = data.activities.map(item => ({
              value: item.key,
              label: item.label
            }))
          }
          
          // Transform countries
          if (data.countries && Array.isArray(data.countries)) {
            this.countryOptions = data.countries.map(item => ({
              value: item.code,
              label: item.name
            }))
          }
        } else {
          console.warn('[FilterBar] Invalid response format from filter metadata endpoint')
          // Fallback to empty arrays - filters will be disabled
        }
      } catch (error) {
        console.error('[FilterBar] Error fetching filter metadata:', error)
        // On error, filters will be empty but component won't crash
      } finally {
        this.loading = false
      }
    },
    toggleDropdown(filterKey) {
      if (this.openDropdown === filterKey) {
        this.openDropdown = null
      } else {
        this.openDropdown = filterKey
        // Clear search when opening different dropdown
        if (filterKey !== 'activity') this.activitySearch = ''
        if (filterKey !== 'country') this.countrySearch = ''
      }
    },
    handleClickOutside(event) {
      const dropdowns = [
        this.$refs.placeTypeDropdown,
        this.$refs.difficultyDropdown,
        this.$refs.budgetDropdown,
        this.$refs.activityDropdown,
        this.$refs.countryDropdown
      ]
      
      const isClickInside = dropdowns.some(ref => {
        if (!ref) return false
        return ref.contains(event.target)
      })
      
      if (!isClickInside) {
        this.openDropdown = null
      }
    },
    hasActiveFilter(key) {
      if (key === 'activities') {
        return this.filters.activities && this.filters.activities.length > 0
      }
      return !!this.filters[key]
    },
    setFilter(key, value) {
      if (key === 'place_type') {
        this.filters.place_type = this.filters.place_type === value ? null : value
      } else if (key === 'difficulty') {
        this.filters.difficulty = this.filters.difficulty === value ? null : value
      } else if (key === 'cost_type') {
        this.filters.cost_type = this.filters.cost_type === value ? null : value
      } else if (key === 'country') {
        this.filters.country = this.filters.country === value ? null : value
      }
      
      this.openDropdown = null
      this.emitFilters()
    },
    toggleActivity(activityValue) {
      if (!this.filters.activities) {
        this.filters.activities = []
      }
      
      const index = this.filters.activities.indexOf(activityValue)
      if (index > -1) {
        this.filters.activities.splice(index, 1)
      } else {
        this.filters.activities.push(activityValue)
      }
      
      this.emitFilters()
    },
    isActivitySelected(activityValue) {
      return this.filters.activities && this.filters.activities.includes(activityValue)
    },
    clearFilter(key) {
      if (key === 'activities') {
        this.filters.activities = []
      } else {
        this.filters[key] = null
      }
      this.emitFilters()
    },
    clearAllFilters() {
      this.filters = {
        place_type: null,
        difficulty: null,
        cost_type: null,
        activities: [],
        country: null
      }
      this.openDropdown = null
      this.activitySearch = ''
      this.countrySearch = ''
      this.emitFilters()
    },
    getPlaceTypeLabel() {
      if (!this.filters.place_type) return null
      const option = this.placeTypeOptions.find(opt => opt.value === this.filters.place_type)
      return option ? option.label : null
    },
    getDifficultyLabel() {
      if (!this.filters.difficulty) return null
      const option = this.difficultyOptions.find(opt => opt.value === this.filters.difficulty)
      return option ? option.label : null
    },
    getBudgetLabel() {
      if (!this.filters.cost_type) return null
      const option = this.budgetOptions.find(opt => opt.value === this.filters.cost_type)
      return option ? option.label : null
    },
    getActivityLabel() {
      if (!this.filters.activities || this.filters.activities.length === 0) return null
      if (this.filters.activities.length === 1) {
        const option = this.activityOptions.find(opt => opt.value === this.filters.activities[0])
        return option ? option.label : null
      }
      return `${this.filters.activities.length} activities`
    },
    getCountryLabel() {
      if (!this.filters.country) return null
      const option = this.countryOptions.find(opt => opt.value === this.filters.country)
      return option ? option.label : null
    },
    emitFilters() {
      // Emit filters in API-compatible format
      const apiFilters = {}
      
      if (this.filters.place_type) {
        apiFilters.place_type = this.filters.place_type
      }
      if (this.filters.difficulty) {
        apiFilters.difficulty = this.filters.difficulty
      }
      if (this.filters.cost_type) {
        apiFilters.cost_type = this.filters.cost_type
      }
      if (this.filters.activities && this.filters.activities.length > 0) {
        apiFilters.activities = [...this.filters.activities]
      }
      if (this.filters.country) {
        apiFilters.country = this.filters.country
      }
      
      this.$emit('filter-changed', apiFilters)
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
  position: relative;
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
  position: relative;
}

.filter-dropdown {
  position: relative;
}

.filter-btn {
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

.filter-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.filter-btn.active {
  background: rgba(0, 52, 78, 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn i:first-child {
  font-size: var(--font-size-sm);
}

.chevron {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  transition: transform var(--transition-fast);
}

.chevron.rotated {
  transform: rotate(180deg);
}

.filter-btn-clear {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.filter-btn-clear:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--spacing-xs));
  left: 0;
  min-width: 200px;
  max-width: 300px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.dropdown-menu-wide {
  min-width: 280px;
  max-width: 350px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-search {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.search-input {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 52, 78, 0.1);
}

.dropdown-options {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--spacing-xs);
}

.dropdown-options-multiselect {
  max-height: 250px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.dropdown-option:hover {
  background: var(--bg-secondary);
}

.dropdown-option input[type="radio"],
.dropdown-option input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--primary-color);
}

.dropdown-option span {
  flex: 1;
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
  opacity: 1;
  transform: translateY(0);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scrollbar Styling */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: var(--radius-full);
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    width: 100%;
  }
  
  .filter-dropdown {
    flex: 1;
    min-width: 0;
  }
  
  .filter-btn {
    width: 100%;
    justify-content: space-between;
  }
  
  .dropdown-menu {
    position: fixed;
    left: var(--spacing-md) !important;
    right: var(--spacing-md);
    max-width: calc(100vw - 2 * var(--spacing-md));
  }
}
</style>
