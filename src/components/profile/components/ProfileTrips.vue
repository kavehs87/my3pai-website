<template>
  <div class="profile-trips">
    <div class="container">
      <div class="trips-header">
        <h2>My Trips</h2>
        <button class="create-btn" @click="$emit('create-trip')">
          <i class="fas fa-plus"></i>
          Create New Trip
        </button>
      </div>

      <div class="trips-filter">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
          @click="handleFilterChange(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading trips...</p>
      </div>

      <div class="trips-grid" v-else-if="filteredTrips.length > 0">
        <div
          v-for="trip in filteredTrips"
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
              <span class="trip-duration">
                <i class="fas fa-clock"></i>
                {{ trip.days }} days
              </span>
            </div>
            <div class="trip-actions">
              <button class="action-btn" @click.stop="$emit('edit-trip', trip.id)">
                <i class="fas fa-edit"></i>
                Edit
              </button>
              <button class="action-btn" @click.stop="$emit('delete-trip', trip.id)">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <i class="fas fa-map-marked-alt"></i>
        <h3>No trips found</h3>
        <p>{{ activeFilter === 'all' ? "Start planning your first adventure!" : `No ${activeFilter} trips yet.` }}</p>
        <button class="create-btn" @click="$emit('create-trip')">
          <i class="fas fa-plus"></i>
          Create New Trip
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileTrips',
  props: {
    trips: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeFilter: 'all',
      filters: [
        { label: 'All', value: 'all' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Completed', value: 'completed' },
        { label: 'Planning', value: 'planning' }
      ]
    }
  },
  computed: {
    filteredTrips() {
      if (this.activeFilter === 'all') {
        return this.trips
      }
      return this.trips.filter(trip => trip.status === this.activeFilter)
    }
  },
  methods: {
    handleFilterChange(filter) {
      this.activeFilter = filter
      // Emit event to parent to reload trips with filter
      this.$emit('filter-change', filter === 'all' ? null : filter)
    },
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
.profile-trips {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.trips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.trips-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.create-btn {
  background: var(--secondary-color);
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.create-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 196, 200, 0.3);
}

.trips-filter {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.filter-btn:hover {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.filter-btn.active {
  background: var(--secondary-color);
  border-color: var(--secondary-color);
  color: white;
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  height: 200px;
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
  margin-bottom: var(--spacing-md);
}

.trip-destination,
.trip-dates,
.trip-duration {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.trip-destination i,
.trip-dates i,
.trip-duration i {
  color: var(--secondary-color);
  width: 16px;
}

.trip-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.action-btn {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.action-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.action-btn:last-child:hover {
  border-color: var(--error-color);
  color: var(--error-color);
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

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
}

.loading-state {
  text-align: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.loading-state i {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .trips-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .trips-grid {
    grid-template-columns: 1fr;
  }
}
</style>

