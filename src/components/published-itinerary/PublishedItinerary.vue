<template>
  <div class="published-itinerary-page">
    <!-- Custom Navbar for Published Itinerary -->
    <PublishedItineraryNavbar />

    <!-- Split Layout Container -->
    <div class="split-layout-container">
      <!-- Left Side: User Profile Brief (Thin) -->
      <div class="panel-side">
        <UserProfileBrief 
          :user="user"
          :itinerary="itinerary"
          :pois="pois"
        />
      </div>

      <!-- Right Side: Itinerary POIs -->
      <div class="content-side">
        <ItineraryPOIs 
          :user="user"
          :itinerary="itinerary"
          :pois="pois"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PublishedItineraryNavbar from './components/PublishedItineraryNavbar.vue'
import UserProfileBrief from './components/UserProfileBrief.vue'
import ItineraryPOIs from './components/ItineraryPOIs.vue'
import apiService from '../../services/api.js'

export default {
  name: 'PublishedItinerary',
  components: {
    PublishedItineraryNavbar,
    UserProfileBrief,
    ItineraryPOIs
  },
  data() {
    return {
      // Will be populated with itinerary data
      itinerary: null,
      user: null,
      pois: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.fetchItineraryData()
  },
  watch: {
    '$route.params': {
      handler() {
        this.fetchItineraryData()
      },
      deep: true
    }
  },
  methods: {
    async fetchItineraryData() {
      const { username, slug } = this.$route.params
      
      if (!username || !slug) {
        this.error = 'Missing username or slug'
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await apiService.getPublicItinerary(username, slug)
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to load itinerary')
        }

        const data = response.data?.data || response.data
        
        if (!data) {
          throw new Error('Invalid response format')
        }

        this.user = data.user || null
        this.itinerary = data.itinerary || null
        this.pois = Array.isArray(data.pois) ? data.pois : []

        // Pass data to child components via props (will be implemented when UI is designed)
        console.log('[PublishedItinerary] Loaded data:', {
          user: this.user,
          itinerary: this.itinerary,
          poisCount: this.pois.length
        })
      } catch (error) {
        console.error('[PublishedItinerary] Error loading itinerary:', error)
        this.error = error.message || 'Failed to load itinerary page'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.published-itinerary-page {
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

/* Right Side: Itinerary POIs */
.content-side {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>

