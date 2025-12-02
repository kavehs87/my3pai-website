<template>
  <div class="profile-overview">
    <div class="container">
      <ProfileStats :stats="computedStats" />
      <CreatorToolsToggle />
      <MyConsultationBookings :consultation-bookings-count="stats.consultationBookings || 0" />
    </div>
  </div>
</template>

<script>
import ProfileStats from './ProfileStats.vue'
import MyConsultationBookings from './MyConsultationBookings.vue'
import CreatorToolsToggle from './CreatorToolsToggle.vue'

export default {
  name: 'ProfileOverview',
  components: {
    ProfileStats,
    MyConsultationBookings,
    CreatorToolsToggle
  },
  props: {
    stats: {
      type: Object,
      required: true
    }
  },
  computed: {
    computedStats() {
      return [
        { label: 'Trips', value: this.stats.totalTrips || 0, icon: 'fas fa-map-marked-alt' },
        { label: 'Maps', value: this.stats.totalMaps || 0, icon: 'fas fa-route' },
        { label: 'Countries Visited', value: this.stats.countriesVisited || 0, icon: 'fas fa-globe' },
        { label: 'Days Traveled', value: this.stats.totalDaysTraveled || 0, icon: 'fas fa-calendar-day' },
        { label: 'Followers', value: this.stats.followers || 0, icon: 'fas fa-users' }
      ]
    }
  }
}
</script>

<style scoped>
.profile-overview {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
}

 
</style>

