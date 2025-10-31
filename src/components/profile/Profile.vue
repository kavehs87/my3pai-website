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
        ref="profileSettings"
        v-if="activeTab === 'settings'"
        :key="profileData.user?.id || 'settings'"
        :user="profileData.user || {}"
        @save-profile="handleSaveProfile"
        @save-preferences="handleSavePreferences"
        @save-social-links="handleSaveSocialLinks"
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
import eventBus from '../../utils/eventBus.js'

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
    async loadProfileData(preserveScroll = false) {
      // Store scroll position if we want to preserve it
      const scrollY = preserveScroll ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop) : null
      
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
          
          // Restore scroll position if requested
          if (preserveScroll && scrollY !== null) {
            await this.$nextTick()
            requestAnimationFrame(() => {
              window.scrollTo(0, scrollY)
            })
          }
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
            const newAvatar = result.data.avatar || result.data.data?.avatar
            this.profileData.user.avatar = newAvatar
            toast.success('Avatar updated successfully!')
            
            // Emit event to update Header navbar
            eventBus.emit('profile-updated', {
              avatar: newAvatar
            })
            
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
            const newCover = result.data.coverImage || result.data.data?.coverImage
            this.profileData.user.coverImage = newCover
            toast.success('Cover image updated successfully!')
            
            // Emit event to update Header navbar (if cover affects header)
            eventBus.emit('profile-updated', {
              coverImage: newCover
            })
            
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
        if (result.success) {
          // Handle nested response structure (API service wraps Laravel response)
          // API service returns { success: true, data: <laravel_response> }
          // Laravel returns { success: true, data: { user: ... } }
          const apiResponse = result.data
          const data = apiResponse.data || apiResponse
          const updatedUser = data.user || apiResponse.user
          
          if (!updatedUser) {
            toast.error('Failed to update profile: Invalid response format')
            return
          }
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
          
          // Emit event to update Header navbar with updated user data
          eventBus.emit('profile-updated', {
            firstName: normalizedUser.firstName,
            lastName: normalizedUser.lastName,
            username: normalizedUser.username,
            bio: normalizedUser.bio,
            location: normalizedUser.location
          })
          
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
          
          // Store scroll position before reload
          const scrollYBefore = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
          
          // Reload profile data to get updated preferences
          // Skip loading overlay to prevent scroll jump
          const wasLoading = this.isLoading
          this.isLoading = false // Prevent overlay from showing
          try {
            const result = await apiService.getProfile()
            if (result.success) {
              const apiResponse = result.data
              const data = apiResponse.data || apiResponse
              const user = data.user || {}
              const prefs = user.preferences || {}
              const notifications = prefs.notifications || {}
              const normalizedPreferences = {
                currency: prefs.currency || 'USD',
                language: prefs.language || 'en',
                timezone: prefs.timezone || 'America/Los_Angeles',
                notifications: {
                  email: notifications.email ?? prefs.notifications_email ?? true,
                  push: notifications.push ?? prefs.notifications_push ?? true,
                  marketing: notifications.marketing ?? prefs.notifications_marketing ?? false
                }
              }
              this.profileData.user.preferences = normalizedPreferences
            }
          } catch (error) {
            console.error('Error reloading profile:', error)
          }
          
          // Restore scroll position immediately to prevent jump
          window.scrollTo(0, scrollYBefore)
          
          // Wait for DOM to fully update and then scroll to Notifications section
          await this.$nextTick()
          // Use double requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const preferencesSection = document.getElementById('preferences-section')
              if (preferencesSection) {
                // Calculate element position
                const rect = preferencesSection.getBoundingClientRect()
                const elementTop = rect.top + window.scrollY || window.pageYOffset || document.documentElement.scrollTop
                const offset = 100 // Header offset
                
                // Scroll to the section smoothly
                window.scrollTo({
                  top: Math.max(0, elementTop - offset),
                  behavior: 'smooth'
                })
              }
            })
          })
        } else {
          toast.error(`Failed to save preferences: ${result.error}`)
        }
      } catch (error) {
        toast.error(`Error saving preferences: ${error.message}`)
      }
    },
    async handleSaveSocialLinks({ current, original }) {
      // Reset saving state in child component via event or ref
      const settingsComponent = this.$refs.profileSettings
      if (settingsComponent) {
        settingsComponent.isSavingSocialLinks = true
      }
      
      try {
        // Identify changes:
        // 1. Links to delete (in original but not in current)
        // 2. Links to update (in both but changed)
        // 3. Links to create (in current but not in original)
        
        const originalMap = new Map(original.map(link => [link.id, link]))
        
        // Find links to delete (have ID but not in current)
        const toDelete = original.filter(link => 
          link.id && !current.some(cl => cl.id === link.id)
        )
        
        // Find links to create (no ID)
        const toCreate = current.filter(link => !link.id)
        
        // Find links to update (have ID and exist in both, but changed)
        const toUpdate = current.filter(link => {
          if (!link.id) return false
          const origLink = originalMap.get(link.id)
          if (!origLink) return false
          return origLink.platform !== link.platform || 
                 origLink.url !== link.url || 
                 origLink.public !== link.public
        })
        
        // Execute deletions
        for (const link of toDelete) {
          const result = await apiService.deleteSocialLink(link.id)
          if (!result.success) {
            toast.error(`Failed to delete ${link.platform} link`)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
        }
        
        // Execute updates
        for (const link of toUpdate) {
          // Validate URL is not empty
          if (!link.url || !link.url.trim()) {
            toast.error(`Please enter a URL for ${link.platform}`)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
          
          // Format URL - handle both full URLs and usernames
          let formattedUrl = link.url.trim()
          
          // Check if it's just a username (no dots/slashes/http) - alphanumeric with underscores/dots/dashes
          const isUsername = /^[\w.\-]+$/.test(formattedUrl) && !formattedUrl.includes('/') && !formattedUrl.includes('.')
          
          if (isUsername) {
            // Construct platform-specific URL from username
            const platformUrls = {
              'Instagram': `https://instagram.com/${formattedUrl}`,
              'Twitter': `https://twitter.com/${formattedUrl}`,
              'Facebook': `https://facebook.com/${formattedUrl}`,
              'YouTube': `https://youtube.com/@${formattedUrl}`,
              'TikTok': `https://tiktok.com/@${formattedUrl}`,
              'LinkedIn': `https://linkedin.com/in/${formattedUrl}`,
              'Pinterest': `https://pinterest.com/${formattedUrl}`,
              'Snapchat': `https://snapchat.com/add/${formattedUrl}`,
              'Website': `https://${formattedUrl}`,
              'Other': `https://${formattedUrl}`
            }
            formattedUrl = platformUrls[link.platform] || `https://${formattedUrl}`
          } else {
            // It's a URL - ensure it has a protocol
            if (!/^https?:\/\//i.test(formattedUrl)) {
              formattedUrl = `https://${formattedUrl}`
            }
          }
          
          // Basic URL validation
          try {
            new URL(formattedUrl)
          } catch (e) {
            toast.error(`Please enter a valid URL or username for ${link.platform}`)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
          
          // Convert to snake_case for Laravel backend
          const result = await apiService.updateSocialLink(link.id, {
            platform: link.platform,
            url: formattedUrl,
            is_public: link.public !== undefined ? link.public : true
          })
          if (!result.success) {
            const errorMsg = result.error || `Failed to update ${link.platform} link`
            toast.error(errorMsg)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
        }
        
        // Execute creations
        for (const link of toCreate) {
          // Validate URL is not empty
          if (!link.url || !link.url.trim()) {
            toast.error(`Please enter a URL for ${link.platform}`)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
          
          // Format URL - handle both full URLs and usernames
          let formattedUrl = link.url.trim()
          
          // Check if it's just a username (no dots/slashes/http) - alphanumeric with underscores/dots/dashes
          const isUsername = /^[\w.\-]+$/.test(formattedUrl) && !formattedUrl.includes('/') && !formattedUrl.includes('.')
          
          if (isUsername) {
            // Construct platform-specific URL from username
            const platformUrls = {
              'Instagram': `https://instagram.com/${formattedUrl}`,
              'Twitter': `https://twitter.com/${formattedUrl}`,
              'Facebook': `https://facebook.com/${formattedUrl}`,
              'YouTube': `https://youtube.com/@${formattedUrl}`,
              'TikTok': `https://tiktok.com/@${formattedUrl}`,
              'LinkedIn': `https://linkedin.com/in/${formattedUrl}`,
              'Pinterest': `https://pinterest.com/${formattedUrl}`,
              'Snapchat': `https://snapchat.com/add/${formattedUrl}`,
              'Website': `https://${formattedUrl}`,
              'Other': `https://${formattedUrl}`
            }
            formattedUrl = platformUrls[link.platform] || `https://${formattedUrl}`
          } else {
            // It's a URL - ensure it has a protocol
            if (!/^https?:\/\//i.test(formattedUrl)) {
              formattedUrl = `https://${formattedUrl}`
            }
          }
          
          // Basic URL validation
          try {
            new URL(formattedUrl)
          } catch (e) {
            toast.error(`Please enter a valid URL or username for ${link.platform}`)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
          
          // Convert to snake_case for Laravel backend
          const result = await apiService.createSocialLink({
            platform: link.platform,
            url: formattedUrl,
            is_public: link.public !== undefined ? link.public : true
          })
          if (!result.success) {
            const errorMsg = result.error || `Failed to create ${link.platform} link`
            toast.error(errorMsg)
            console.error('Social link creation error:', result)
            if (settingsComponent) settingsComponent.isSavingSocialLinks = false
            return
          }
        }
        
        // Success!
        if (toDelete.length > 0 || toUpdate.length > 0 || toCreate.length > 0) {
          toast.success('Social links saved successfully!')
          
          // Store scroll position before reload
          const scrollYBefore = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
          
          // Reload profile data to get updated social links with IDs
          // Skip loading overlay to prevent scroll jump
          const wasLoading = this.isLoading
          this.isLoading = false // Prevent overlay from showing
          try {
            const result = await apiService.getProfile()
            if (result.success) {
              const apiResponse = result.data
              const data = apiResponse.data || apiResponse
              const user = data.user || {}
              const prefs = user.preferences || {}
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
              const normalizedUser = {
                id: user.id,
                firstName: user.firstName || user.first_name || '',
                lastName: user.lastName || user.last_name || '',
                email: user.email || '',
                username: user.username || '',
                avatar: user.avatar || user.avatar_url || '',
                coverImage: user.coverImage || user.cover_image || '',
                bio: user.bio || '',
                location: user.location || '',
                joinedDate: user.joinedDate || user.created_at || '',
                verified: user.verified || false,
                preferences: normalizedPreferences,
                socialLinks: user.socialLinks || user.social_links || []
              }
              this.profileData.user = normalizedUser
            }
          } catch (error) {
            console.error('Error reloading profile:', error)
          }
          // Update originalSocialLinks in ProfileSettings to match new state
          if (settingsComponent && this.profileData.user) {
            const links = this.profileData.user.socialLinks || this.profileData.user.social_links || []
            settingsComponent.originalSocialLinks = links.map(link => ({ ...link }))
            settingsComponent.form.socialLinks = links.map(link => ({ ...link }))
          }
          
          // Restore scroll position immediately to prevent jump
          window.scrollTo(0, scrollYBefore)
          
          // Wait for DOM to fully update and then scroll to Social Links section
          await this.$nextTick()
          // Use double requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const socialLinksSection = document.getElementById('social-links-section')
              if (socialLinksSection) {
                // Calculate element position
                const rect = socialLinksSection.getBoundingClientRect()
                const elementTop = rect.top + window.scrollY || window.pageYOffset || document.documentElement.scrollTop
                const offset = 100 // Header offset
                
                // Scroll to the section smoothly
                window.scrollTo({
                  top: Math.max(0, elementTop - offset),
                  behavior: 'smooth'
                })
              }
            })
          })
        } else {
          toast.info('No changes to save')
        }
      } catch (error) {
        toast.error(`Error saving social links: ${error.message}`)
      } finally {
        // Reset saving state
        if (settingsComponent) {
          settingsComponent.isSavingSocialLinks = false
        }
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

