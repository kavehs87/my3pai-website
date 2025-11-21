<template>
  <div class="user-profile-brief">
    <UserProfileHeader 
      v-if="user"
      :user="user"
    />
    
    <UserProfileStats 
      v-if="user && itinerary"
      :user="user"
      :itinerary="itinerary"
      :pois="pois"
    />
    
    <UserProfileAbout 
      v-if="user && user.bio"
      :bio="user.bio"
    />
  </div>
</template>

<script>
import UserProfileHeader from './UserProfileHeader.vue'
import UserProfileStats from './UserProfileStats.vue'
import UserProfileAbout from './UserProfileAbout.vue'

export default {
  name: 'UserProfileBrief',
  components: {
    UserProfileHeader,
    UserProfileStats,
    UserProfileAbout
  },
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
  }
}
</script>

<style scoped>
.user-profile-brief {
  padding: var(--spacing-xl);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
