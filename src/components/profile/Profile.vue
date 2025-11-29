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
      />
      
      <ProfileMaps
        :username="profileData.user.username"
        v-if="activeTab === 'maps'"
      />
      
      <ProfileCreatorSettings
        v-if="activeTab === 'creator'"
      />
      
      <ProfileBlogSettings
        v-if="activeTab === 'blog'"
      />
      
      <ProfilePodcastSettings
        v-if="activeTab === 'podcast'"
      />
      
      <ProfileMasterclassSettings
        v-if="activeTab === 'masterclass'"
      />
      
      <ProfileConsultationSettings
        v-if="activeTab === 'consultation'"
      />
      
      <ProfileSettings
        ref="profileSettings"
        v-if="activeTab === 'settings'"
        :key="profileData.user?.id || 'settings'"
        :user="profileData.user || {}"
        @save-profile="handleSaveProfile"
        @save-preferences="handleSavePreferences"
        @change-password="handleChangePassword"
        @delete-account="handleDeleteAccount"
      />
    </div>
    
    <!-- Password Change Modal -->
    <transition name="fade">
      <div v-if="passwordModal.visible" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Change Password</h3>
            <button class="close-btn" @click="closePasswordModal" aria-label="Close password modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form class="modal-body" @submit.prevent="submitPasswordChange">
            <p class="helper-text">
              Updating your password will sign you out everywhere for security.
            </p>
            <div v-if="userHasPassword" class="form-group">
              <label>Current Password</label>
              <input
                v-model="passwordModal.currentPassword"
                type="password"
                class="form-input"
                placeholder="Enter current password"
                autocomplete="current-password"
              />
            </div>
            <div class="form-group">
              <label>{{ userHasPassword ? 'New Password' : 'Create Password' }}</label>
              <input
                v-model="passwordModal.newPassword"
                type="password"
                class="form-input"
                placeholder="Enter new password"
                autocomplete="new-password"
                minlength="8"
                required
              />
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input
                v-model="passwordModal.confirmPassword"
                type="password"
                class="form-input"
                placeholder="Confirm new password"
                autocomplete="new-password"
                minlength="8"
                required
              />
            </div>
            <p v-if="passwordModal.error" class="error-text">{{ passwordModal.error }}</p>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closePasswordModal" :disabled="passwordModal.submitting">
                Cancel
              </button>
              <button type="submit" class="modal-btn primary" :disabled="passwordModal.submitting">
                <span v-if="passwordModal.submitting">
                  <i class="fas fa-spinner fa-spin"></i>
                  Updating...
                </span>
                <span v-else>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Account Deletion Modal -->
    <transition name="fade">
      <div v-if="deleteModal.visible" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Delete Account</h3>
            <button class="close-btn" @click="closeDeleteModal" aria-label="Close delete modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="helper-text warning">
              This action permanently removes your account, trips, and data. This cannot be undone.
            </p>
            <form @submit.prevent="submitAccountDeletion">
              <div v-if="userHasPassword" class="form-group">
                <label>Confirm with Password</label>
                <input
                  v-model="deleteModal.password"
                  type="password"
                  class="form-input"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
              </div>
              <div v-else class="form-group">
                <label>Reverify with Google</label>
                <p class="helper-text">
                  Because this account only uses Google sign-in, we need you to reverify your identity before deletion.
                </p>
                <button
                  type="button"
                  class="modal-btn outline"
                  @click="reauthWithGoogle"
                  :disabled="deleteModal.isReauthing"
                >
                  <span v-if="deleteModal.isReauthing">
                    <i class="fas fa-spinner fa-spin"></i>
                    Waiting for Google...
                  </span>
                  <span v-else>
                    <i class="fab fa-google"></i>
                    Reverify with Google
                  </span>
                </button>
                <p v-if="deleteModal.providerReauthToken" class="success-text">
                  Google verification successful. You can now delete your account.
                </p>
              </div>
              <p v-if="deleteModal.error" class="error-text">{{ deleteModal.error }}</p>
              <div class="modal-actions">
                <button type="button" class="modal-btn ghost" @click="closeDeleteModal" :disabled="deleteModal.submitting">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="modal-btn danger"
                  :disabled="deleteModal.submitting || (!userHasPassword && !deleteModal.providerReauthToken)"
                >
                  <span v-if="deleteModal.submitting">
                    <i class="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </span>
                  <span v-else>Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
    </template>
  </div>
</template>

<script>
import Header from '../Header.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileTabs from './components/ProfileTabs.vue'
import ProfileOverview from './components/ProfileOverview.vue'
import ProfileSettings from './components/ProfileSettings.vue'
import ProfileCreatorSettings from './components/ProfileCreatorSettings.vue'
import ProfileBlogSettings from './components/ProfileBlogSettings.vue'
import ProfilePodcastSettings from './components/ProfilePodcastSettings.vue'
import ProfileMasterclassSettings from './components/ProfileMasterclassSettings.vue'
import ProfileConsultationSettings from './components/ProfileConsultationSettings.vue'
import ProfileMaps from './components/profile-maps/ProfileMaps.vue'
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
    ProfileSettings,
    ProfileCreatorSettings,
    ProfileBlogSettings,
    ProfilePodcastSettings,
    ProfileMasterclassSettings,
    ProfileConsultationSettings,
    ProfileMaps
  },
  data() {
    return {
      activeTab: 'overview',
      profileData: {
        user: {},
        stats: {},
        maps: []
      },
      isLoading: true,
      error: null,
      tabs: [
        { id: 'overview', label: 'Overview', icon: 'fas fa-home', count: null },
        { id: 'maps', label: 'Maps', icon: 'fas fa-map-marked-alt', count: null },
        { id: 'blog', label: 'Blog', icon: 'fas fa-blog', count: null },
        { id: 'podcast', label: 'Podcast', icon: 'fas fa-podcast', count: null },
        { id: 'masterclass', label: 'Training', icon: 'fas fa-graduation-cap', count: null },
        { id: 'consultation', label: 'Consultations', icon: 'fas fa-video', count: null },
        { id: 'creator', label: 'Creator Profile', icon: 'fas fa-id-card', count: null },
        { id: 'settings', label: 'Settings', icon: 'fas fa-cog', count: null }
      ],
      passwordModal: {
        visible: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        error: '',
        submitting: false
      },
      deleteModal: {
        visible: false,
        password: '',
        providerReauthToken: '',
        error: '',
        submitting: false,
        isReauthing: false
      },
      googleScriptPromise: null
    }
  },
  computed: {
    userHasPassword() {
      const user = this.profileData.user || {}
      return Boolean(
        user.hasPassword ??
        user.has_password ??
        user.password_set ??
        user.passwordHash ??
        user.password
      )
    }
  },
  watch: {
    '$route.query.tab': {
      immediate: true,
      handler(tab) {
        if (tab && ['overview', 'maps', 'creator', 'blog', 'podcast', 'masterclass', 'consultation', 'settings'].includes(tab)) {
          this.activeTab = tab
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
    if (tab && ['overview', 'maps', 'creator', 'blog', 'podcast', 'masterclass', 'consultation', 'settings'].includes(tab)) {
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
            tagline: user.tagline || '',
            subLocation: user.subLocation || user.sub_location || '',
            joinedDate: user.joinedDate || user.created_at || user.joined_date || '',
            verified: user.verified || false,
            preferences: normalizedPreferences,
            socialLinks: user.socialLinks || user.social_links || [],
            hasPassword: Boolean(
              user.hasPassword ??
              user.has_password ??
              user.password_set ??
              user.password ??
              user.password_hash
            )
          }
          
          this.profileData = {
            user: normalizedUser,
            stats: data.stats || {},
            maps: data.maps || []
          }
          
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
    async handleSaveProfile(formData) {
      try {
        // Convert camelCase to snake_case for API
        const apiData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          tagline: formData.tagline,
          subLocation: formData.subLocation
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
          
          // Normalize user data for consistent structure
          const normalizedUser = {
            id: updatedUser.id,
            firstName: updatedUser.firstName || updatedUser.first_name || '',
            lastName: updatedUser.lastName || updatedUser.last_name || '',
            email: updatedUser.email || '',
            username: updatedUser.username || '',
            avatar: updatedUser.avatar || updatedUser.avatar_url || '',
            coverImage: updatedUser.coverImage || updatedUser.cover_image || '',
            bio: updatedUser.bio || '',
            location: updatedUser.location || '',
            tagline: updatedUser.tagline || '',
            subLocation: updatedUser.subLocation || updatedUser.sub_location || '',
            joinedDate: updatedUser.joinedDate || updatedUser.created_at || updatedUser.joined_date || '',
            verified: updatedUser.verified || false,
            preferences: normalizedPreferences,
            hasPassword: Boolean(
              updatedUser.hasPassword ??
              updatedUser.has_password ??
              updatedUser.password_set ??
              updatedUser.password ??
              updatedUser.password_hash
            )
          }
          
          // Update user object with normalized data - use Object.assign to ensure reactivity
          Object.assign(this.profileData.user, normalizedUser)
          
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
    handleChangePassword() {
      this.resetPasswordModal()
      this.passwordModal.visible = true
    },
    handleDeleteAccount() {
      this.resetDeleteModal()
      this.deleteModal.visible = true
    },
    resetPasswordModal() {
      this.passwordModal = {
        visible: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        error: '',
        submitting: false
      }
    },
    closePasswordModal() {
      this.passwordModal.visible = false
    },
    async submitPasswordChange() {
      this.passwordModal.error = ''
      if (!this.passwordModal.newPassword || !this.passwordModal.confirmPassword) {
        this.passwordModal.error = 'Please enter and confirm your new password.'
        return
      }
      if (this.passwordModal.newPassword.length < 8) {
        this.passwordModal.error = 'Password must be at least 8 characters long.'
        return
      }
      if (this.passwordModal.newPassword !== this.passwordModal.confirmPassword) {
        this.passwordModal.error = 'New passwords do not match.'
        return
      }
      if (this.userHasPassword && !this.passwordModal.currentPassword) {
        this.passwordModal.error = 'Please provide your current password.'
        return
      }
      this.passwordModal.submitting = true
      try {
        const payload = {
          newPassword: this.passwordModal.newPassword,
          newPassword_confirmation: this.passwordModal.confirmPassword
        }
        if (this.userHasPassword) {
          payload.currentPassword = this.passwordModal.currentPassword
        }
        const result = await apiService.changePassword(payload)
        if (!result.success) {
          throw new Error(result.error || 'Unable to change password.')
        }
        toast.success('Password updated. Please sign in again.')
        this.closePasswordModal()
        await this.forceLogoutAfterSensitiveChange('/?password-updated=1')
      } catch (error) {
        this.passwordModal.error = error.message || 'Unexpected error changing password.'
      } finally {
        this.passwordModal.submitting = false
      }
    },
    resetDeleteModal() {
      this.deleteModal = {
        visible: false,
        password: '',
        providerReauthToken: '',
        error: '',
        submitting: false,
        isReauthing: false
      }
    },
    closeDeleteModal() {
      this.deleteModal.visible = false
    },
    async submitAccountDeletion() {
      this.deleteModal.error = ''
      if (this.userHasPassword) {
        if (!this.deleteModal.password) {
          this.deleteModal.error = 'Please confirm with your password.'
          return
        }
      } else if (!this.deleteModal.providerReauthToken) {
        this.deleteModal.error = 'Please reverify with Google first.'
        return
      }
      this.deleteModal.submitting = true
      try {
        const payload = this.userHasPassword
          ? { password: this.deleteModal.password }
          : { providerReauthToken: this.deleteModal.providerReauthToken }
        const result = await apiService.deleteAccount(payload)
        if (!result.success) {
          throw new Error(result.error || 'Unable to delete account.')
        }
        toast.success('Account deleted. We hope to see you again.')
        this.closeDeleteModal()
        await this.forceLogoutAfterSensitiveChange('/?account-deleted=1')
      } catch (error) {
        this.deleteModal.error = error.message || 'Unexpected error deleting account.'
      } finally {
        this.deleteModal.submitting = false
      }
    },
    async reauthWithGoogle() {
      this.deleteModal.error = ''
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        this.deleteModal.error = 'Google reauthentication is not configured.'
        return
      }
      try {
        await this.ensureGoogleClient()
      } catch (error) {
        this.deleteModal.error = error.message || 'Unable to load Google services.'
        return
      }
      this.deleteModal.isReauthing = true
      const client = window.google.accounts.id
      client.initialize({
        client_id: clientId,
        callback: (response) => {
          this.deleteModal.isReauthing = false
          if (response?.credential) {
            this.deleteModal.providerReauthToken = response.credential
            toast.success('Google verification successful.')
            this.deleteModal.error = ''
          } else if (!this.deleteModal.providerReauthToken) {
            this.deleteModal.error = 'Google reauthentication failed. Please try again.'
          }
        },
        context: 'signin'
      })
      client.prompt((notification) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          this.deleteModal.isReauthing = false
          if (!this.deleteModal.providerReauthToken) {
            this.deleteModal.error = 'Google prompt was dismissed. Please try again.'
          }
        }
      })
    },
    ensureGoogleClient() {
      if (window.google?.accounts?.id) {
        return Promise.resolve()
      }
      if (this.googleScriptPromise) {
        return this.googleScriptPromise
      }
      this.googleScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          this.googleScriptPromise = null
          resolve()
        }
        script.onerror = () => {
          this.googleScriptPromise = null
          reject(new Error('Failed to load Google Identity Services.'))
        }
        document.head.appendChild(script)
      })
      return this.googleScriptPromise
    },
    async forceLogoutAfterSensitiveChange(redirect = '/?reauth=1') {
      try {
        await apiService.logout()
      } catch (error) {
        console.warn('Logout after sensitive action failed:', error)
      } finally {
        window.location.href = redirect
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: var(--spacing-md);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: min(420px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  transition: background var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.modal-body form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px var(--secondary-light);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.modal-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: filter var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.modal-btn.ghost {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
}

.modal-btn.primary {
  background: var(--secondary-color);
  color: #fff;
}

.modal-btn.danger {
  background: var(--error-color);
  color: #fff;
}

.modal-btn.outline {
  border: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-primary);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.helper-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.helper-text.warning {
  color: var(--error-color);
  font-weight: 600;
}

.error-text {
  color: var(--error-color);
  font-size: var(--font-size-sm);
  margin: 0;
}

.success-text {
  color: var(--success-color, #16a34a);
  font-size: var(--font-size-sm);
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

