<template>
  <div class="user-profile-brief">
    <UserProfileHeader 
      v-if="user"
      :user="user"
    />
    
    <UserProfileStats 
      v-if="user && map"
      :user="user"
      :map="map"
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
    map: {
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
  min-height: 100%;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
