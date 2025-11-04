<template>
  <div class="video-plans">
    <div class="container">
      <div class="section-header">
        <h2>Trips</h2>
        <p>Discover and continue planning your trips</p>
      </div>

      <div v-if="loading" class="loading">Loading trips...</div>
      <div v-else>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-else class="video-grid">
          <div 
            v-for="trip in trips" 
            :key="trip.id" 
            class="video-card"
            @click="openTrip(trip)"
          >
            <div class="video-thumbnail">
              <img :src="trip.thumbnail || placeholder" :alt="trip.title" />
              <div class="video-overlay">
                <div class="platform-badge" :class="trip.status">
                  <i class="fas fa-map"></i>
                </div>
                <div class="video-duration">{{ daysCount(trip) }} days</div>
                <div class="play-button">
                  <i class="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>

            <div class="video-content">
              <div class="trip-topline">
                <span class="destination"><i class="fas fa-location-dot"></i> {{ trip.destination }}</span>
                <button class="clone-btn" @click.stop="openTrip(trip)">Open</button>
              </div>

              <h3 class="video-title">{{ trip.title }}</h3>
              <p class="video-description">{{ formatRange(trip.startDate || trip.start_date, trip.endDate || trip.end_date) }}</p>

              <div class="plan-meta">
                <div class="meta-item">
                  <i class="fas fa-signal"></i>
                  <span class="difficulty">{{ (trip.budget || 'medium') }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(trip.createdAt || trip.created_at) }}</span>
                </div>
                <div class="meta-item" v-if="typeof trip.travelers === 'number' && trip.travelers > 0">
                  <i class="fas fa-user-friends"></i>
                  <span>{{ trip.travelers }}</span>
                </div>
              </div>

              <div class="video-tags" v-if="Array.isArray(trip.tags) && trip.tags.length">
                <span 
                  v-for="tag in trip.tags.slice(0, 3)" 
                  :key="tag" 
                  class="tag"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!trips.length && !error" class="empty-state">
          <p>No trips yet. Create your first trip!</p>
          <router-link class="btn" :to="{ name: 'trip-new' }">
            <i class="fas fa-plus"></i>
            Create Trip
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'

export default {
  name: 'TripPlans',
  data() {
    return {
      trips: [],
      loading: false,
      error: '',
      placeholder: 'https://via.placeholder.com/800x450?text=Trip+Thumbnail'
    }
  },
  async mounted() {
    await this.loadTrips()
  },
  methods: {
    async loadTrips() {
      this.loading = true
      this.error = ''
      try {
        const res = await apiService.getTrips('all')
        const payload = res.data || {}
        this.trips = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : [])
      } catch (e) {
        this.error = e.message || 'Failed to load trips'
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return '—'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    },
    formatRange(start, end) {
      if (!start || !end) return 'Dates TBD'
      const s = new Date(start)
      const e = new Date(end)
      const opts = { month: 'short', day: 'numeric' }
      if (s.getFullYear() !== e.getFullYear()) {
        return `${s.toLocaleDateString(undefined, { ...opts, year: 'numeric' })} - ${e.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`
      }
      return `${s.toLocaleDateString(undefined, opts)} - ${e.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`
    },
    daysCount(trip) {
      const start = new Date(trip.startDate || trip.start_date)
      const end = new Date(trip.endDate || trip.end_date)
      if (isNaN(start) || isNaN(end)) return '—'
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
      return Math.max(diff, 1)
    },
    openTrip(trip) {
      this.$router.push({ name: 'studio', query: { tripId: trip.id } })
    }
  }
}
</script>

<style scoped>
.video-plans { padding: var(--spacing-3xl) 0; background: var(--bg-secondary); }
.section-header { text-align: center; }
.loading { text-align: center; color: var(--text-secondary); }
.error { text-align: center; color: var(--danger-color); }
.empty-state { text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center; margin-top: var(--spacing-xl); }
.btn { background: var(--primary-color); color: #fff; border: none; border-radius: var(--radius-md); padding: var(--spacing-sm) var(--spacing-md); cursor: pointer; font-weight: 600; }
.video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-xl); margin-top: var(--spacing-2xl); }
.video-card { background: var(--bg-primary); border-radius: var(--radius-xl); overflow: hidden; box-shadow: 0 4px 20px var(--shadow-light); transition: all var(--transition-normal); cursor: pointer; }
.video-card:hover { transform: translateY(-8px); box-shadow: 0 12px 40px var(--shadow-medium); }
.video-thumbnail { position: relative; height: 200px; overflow: hidden; }
.video-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-normal); }
.video-card:hover .video-thumbnail img { transform: scale(1.05); }
.video-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity var(--transition-normal); }
.video-card:hover .video-overlay { opacity: 1; }
.platform-badge { position: absolute; top: var(--spacing-sm); left: var(--spacing-sm); width: 32px; height: 32px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--bg-primary); font-size: var(--font-size-sm); background: var(--secondary-color); text-transform: capitalize; }
.video-duration { position: absolute; bottom: var(--spacing-sm); right: var(--spacing-sm); background: rgba(0, 0, 0, 0.8); color: var(--bg-primary); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); }
.video-content { padding: var(--spacing-lg); }
.trip-topline { display: flex; align-items: center; gap: var(--spacing-md); }
.destination { color: var(--text-secondary); font-size: var(--font-size-sm); }
.clone-btn { margin-left: auto; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 6px 10px; font-weight: 600; cursor: pointer; }
.video-title { margin-top: var(--spacing-sm); margin-bottom: var(--spacing-xs); }
.video-description { color: var(--text-secondary); }
.plan-meta { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-sm); color: var(--text-secondary); font-size: var(--font-size-sm); }
.video-tags { margin-top: var(--spacing-md); }
.tag { background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 4px 8px; margin-right: 8px; }
</style>

