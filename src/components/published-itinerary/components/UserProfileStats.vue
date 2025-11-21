<template>
  <div class="user-profile-stats">
    <div class="stat-item">
      <i class="fas fa-location-dot stat-icon locations"></i>
      <span class="stat-text">
        <span class="stat-value">{{ totalPOIs }} Points of Interest</span>
      </span>
    </div>

    <div class="stat-item">
      <i class="fas fa-map stat-icon maps"></i>
      <span class="stat-text">
        <span class="stat-value">{{ mapsCount }} digital map{{ mapsCount !== 1 ? 's' : '' }} built</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfileStats',
  props: {
    user: {
      type: Object,
      default: null
    },
    itinerary: {
      type: Object,
      default: null
    },
    pois: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    totalPOIs() {
      return this.pois.length || 0
    },
    mapsCount() {
      // Use publishedItinerariesCount from user object
      if (this.user && typeof this.user.publishedItinerariesCount === 'number') {
        return this.user.publishedItinerariesCount
      }
      // Fallback to 1 if we have an itinerary but no count
      return this.itinerary ? 1 : 0
    }
  }
}
</script>

<style scoped>
.user-profile-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  white-space: nowrap;
  overflow: hidden;
}

.stat-icon {
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.stat-icon.locations {
  color: #8b5cf6;
}

.stat-icon.maps {
  color: #3b82f6;
}

.stat-text {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  line-height: 1.4;
  white-space: nowrap;
  flex-wrap: nowrap;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
}
</style>

