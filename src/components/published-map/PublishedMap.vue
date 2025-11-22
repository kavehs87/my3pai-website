<template>
  <div class="published-map-page">
    <!-- Custom Navbar for Published Map -->
    <PublishedMapNavbar />

    <!-- Split Layout Container -->
    <div class="split-layout-container">
      <!-- Left Side: User Profile Brief (Thin) -->
      <div class="panel-side">
        <UserProfileBrief 
          :user="user"
          :map="map"
          :pois="pois"
        />
      </div>

      <!-- Right Side: Map POIs -->
      <div class="content-side">
        <MapPOIs 
          :user="user"
          :map="map"
          :pois="pois"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PublishedMapNavbar from './components/PublishedMapNavbar.vue'
import UserProfileBrief from './components/UserProfileBrief.vue'
import MapPOIs from './components/MapPOIs.vue'
import apiService from '../../services/api.js'

export default {
  name: 'PublishedMap',
  components: {
    PublishedMapNavbar,
    UserProfileBrief,
    MapPOIs
  },
  data() {
    return {
      // Will be populated with map data
      map: null,
      user: null,
      pois: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchMapData()
  },
  watch: {
    '$route.params': {
      handler() {
        this.fetchMapData()
      },
      deep: true
    }
  },
  methods: {
    async fetchMapData() {
      const { username, slug } = this.$route.params
      
      if (!username || !slug) {
        this.error = 'Missing username or slug'
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await apiService.getPublicMap(username, slug)
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to load map')
        }

        const data = response.data?.data || response.data
        
        if (!data) {
          throw new Error('Invalid response format')
        }

        this.user = data.user || null
        this.map = data.map || null
        this.pois = Array.isArray(data.pois) ? data.pois : []

        // Pass data to child components via props (will be implemented when UI is designed)
        console.log('[PublishedMap] Loaded data:', {
          user: this.user,
          map: this.map,
          poisCount: this.pois.length
        })
      } catch (error) {
        console.error('[PublishedMap] Error loading map:', error)
        this.error = error.message || 'Failed to load map page'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.published-map-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}

.split-layout-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  align-items: stretch;
}

/* Left Side: User Profile Brief (Thin) */
.panel-side {
  width: 380px;
  flex: 0 0 380px;
  min-height: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--border-light);
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

/* Right Side: Map POIs */
.content-side {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>

