<template>
  <section class="trips-section">
    <div class="container">
      <div class="section-header">
        <h2>Your Trips</h2>
        <p v-if="!error">Browse and continue planning your trips</p>
        <p v-else class="error">{{ error }}</p>
      </div>

      <div v-if="loading" class="loading">Loading trips...</div>
      <div v-else>
        <div v-if="trips.length === 0" class="empty-state">
          <p>No trips yet. Create your first trip!</p>
          <router-link class="btn" :to="{ name: 'trip-new' }">
            <i class="fas fa-plus"></i>
            Create Trip
          </router-link>
        </div>

        <div v-else class="trips-grid">
          <div v-for="trip in trips" :key="trip.id" class="trip-card" @click="openTrip(trip)">
            <div class="trip-thumb">
              <img :src="trip.thumbnail || placeholder" :alt="trip.title" />
              <div class="trip-status" :class="trip.status">{{ trip.status }}</div>
            </div>
            <div class="trip-content">
              <h3 class="trip-title">{{ trip.title }}</h3>
              <div class="trip-destination">{{ trip.destination }}</div>
              <div class="trip-meta">
                <span><i class="fas fa-calendar"></i> {{ formatRange(trip.startDate || trip.start_date, trip.endDate || trip.end_date) }}</span>
                <span v-if="trip.tags && trip.tags.length"><i class="fas fa-tags"></i> {{ trip.tags.slice(0, 3).join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import apiService from '../services/api.js'

export default {
  name: 'TripsSection',
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
        // Support both {success, data: {data: []}} and {success, data: []}
        const payload = res.data || {}
        this.trips = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : [])
      } catch (e) {
        this.error = e.message || 'Failed to load trips'
      } finally {
        this.loading = false
      }
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
    openTrip(trip) {
      this.$router.push({ name: 'studio', query: { tripId: trip.id } })
    }
  }
}
</script>

<style scoped>
.trips-section { padding: var(--spacing-3xl) 0; background: var(--bg-primary); }
.section-header { text-align: center; margin-bottom: var(--spacing-2xl); }
.error { color: var(--danger-color); }
.loading { text-align: center; color: var(--text-secondary); }
.empty-state { text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; gap: var(--spacing-md); align-items: center; }
.btn { background: var(--primary-color); color: #fff; border: none; border-radius: var(--radius-md); padding: var(--spacing-sm) var(--spacing-md); cursor: pointer; font-weight: 600; }
.trips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--spacing-xl); }
.trip-card { background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-light); transition: transform var(--transition-normal), box-shadow var(--transition-normal); cursor: pointer; }
.trip-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-medium); }
.trip-thumb { position: relative; height: 180px; overflow: hidden; }
.trip-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.trip-status { position: absolute; top: var(--spacing-sm); left: var(--spacing-sm); background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--font-size-sm); text-transform: capitalize; }
.trip-content { padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-sm); }
.trip-title { margin: 0; font-size: var(--font-size-xl); color: var(--text-primary); }
.trip-destination { color: var(--text-secondary); }
.trip-meta { display: flex; gap: var(--spacing-md); color: var(--text-secondary); font-size: var(--font-size-sm); }
.trip-meta i { margin-right: 6px; }
</style>

