<template>
  <div class="profile-overview">
    <div class="container">
      <ProfileStats :stats="computedStats" />
      
      <div class="content-sections">
        <section class="recent-trips-section">
          <div class="section-header">
            <h2>Recent Trips</h2>
            <button class="view-all-btn" @click="$emit('view-all', 'trips')">
              View All
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="trips-grid" v-if="trips && trips.length > 0">
            <div
              v-for="trip in trips.slice(0, 3)"
              :key="trip.id"
              class="trip-card"
              @click="$emit('view-trip', trip.id)"
            >
              <div class="trip-thumbnail">
                <img :src="trip.thumbnail" :alt="trip.title" @error="handleImageError" />
                <span class="trip-status" :class="trip.status">{{ trip.status }}</span>
              </div>
              <div class="trip-info">
                <h3>{{ trip.title }}</h3>
                <div class="trip-meta">
                  <span class="trip-destination">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ trip.destination }}
                  </span>
                  <span class="trip-dates">
                    <i class="fas fa-calendar"></i>
                    {{ formatDateRange(trip.startDate, trip.endDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-map-marked-alt"></i>
            <p>No trips yet. Start planning your first adventure!</p>
          </div>
        </section>

        <section class="saved-plans-section">
          <div class="section-header">
            <h2>Saved Plans</h2>
            <button class="view-all-btn" @click="$emit('view-all', 'saved')">
              View All
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <div class="plans-grid" v-if="savedPlans && savedPlans.length > 0">
            <div
              v-for="plan in savedPlans.slice(0, 4)"
              :key="plan.id"
              class="plan-card"
              @click="$emit('view-plan', plan.id)"
            >
              <img :src="plan.thumbnail" :alt="plan.title" @error="handleImageError" />
              <div class="plan-info">
                <h4>{{ plan.title }}</h4>
                <p class="plan-creator">{{ plan.creator }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-bookmark"></i>
            <p>No saved plans yet. Start exploring and save your favorites!</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileStats from './ProfileStats.vue'

export default {
  name: 'ProfileOverview',
  components: {
    ProfileStats
  },
  props: {
    stats: {
      type: Object,
      required: true
    },
    trips: {
      type: Array,
      default: () => []
    },
    savedPlans: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    computedStats() {
      return [
        { label: 'Trips', value: this.stats.totalTrips || 0, icon: 'fas fa-map-marked-alt' },
        { label: 'Itineraries', value: this.stats.totalItineraries || 0, icon: 'fas fa-route' },
        { label: 'Saved Plans', value: this.stats.savedPlans || 0, icon: 'fas fa-bookmark' },
        { label: 'Countries Visited', value: this.stats.countriesVisited || 0, icon: 'fas fa-globe' },
        { label: 'Days Traveled', value: this.stats.totalDaysTraveled || 0, icon: 'fas fa-calendar-day' },
        { label: 'Followers', value: this.stats.followers || 0, icon: 'fas fa-users' }
      ]
    }
  },
  methods: {
    formatDateRange(start, end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    },
    handleImageError(event) {
      event.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    }
  }
}
</script>

<style scoped>
.profile-overview {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
}

.content-sections {
  margin-top: var(--spacing-2xl);
}

section {
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.view-all-btn:hover {
  gap: var(--spacing-sm);
}

.trips-grid,
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.trip-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.trip-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.trip-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-status {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
}

.trip-status.completed {
  background: var(--success-color);
  color: white;
}

.trip-status.upcoming {
  background: var(--info-color);
  color: white;
}

.trip-status.planning {
  background: var(--warning-color);
  color: white;
}

.trip-info {
  padding: var(--spacing-md);
}

.trip-info h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.trip-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.trip-destination,
.trip-dates {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.trip-destination i,
.trip-dates i {
  color: var(--secondary-color);
  width: 16px;
}

.plan-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.plan-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.plan-info {
  padding: var(--spacing-md);
}

.plan-info h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.plan-creator {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-light);
}

.empty-state i {
  font-size: var(--font-size-4xl);
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .trips-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>

