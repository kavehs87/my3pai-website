<template>
  <div class="profile-page">
    <Header />
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading profile...</p>
      </div>
    </div>
    
    <template v-else>
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
      :trips="allTrips"
      :loading="isLoadingTrips"
      @create-trip="handleCreateTrip"
      @view-trip="handleViewTrip"
      @edit-trip="handleEditTrip"
      @delete-trip="handleDeleteTrip"
      @filter-change="loadTrips"
    />
      
      <ProfileSettings
        v-if="activeTab === 'settings'"
        :key="profileData.user?.id || 'settings'"
        :user="profileData.user || {}"
        @save-profile="handleSaveProfile"
        @save-preferences="handleSavePreferences"
        @change-password="handleChangePassword"
        @delete-account="handleDeleteAccount"
      />
    </div>
    </template>
  </div>
</template>

<script>
import Header from '../Header.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileTabs from './components/ProfileTabs.vue'
import ProfileOverview from './components/ProfileOverview.vue'
import ProfileTrips from './components/ProfileTrips.vue'
import ProfileSettings from './components/ProfileSettings.vue'
import apiService from '../../services/api.js'
import toast from '../../utils/toast.js'

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
      profileData: {
        user: {},
        stats: {},
        recentTrips: [],
        itineraries: [],
        savedPlans: []
      },
      allTrips: [],
      isLoading: true,
      isLoadingTrips: false,
      error: null,
      tabs: [
        { id: 'overview', label: 'Overview', icon: 'fas fa-home', count: null },
        { id: 'trips', label: 'Trips', icon: 'fas fa-map-marked-alt', count: 0 },
        { id: 'settings', label: 'Settings', icon: 'fas fa-cog', count: null }
      ]
    }
  },
  watch: {
    '$route.query.tab': {
      immediate: true,
      handler(tab) {
        if (tab && ['overview', 'trips', 'settings'].includes(tab)) {
          this.activeTab = tab
          // Load trips when trips tab is active
          if (tab === 'trips') {
            this.loadTrips()
          }
        } else if (!tab) {
          // Default to overview if no tab specified
          this.activeTab = 'overview'
        }
      }
    }
  },
  mounted() {
    // Check if there's a tab query parameter
    const tab = this.$route.query.tab
    if (tab && ['overview', 'trips', 'settings'].includes(tab)) {
      this.activeTab = tab
    }
    
    // Load profile data from API
    this.loadProfileData()
  },
  methods: {
    async loadProfileData() {
      this.isLoading = true
      this.error = null
      try {
        const result = await apiService.getProfile()
        if (result.success) {
          // Normalize API response to match frontend expectations
          // API service returns { success: true, data: <laravel_response> }
          // Laravel returns { success: true, data: { user: ..., stats: ... } }
          const apiResponse = result.data
          
          // The actual data is nested: result.data.data
          const data = apiResponse.data || apiResponse
          
          // Normalize user data (handle both camelCase and snake_case)
          const user = data.user || {}
          
          const prefs = user.preferences || {}
          
          // Normalize preferences structure (handle both nested and flat)
          const normalizedPreferences = {
            currency: prefs.currency || 'USD',
            language: prefs.language || 'en',
            timezone: prefs.timezone || 'America/Los_Angeles',
            notifications: {
              email: prefs.notifications?.email ?? prefs.notifications_email ?? true,
              push: prefs.notifications?.push ?? prefs.notifications_push ?? true,
              marketing: prefs.notifications?.marketing ?? prefs.notifications_marketing ?? false
            }
          }
          
          // Try both camelCase and snake_case variants
          const normalizedUser = {
            id: user.id,
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            email: user.email || '',
            username: user.username || '',
            avatar: user.avatar || user.avatar_url || '',
            coverImage: user.coverImage || user.cover_image || user.coverImage || '',
            bio: user.bio || '',
            location: user.location || '',
            joinedDate: user.joinedDate || user.created_at || user.joined_date || '',
            verified: user.verified || false,
            preferences: normalizedPreferences,
            socialLinks: user.socialLinks || user.social_links || []
          }
          
          // Normalize trips (handle date field names)
          const normalizeTrips = (trips) => {
            return (trips || []).map(trip => ({
              id: trip.id,
              title: trip.title,
              thumbnail: trip.thumbnail,
              destination: trip.destination,
              startDate: trip.startDate || trip.start_date,
              endDate: trip.endDate || trip.end_date,
              days: trip.days,
              status: trip.status,
              createdAt: trip.createdAt || trip.created_at
            }))
          }
          
          this.profileData = {
            user: normalizedUser,
            stats: data.stats || {},
            recentTrips: normalizeTrips(data.recentTrips || data.recent_trips),
            itineraries: data.itineraries || [],
            savedPlans: data.savedPlans || data.saved_plans || []
          }
          
          // Update trip count in tabs
          this.tabs[1].count = this.profileData.recentTrips?.length || 0
        } else {
          this.error = result.error || 'Failed to load profile'
          console.error('Profile load error:', result.error)
        }
      } catch (error) {
        this.error = error.message || 'Failed to load profile'
        console.error('Profile load error:', error)
      } finally {
        this.isLoading = false
      }
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
    async handleEditAvatar() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        try {
          const result = await apiService.uploadAvatar(file)
          if (result.success) {
            // Update local profile data
            this.profileData.user.avatar = result.data.avatar
            toast.success('Avatar updated successfully!')
            // Reload profile to get latest data
            await this.loadProfileData()
          } else {
            toast.error(`Failed to upload avatar: ${result.error}`)
          }
        } catch (error) {
          toast.error(`Error uploading avatar: ${error.message}`)
        }
      }
      input.click()
    },
    async handleEditCover() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        try {
          const result = await apiService.uploadCover(file)
          if (result.success) {
            // Update local profile data
            this.profileData.user.coverImage = result.data.coverImage
            toast.success('Cover image updated successfully!')
            // Reload profile to get latest data
            await this.loadProfileData()
          } else {
            toast.error(`Failed to upload cover: ${result.error}`)
          }
        } catch (error) {
          toast.error(`Error uploading cover: ${error.message}`)
        }
      }
      input.click()
    },
    async loadTrips(status = null) {
      this.isLoadingTrips = true
      try {
        const result = await apiService.getTrips(status)
        if (result.success) {
          // Normalize trip data format
          const trips = result.data || []
          this.allTrips = trips.map(trip => ({
            id: trip.id,
            title: trip.title,
            thumbnail: trip.thumbnail,
            destination: trip.destination,
            startDate: trip.startDate || trip.start_date,
            endDate: trip.endDate || trip.end_date,
            days: trip.days,
            status: trip.status,
            createdAt: trip.createdAt || trip.created_at
          }))
        } else {
          console.error('Failed to load trips:', result.error)
        }
      } catch (error) {
        console.error('Error loading trips:', error)
      } finally {
        this.isLoadingTrips = false
      }
    },
    handleViewAll(type) {
      if (type === 'trips') {
        this.activeTab = 'trips'
        this.$router.replace({ query: { ...this.$route.query, tab: 'trips' } })
        this.loadTrips()
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
    async handleDeleteTrip(tripId) {
      if (!confirm('Are you sure you want to delete this trip?')) return
      
      try {
        const result = await apiService.deleteTrip(tripId)
        if (result.success) {
          toast.success('Trip deleted successfully!')
          // Reload profile data
          await this.loadProfileData()
        } else {
          toast.error(`Failed to delete trip: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error deleting trip: ${error.message}`)
      }
    },
    async handleSaveProfile(formData) {
      try {
        // Convert camelCase to snake_case for API
        const apiData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location
        }
        
        const result = await apiService.updateProfile(apiData)
        if (result.success && result.data && result.data.user) {
          // Immediately update the user data from response
          const updatedUser = result.data.user
          const prefs = updatedUser.preferences || {}
          
          // Normalize preferences structure
          const normalizedPreferences = {
            currency: prefs.currency || 'USD',
            language: prefs.language || 'en',
            timezone: prefs.timezone || 'America/Los_Angeles',
            notifications: {
              email: prefs.notifications?.email ?? prefs.notifications_email ?? true,
              push: prefs.notifications?.push ?? prefs.notifications_push ?? true,
              marketing: prefs.notifications?.marketing ?? prefs.notifications_marketing ?? false
            }
          }
          
          // Update user object with normalized data - use Object.assign to ensure reactivity
          Object.assign(this.profileData.user, {
            id: updatedUser.id,
            firstName: updatedUser.firstName || updatedUser.first_name,
            lastName: updatedUser.lastName || updatedUser.last_name,
            email: updatedUser.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            coverImage: updatedUser.coverImage || updatedUser.cover_image,
            bio: updatedUser.bio,
            location: updatedUser.location,
            joinedDate: updatedUser.joinedDate || updatedUser.created_at || updatedUser.joinedDate,
            verified: updatedUser.verified || false,
            preferences: normalizedPreferences,
            socialLinks: updatedUser.socialLinks || updatedUser.social_links || []
          })
          
          // Force Vue to recognize the change
          this.$forceUpdate()
          
          toast.success('Profile updated successfully!')
          // Also reload to get stats and other data fresh
          await this.loadProfileData()
        } else {
          toast.error(`Failed to update profile: ${result.error || 'Unknown error'}`)
        }
      } catch (error) {
        toast.error(`Error updating profile: ${error.message}`)
      }
    },
    async handleSavePreferences(preferences) {
      try {
        const result = await apiService.updatePreferences(preferences)
        if (result.success) {
          toast.success('Preferences saved successfully!')
          // Reload profile data
          await this.loadProfileData()
        } else {
          toast.error(`Failed to save preferences: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error saving preferences: ${error.message}`)
      }
    },
    async handleChangePassword() {
      const currentPassword = prompt('Enter current password:')
      if (!currentPassword) return
      
      const newPassword = prompt('Enter new password:')
      if (!newPassword) return
      
      const confirmPassword = prompt('Confirm new password:')
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match!')
        return
      }
      
      try {
        const result = await apiService.changePassword({
          currentPassword,
          newPassword,
          newPasswordConfirmation: confirmPassword
        })
        if (result.success) {
          toast.success('Password changed successfully!')
        } else {
          toast.error(`Failed to change password: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error changing password: ${error.message}`)
      }
    },
    async handleDeleteAccount() {
      if (!confirm('Are you absolutely sure? This will permanently delete your account and all associated data.')) return
      
      const password = prompt('Enter your password to confirm account deletion:')
      if (!password) return
      
      try {
        const result = await apiService.deleteAccount(password)
        if (result.success) {
          toast.success('Account deleted successfully')
          // Clear auth token and redirect
          apiService.removeToken()
          this.$router.push('/')
        } else {
          toast.error(`Failed to delete account: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error deleting account: ${error.message}`)
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

.loading-overlay {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.loading-spinner {
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner i {
  font-size: var(--font-size-4xl);
  color: var(--secondary-color);
  margin-bottom: var(--spacing-md);
}

.loading-spinner p {
  font-size: var(--font-size-lg);
  margin: 0;
}
</style>

