<template>
  <div class="map-pois">
    <div class="pois-container">
      <!-- Header Section -->
      <MapPOIsHeader
        :user-name="userName"
        :pois-count="pois.length"
        :view-mode="viewMode"
        @view-mode-changed="handleViewModeChange"
        @sort-changed="handleSortChange"
      />
      
      <!-- Search Bar -->
      <SearchBar
        :search-query="searchQuery"
        @search-changed="handleSearchChange"
        @search-submitted="handleSearchSubmit"
      />
      
      <!-- Filter Bar -->
      <FilterBar
        @filter-changed="handleFilterChange"
      />
      
      <!-- Map Container -->
      <MapContainer
        :pois-count="pois.length"
        :is-expanded="isMapExpanded"
        :pois="pois"
        @toggle-map="toggleMap"
      />
      
      <!-- POIs Content Area -->
      <div class="pois-content">
        <div v-if="loading" class="loading-state">
          <p>Loading locations...</p>
        </div>
        <POICardsList
          v-else
          :pois="filteredPOIs"
          :maps-count="mapsCount"
          @view-details="handleViewDetails"
          @show-on-map="handleShowOnMap"
          @add-to-map="handleAddToMap"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
    </div>
  </div>
</template>

<script>
import MapPOIsHeader from './MapPOIsHeader.vue'
import SearchBar from './SearchBar.vue'
import FilterBar from './FilterBar.vue'
import MapContainer from './MapContainer.vue'
import POICardsList from './POICardsList.vue'

export default {
  name: 'MapPOIs',
  components: {
    MapPOIsHeader,
    SearchBar,
    FilterBar,
    MapContainer,
    POICardsList
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    map: {
      type: Object,
      default: null
    },
    pois: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      viewMode: 'map',
      searchQuery: '',
      filters: {},
      isMapExpanded: true
    }
  },
  computed: {
    userName() {
      if (this.user) {
        return this.user.firstName || this.user.username || 'User'
      }
      return 'User'
    },
    mapsCount() {
      return this.user?.publishedMapsCount || 1
    },
    filteredPOIs() {
      // TODO: Apply search and filter logic
      let result = [...this.pois]
      
      // Apply search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(poi => {
          const name = poi.basic?.name?.toLowerCase() || ''
          const tagline = poi.basic?.tagline?.toLowerCase() || ''
          const summary = poi.basic?.summary?.toLowerCase() || ''
          return name.includes(query) || tagline.includes(query) || summary.includes(query)
        })
      }
      
      // TODO: Apply other filters (region, activity, duration, budget, difficulty)
      
      return result
    }
  },
  methods: {
    handleViewModeChange(mode) {
      this.viewMode = mode
    },
    handleSortChange(sortOption) {
      console.log('Sort changed:', sortOption)
      // TODO: Implement sorting logic
    },
    handleSearchChange(query) {
      this.searchQuery = query
      // TODO: Implement search filtering
    },
    handleSearchSubmit() {
      console.log('Search submitted:', this.searchQuery)
      // TODO: Implement search logic
    },
    handleFilterChange(filters) {
      this.filters = filters
      console.log('Filters changed:', filters)
      // TODO: Implement filter logic
    },
    toggleMap() {
      this.isMapExpanded = !this.isMapExpanded
    },
    handleViewDetails(poi) {
      console.log('View details for POI:', poi)
      // TODO: Navigate to POI detail page or open modal
    },
    handleShowOnMap(poi) {
      console.log('Show POI on map:', poi)
      // TODO: Center map on POI and highlight it
      this.$emit('show-poi-on-map', poi)
    },
    handleAddToMap(poi) {
      console.log('Add POI to map:', poi)
      // TODO: Implement add to map functionality
    },
    handleToggleFavorite(poi, isFavorite) {
      console.log('Toggle favorite for POI:', poi, isFavorite)
      // TODO: Implement favorite functionality
    }
  }
}
</script>

<style scoped>
.map-pois {
  padding: var(--spacing-xl);
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}

.pois-container {
  max-width: 1400px;
  margin: 0 auto;
}

.pois-content {
  margin-top: var(--spacing-xl);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .map-pois {
    padding: var(--spacing-md);
  }
  
  .pois-grid {
    grid-template-columns: 1fr;
  }
}
</style>

