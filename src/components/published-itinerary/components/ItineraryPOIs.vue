<template>
  <div class="itinerary-pois">
    <!-- Itinerary POIs content will be added here -->
    <div class="pois-placeholder">
      <p>Itinerary POIs</p>
      <p class="placeholder-text">Content will be added here</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItineraryPOIs',
  data() {
    return {
      itinerary: null,
      pois: [],
      loading: true
    }
  },
  async mounted() {
    // Fetch itinerary and POIs data based on route params
    // This will be implemented later
    this.loading = false
  }
}
</script>

<style scoped>
.itinerary-pois {
  padding: var(--spacing-lg);
  height: 100%;
}

.pois-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
  text-align: center;
}

.pois-placeholder p {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
}

.placeholder-text {
  margin-top: var(--spacing-xs) !important;
  font-size: var(--font-size-sm) !important;
  font-weight: 400 !important;
  opacity: 0.7;
}
</style>

