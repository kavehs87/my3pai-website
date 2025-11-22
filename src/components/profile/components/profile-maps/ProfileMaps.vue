<template>
  <section class="profile-maps">
    <div class="container">
      <div class="section-header">
        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search maps..." 
              class="search-input"
            />
          </div>
          
          <div class="filter-actions">
            <select v-model="filterStatus" class="filter-select">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            
            <select v-model="sortBy" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="pois">Most POIs</option>
            </select>

            <button class="refresh-btn icon-only" @click="fetchMaps" :disabled="isBusy" title="Refresh maps">
              <i :class="['fas', isBusy ? 'fa-spinner fa-spin' : 'fa-rotate']"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="error && maps.length" class="inline-alert">
        <i class="fas fa-circle-exclamation"></i>
        <span>{{ error }}</span>
        <button class="btn-link" @click="fetchMaps">
          Retry
        </button>
      </div>

      <div v-if="error && !maps.length" class="state-card error">
        <div class="state-icon">
          <i class="fas fa-triangle-exclamation"></i>
        </div>
        <div class="state-copy">
          <h3>Unable to load maps</h3>
          <p>{{ error }}</p>
          <button class="btn-link" @click="fetchMaps">
            <i class="fas fa-redo"></i>
            Try again
          </button>
        </div>
      </div>

      <div v-else-if="isLoading" class="cards-grid">
        <div v-for="n in skeletonCount" :key="`skeleton-${n}`" class="map-card-skeleton">
          <div class="skeleton-media shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-line wide shimmer"></div>
            <div class="skeleton-line shimmer"></div>
            <div class="skeleton-meta shimmer"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!maps.length" class="state-card empty">
        <div class="state-icon">
          <i class="fas fa-route"></i>
        </div>
        <div class="state-copy">
          <h3>No maps yet</h3>
          <p>Create maps from the studio to keep your POIs organized.</p>
          <button class="btn-primary" @click="$emit('create-map')">
            <i class="fas fa-plus"></i>
            Create a map
          </button>
        </div>
      </div>

      <div v-else>
        <div class="cards-grid">
          <ProfileMapsCard
            v-for="map in paginatedMaps"
            :key="map.id"
            :map="map"
            :username="username"
            @edit="handleEdit"
            @publish="handlePublish"
            @unpublish="handleUnpublish"
            @delete="handleDelete"
          />
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1" 
            @click="currentPage--"
          >
            <i class="fas fa-chevron-left"></i>
            <span>Previous</span>
          </button>

          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>

          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages" 
            @click="currentPage++"
          >
            <span>Next</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import apiService from '../../../../services/api.js'
import ProfileMapsCard from './cards/ProfileMapsCard.vue'
import toast from '../../../../utils/toast.js'

export default {
  name: 'ProfileMaps',
  components: {
    ProfileMapsCard
  },
  props: {
    username: {
      type: String,
      default: null
    }
  },
  emits: ['create-map'],
  data() {
    return {
      maps: [],
      isLoading: true,
      isRefreshing: false,
      error: '',
      skeletonCount: 3,
      searchQuery: '',
      filterStatus: 'all',
      sortBy: 'newest',
      currentPage: 1,
      itemsPerPage: 9
    }
  },
  computed: {
    isBusy() {
      return this.isLoading || this.isRefreshing
    },
    filteredMaps() {
      let result = [...this.maps]
      
      // 1. Search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) || 
          (item.summary && item.summary.toLowerCase().includes(query))
        )
      }
      
      // 2. Filter by Status
      if (this.filterStatus !== 'all') {
        const isPub = this.filterStatus === 'published'
        result = result.filter(item => item.isPublished === isPub)
      }
      
      // 3. Sort
      result.sort((a, b) => {
        if (this.sortBy === 'newest') {
          return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
        }
        if (this.sortBy === 'oldest') {
          return new Date(a.lastUpdated || 0) - new Date(b.lastUpdated || 0)
        }
        if (this.sortBy === 'name') {
          return a.title.localeCompare(b.title)
        }
        if (this.sortBy === 'pois') {
          return b.poiCount - a.poiCount
        }
        return 0
      })
      
      return result
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredMaps.length / this.itemsPerPage) || 1)
    },
    paginatedMaps() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredMaps.slice(start, end)
    }
  },
  watch: {
    // Reset to page 1 when filters or search change
    filteredMaps() {
      this.currentPage = 1
    }
  },
  created() {
    this.fetchMaps()
  },
  methods: {
    async fetchMaps() {
      const isInitialLoad = this.maps.length === 0
      if (isInitialLoad) {
        this.isLoading = true
      } else {
        this.isRefreshing = true
      }
      this.error = ''
      try {
        const response = await apiService.getMaps({ per_page: 12 })
        if (!response.success) {
          throw new Error(response.error || 'Unable to load saved maps right now.')
        }
        const apiResponse = response.data || {}
        const rootData = apiResponse.data || apiResponse
        const list = rootData.maps || rootData.data || []
        this.maps = (Array.isArray(list) ? list : [])
          .map(this.normalizeMap)
          .filter(Boolean)
      } catch (error) {
        this.error = error.message || 'Unexpected error while loading maps.'
      } finally {
        if (isInitialLoad) {
          this.isLoading = false
        }
        this.isRefreshing = false
      }
    },
    normalizeMap(raw) {
      if (!raw) return null
      // Handle both 'pois' and 'pointsOfInterest' naming conventions
      const pois = Array.isArray(raw.pois) 
        ? raw.pois 
        : Array.isArray(raw.pointsOfInterest) 
          ? raw.pointsOfInterest 
          : []
      const firstPoi = pois.find(Boolean)
      const summarySource = raw.summary || raw.description || firstPoi?.basic?.summary
      const locationBits = [
        firstPoi?.basic?.landmark,
        firstPoi?.basic?.region,
        firstPoi?.basic?.country
      ].filter(Boolean)
      
      // Calculate indicators
      const hasAudio = pois.some(poi => {
        // Check multiple possible audio locations
        const audioUrl = poi?.media?.audio?.url || poi?.basic?.audioFile
        return Boolean(audioUrl)
      })
      
      const poisWithImages = pois.filter(poi => {
        const images = poi?.media?.images || []
        return Array.isArray(images) && images.length > 0
      }).length
      
      // Extract interesting tags from POIs
      const tags = new Set()
      pois.forEach(poi => {
        if (poi?.category?.placeType) {
          tags.add(poi.category.placeType)
        }
        if (poi?.difficulty?.level) {
          tags.add(poi.difficulty.level)
        }
        if (poi?.pricing?.budget) {
          tags.add(poi.pricing.budget)
        }
        if (poi?.regions?.primaryRegion) {
          tags.add(poi.regions.primaryRegion)
        }
      })
      
      return {
        id: raw.id,
        title: raw.title || 'Untitled map',
        slug: raw.slug || '',
        summary: summarySource || 'Add a short summary from the studio to describe this map.',
        locationLabel: locationBits.join(', '),
        isPublished: raw.isPublished ?? raw.is_published ?? false,
        thumbnail: raw.thumbnailUrl || raw.thumbnail_url || raw.thumbnail || '',
        poiCount: raw.poiCount ?? raw.poi_count ?? pois.length,
        lastUpdated: raw.updatedAt || raw.updated_at || raw.created_at || null,
        hasAudio,
        poisWithImages,
        tags: Array.from(tags).slice(0, 5) // Limit to 5 tags
      }
    },
    handleEdit(map) {
      // Navigate to map builder page with map ID
      this.$router.push({ 
        name: 'map-builder', 
        query: { id: map.id } 
      })
    },
    async handleDelete(map) {
      if (!confirm('Delete this map and all of its POIs? This action cannot be undone.')) {
        return
      }

      const previous = [...this.maps]
      // Optimistic removal
      this.maps = this.maps.filter(item => item.id !== map.id)

      try {
        const result = await apiService.deleteMap(map.id)
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete map')
        }
        toast.success('Map deleted successfully')
      } catch (error) {
        // Revert on failure
        this.maps = previous
        toast.error(error.message || 'Unable to delete map')
      }
    },
    async handlePublish(map) {
      await this.updatePublishStatus(map, true)
    },
    async handleUnpublish(map) {
      if (!confirm('Are you sure you want to unpublish this map? It will no longer be visible to others.')) {
        return
      }
      await this.updatePublishStatus(map, false)
    },
    async updatePublishStatus(map, isPublished) {
      const originalStatus = map.isPublished
      // Optimistic update
      map.isPublished = isPublished
      
      try {
        const result = await apiService.updateMap(map.id, {
          isPublished
        })
        
        if (result.success) {
          const statusText = isPublished ? 'published' : 'unpublished'
          toast.success(`Map ${statusText} successfully`)
        } else {
          throw new Error(result.error || 'Failed to update status')
        }
      } catch (error) {
        // Revert on failure
        map.isPublished = originalStatus
        toast.error(error.message || 'Unable to update map status')
      }
    }
  }
}
</script>

<style scoped>
.profile-maps {
  padding: var(--spacing-lg) 0 var(--spacing-3xl);
  background: var(--bg-secondary);
}

.section-header {
  margin-bottom: var(--spacing-xl);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  width: 100%;
  background: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-input-wrapper i {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) var(--spacing-2xl);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-normal);
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  background: var(--bg-primary);
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: var(--secondary-color);
}

.refresh-btn.icon-only {
  padding: var(--spacing-sm);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn {
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-weight: 600;
  min-width: 140px;
  justify-content: center;
  transition: all var(--transition-normal);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:not(:disabled):hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.inline-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  padding: var(--spacing-xs) var(--spacing-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.inline-alert i {
  color: var(--warning-color, #f97316);
}

.inline-alert .btn-link {
  margin-left: auto;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.state-card {
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.state-card.error {
  border-color: var(--error-color);
}

.state-card.empty {
  flex-direction: column;
  text-align: center;
}

.state-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  color: var(--secondary-color);
}

.state-card.error .state-icon {
  color: var(--error-color);
}

.state-copy h3 {
  margin: 0 0 var(--spacing-xs);
  color: var(--text-primary);
}

.state-copy p {
  margin: 0 0 var(--spacing-md);
  color: var(--text-secondary);
}

.btn-primary {
  border: none;
  background: var(--secondary-color);
  color: #fff;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: box-shadow var(--transition-normal);
}

.btn-primary:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.btn-link {
  border: none;
  background: none;
  color: var(--secondary-color);
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: 0;
}

.map-card-skeleton {
  border-radius: var(--radius-xl);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.skeleton-media {
  height: 140px;
  background: var(--bg-secondary);
}

.skeleton-body {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-line {
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  width: 70%;
}

.skeleton-line.wide {
  width: 90%;
  height: 16px;
}

.skeleton-meta {
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-light);
}

.page-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.page-info {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    justify-content: space-between;
  }
  
  .filter-select {
    flex: 1;
  }

  .refresh-btn {
    width: 100%;
  }
}
</style>
