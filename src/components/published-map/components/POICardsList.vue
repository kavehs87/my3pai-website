<template>
  <div class="poi-cards-list">
    <div v-if="pois.length === 0" class="empty-state">
      <p>No locations found</p>
    </div>
    <div v-else class="poi-cards-grid">
      <POICard
        v-for="poi in pois"
        :key="poi.id"
        :poi="poi"
        :maps-count="mapsCount"
        @view-details="handleViewDetails"
        @show-on-map="handleShowOnMap"
        @add-to-map="handleAddToMap"
        @toggle-favorite="handleToggleFavorite"
      />
    </div>
  </div>
</template>

<script>
import POICard from './POICard.vue'

export default {
  name: 'POICardsList',
  components: {
    POICard
  },
  props: {
    pois: {
      type: Array,
      default: () => []
    },
    mapsCount: {
      type: Number,
      default: 1
    }
  },
  methods: {
    handleViewDetails(poi) {
      this.$emit('view-details', poi)
    },
    handleShowOnMap(poi) {
      this.$emit('show-on-map', poi)
    },
    handleAddToMap(poi) {
      this.$emit('add-to-map', poi)
    },
    handleToggleFavorite(poi, isFavorite) {
      this.$emit('toggle-favorite', poi, isFavorite)
    }
  }
}
</script>

<style scoped>
.poi-cards-list {
  width: 100%;
}

.poi-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

@media (max-width: 768px) {
  .poi-cards-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}
</style>

