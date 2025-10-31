<template>
  <div class="profile-page">
    <Header />
    
    <ProfileHeader
      :user="profileData.user"
      @edit-profile="handleEditProfile"
      @edit-avatar="handleEditAvatar"
      @edit-cover="handleEditCover"
    />
    
    <ProfileTabs
      :active-tab="activeTab"
      :tabs="tabs"
      @tab-change="handleTabChange"
    />
    
    <div class="profile-content">
      <ProfileOverview
        v-if="activeTab === 'overview'"
        :stats="profileData.stats"
        :trips="profileData.recentTrips"
        :saved-plans="profileData.savedPlans"
        @view-all="handleViewAll"
        @view-trip="handleViewTrip"
        @view-plan="handleViewPlan"
      />
      
      <ProfileTrips
        v-if="activeTab === 'trips'"
        :trips="profileData.recentTrips"
        @create-trip="handleCreateTrip"
        @view-trip="handleViewTrip"
        @edit-trip="handleEditTrip"
        @delete-trip="handleDeleteTrip"
      />
      
      <ProfileSettings
        v-if="activeTab === 'settings'"
        :user="profileData.user"
        @save-profile="handleSaveProfile"
        @save-preferences="handleSavePreferences"
        @change-password="handleChangePassword"
        @delete-account="handleDeleteAccount"
      />
    </div>
  </div>
</template>

<script>
import Header from '../Header.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileTabs from './components/ProfileTabs.vue'
import ProfileOverview from './components/ProfileOverview.vue'
import ProfileTrips from './components/ProfileTrips.vue'
import ProfileSettings from './components/ProfileSettings.vue'
import profileData from '../../data/profile.json'

export default {
  name: 'Profile',
  components: {
    Header,
    ProfileHeader,
    ProfileTabs,
    ProfileOverview,
    ProfileTrips,
    ProfileSettings
  },
  data() {
    return {
      activeTab: 'overview',
      profileData: profileData,
      tabs: [
        { id: 'overview', label: 'Overview', icon: 'fas fa-home', count: null },
        { id: 'trips', label: 'Trips', icon: 'fas fa-map-marked-alt', count: profileData.recentTrips?.length || 0 },
        { id: 'settings', label: 'Settings', icon: 'fas fa-cog', count: null }
      ]
    }
  },
  mounted() {
    // Check if there's a tab query parameter
    const tab = this.$route.query.tab
    if (tab && ['overview', 'trips', 'settings'].includes(tab)) {
      this.activeTab = tab
    }
    
    // Load profile data (will be replaced with API call later)
    this.loadProfileData()
  },
  methods: {
    loadProfileData() {
      // TODO: Replace with API call
      // For now, use mock data from JSON
      console.log('Loading profile data:', this.profileData)
    },
    handleTabChange(tab) {
      this.activeTab = tab
      // Update URL without reloading
      this.$router.replace({ query: { ...this.$route.query, tab } })
    },
    handleEditProfile() {
      this.activeTab = 'settings'
      this.$router.replace({ query: { ...this.$route.query, tab: 'settings' } })
    },
    handleEditAvatar() {
      console.log('Edit avatar clicked')
      // TODO: Implement avatar upload
    },
    handleEditCover() {
      console.log('Edit cover clicked')
      // TODO: Implement cover upload
    },
    handleViewAll(type) {
      if (type === 'trips') {
        this.activeTab = 'trips'
        this.$router.replace({ query: { ...this.$route.query, tab: 'trips' } })
      } else if (type === 'saved') {
        console.log('View all saved plans')
        // TODO: Navigate to saved plans page
      }
    },
    handleViewTrip(tripId) {
      console.log('View trip:', tripId)
      // TODO: Navigate to trip detail page
    },
    handleViewPlan(planId) {
      console.log('View plan:', planId)
      // TODO: Navigate to plan detail page
    },
    handleCreateTrip() {
      console.log('Create new trip')
      // TODO: Navigate to trip creation page or open modal
      this.$router.push('/studio')
    },
    handleEditTrip(tripId) {
      console.log('Edit trip:', tripId)
      // TODO: Navigate to trip edit page
      this.$router.push('/studio')
    },
    handleDeleteTrip(tripId) {
      if (confirm('Are you sure you want to delete this trip?')) {
        console.log('Delete trip:', tripId)
        // TODO: Implement trip deletion via API
      }
    },
    handleSaveProfile(formData) {
      console.log('Save profile:', formData)
      // TODO: Implement profile save via API
      // Show success message
      alert('Profile updated successfully!')
    },
    handleSavePreferences(preferences) {
      console.log('Save preferences:', preferences)
      // TODO: Implement preferences save via API
      // Show success message
      alert('Preferences saved successfully!')
    },
    handleChangePassword() {
      console.log('Change password')
      // TODO: Open change password modal
      const newPassword = prompt('Enter new password:')
      if (newPassword) {
        console.log('Password change requested')
      }
    },
    handleDeleteAccount() {
      if (confirm('Are you absolutely sure? This will permanently delete your account and all associated data.')) {
        console.log('Delete account')
        // TODO: Implement account deletion via API
        // Redirect to home page after deletion
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.profile-content {
  padding: 0;
}
</style>

