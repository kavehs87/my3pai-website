<template>
  <div class="video-plans">
    <div class="container">
      <div class="section-header">
        <h2>Trips</h2>
        <p>Discover and continue planning your trips</p>
      </div>

      <div v-if="loading" class="loading">Loading featured trips...</div>
      <div v-else>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-else class="video-grid" v-if="trips.length">
          <div 
            v-for="trip in trips" 
            :key="trip.id" 
            class="video-card"
            @click="openTrip(trip)"
          >
            <div class="video-thumbnail">
              <img :src="trip.thumbnail || placeholder" :alt="trip.title" />
              <div class="video-overlay">
                <div class="platform-badge" :class="trip.statusClass">
                  <i class="fas fa-map"></i>
                </div>
                <div class="video-duration">{{ daysCount(trip) }} days</div>
                <div class="play-button">
                  <i class="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>

            <div class="video-content">
              <div class="creator-badge" v-if="trip.owner?.name">
                <img :src="trip.owner.avatar || placeholderAvatar" :alt="trip.owner.name" />
                <div class="creator-meta">
                  <span class="creator-name">{{ trip.owner.name }}</span>
                  <span v-if="trip.createdAt" class="plan-updated">{{ formatDate(trip.createdAt) }}</span>
                </div>
              </div>

              <div class="plan-header">
                <span class="destination" v-if="trip.destination">
                  <i class="fas fa-location-dot"></i>
                  {{ trip.destination }}
                </span>
                <span class="plan-duration" v-if="trip.startDate && trip.endDate">
                  <i class="fas fa-route"></i>
                  {{ formatRange(trip.startDate, trip.endDate) }}
                </span>
              </div>

              <h3 class="video-title">{{ trip.title }}</h3>

              <div class="badges">
                <span class="badge difficulty" :class="trip.difficulty">
                  <i class="fas fa-signal"></i>
                  {{ trip.difficulty }}
                </span>
                <span class="badge status" :class="trip.statusClass">
                  <i class="fas fa-map-marked-alt"></i>
                  {{ trip.status }}
                </span>
              </div>

              <div class="action-bar">
                <button class="cta-btn" @click.stop="openTrip(trip)">
                  <i class="fas fa-arrow-right"></i>
                  Open in Studio
                </button>

                <div class="tag-group" v-if="Array.isArray(trip.tags) && trip.tags.length">
                  <span 
                    v-for="tag in trip.tags.slice(0, 2)" 
                    :key="`${trip.id}-${tag}`" 
                    class="chip"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="trip.tags.length > 2" class="chip more">+{{ trip.tags.length - 2 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!trips.length && !error" class="empty-state">
          <p>No discovery trips available right now.</p>
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
      placeholder: 'https://via.placeholder.com/800x450?text=Trip+Thumbnail',
      placeholderAvatar: 'https://via.placeholder.com/48?text=A'
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
        const res = await apiService.getDiscoverTrips({ perPage: 9 })
        if (!res.success) {
          throw new Error(res.error || 'Failed to load trips')
        }
        const trips = this.extractTripsArray(res.data)
        this.trips = trips.map(trip => this.transformTrip(trip))
        if (!this.trips.length) {
          console.warn('[TripPlans] No trips returned from API response:', res)
        }
      } catch (e) {
        this.error = e.message || 'Failed to load trips'
      } finally {
        this.loading = false
      }
    },
    extractTripsArray(payload) {
      if (!payload) return []
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload.trips)) return payload.trips
      if (Array.isArray(payload.data)) return payload.data
      if (Array.isArray(payload.data?.trips)) return payload.data.trips
      return []
    },
    transformTrip(trip) {
      const startDate = trip.startDate || trip.start_date || null
      const endDate = trip.endDate || trip.end_date || null
      const createdAtRaw = trip.createdAt || trip.created_at || trip.updatedAt || null
      const difficulty = trip.difficulty || 'medium'
      const status = trip.status || 'planning'
      const statusClass = status.toString().toLowerCase()
      const tagsArray = Array.isArray(trip.tags)
        ? trip.tags.filter(Boolean)
        : []
      const thumbnail = trip.shortThumbnail || trip.short_thumbnail || trip.thumbnail
      const travelers = null
      const owner = trip.owner || {}

      return {
        id: trip.id || Math.random().toString(36).slice(2),
        title: trip.title || 'Untitled Trip',
        destination: trip.destination || 'Unknown destination',
        thumbnail,
        startDate,
        endDate,
        createdAt: createdAtRaw || startDate || null,
        difficulty,
        status: status,
        statusClass,
        travelers: travelers,
        tags: tagsArray,
        owner: {
          id: owner.id,
          name: owner.name,
          avatar: owner.avatar
        },
        views: trip.views ?? null,
        likes: trip.likes ?? null
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
.creator-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}
.creator-badge img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--bg-primary);
  box-shadow: var(--shadow-light);
}
.creator-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.creator-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}
.plan-updated {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
.plan-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.plan-header i {
  color: var(--secondary-color);
}
.video-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}
.badges {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
}
.badge i {
  font-size: 0.8rem;
}
.badge.difficulty {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
.badge.difficulty.medium { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
.badge.difficulty.easy { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.badge.difficulty.hard { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
.badge.status {
  background: #111827;
  color: #f9fafb;
}
.badge.status.planning { background: #f97316; }
.badge.status.upcoming { background: #3b82f6; }
.badge.status.completed { background: #10b981; }
.badge.status.cancelled { background: #ef4444; }
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}
.cta-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: all var(--transition-normal);
}
.cta-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}
.tag-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.chip {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
}
.chip.more {
  background: rgba(15, 118, 110, 0.1);
  color: var(--secondary-color);
  border-color: rgba(15, 118, 110, 0.3);
}
</style>

