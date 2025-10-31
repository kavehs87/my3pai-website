<template>
  <div class="profile-settings">
    <div class="container">
      <div class="settings-content">
        <div class="settings-section">
          <h2>Account Information</h2>
          <div class="settings-form">
            <div class="form-group">
              <label>First Name</label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="First name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Last name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="Email address"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Username</label>
              <input
                v-model="form.username"
                type="text"
                placeholder="Username"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea
                v-model="form.bio"
                placeholder="Tell us about yourself..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="City, Country"
                class="form-input"
              />
            </div>
            <button class="save-btn" @click="saveProfile">
              <i class="fas fa-save"></i>
              Save Changes
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h2>Preferences</h2>
          <div class="settings-form">
            <div class="form-group">
              <label>Currency</label>
              <select v-model="form.currency" class="form-input">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Language</label>
              <select v-model="form.language" class="form-input">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div class="form-group">
              <label>Timezone</label>
              <select v-model="form.timezone" class="form-input">
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h2>Notifications</h2>
          <div class="settings-form">
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.notifications.email"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Email Notifications</span>
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.notifications.push"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Push Notifications</span>
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.notifications.marketing"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Marketing Emails</span>
              </label>
            </div>
            <button class="save-btn" @click="savePreferences">
              <i class="fas fa-save"></i>
              Save Preferences
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h2>Social Links</h2>
          <div class="settings-form">
            <div class="form-group" v-for="(link, index) in form.socialLinks" :key="index">
              <label>{{ link.platform }}</label>
              <div class="input-with-action">
                <input
                  v-model="link.url"
                  type="url"
                  :placeholder="`${link.platform} URL`"
                  class="form-input"
                />
                <button
                  v-if="form.socialLinks.length > 0"
                  class="remove-btn"
                  @click="removeSocialLink(index)"
                  title="Remove"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button class="add-btn" @click="addSocialLink">
              <i class="fas fa-plus"></i>
              Add Social Link
            </button>
          </div>
        </div>

        <div class="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <div class="danger-actions">
            <button class="danger-btn" @click="changePassword">
              <i class="fas fa-key"></i>
              Change Password
            </button>
            <button class="danger-btn delete" @click="deleteAccount">
              <i class="fas fa-trash"></i>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileSettings',
  props: {
    user: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        bio: '',
        location: '',
        currency: 'USD',
        language: 'en',
        timezone: 'America/Los_Angeles',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        socialLinks: []
      }
    }
  },
  watch: {
    user: {
      immediate: true,
      deep: true,
      handler(newUser) {
        if (newUser && newUser.id) {
          this.initializeForm()
        }
      }
    }
  },
  methods: {
    initializeForm() {
      const user = this.user
      if (!user || !user.id) {
        return
      }
      
      // Extract preferences - handle both nested and flat structures
      const prefs = user.preferences || {}
      const notifications = prefs.notifications || {}
      
      // Update form fields directly to ensure Vue reactivity
      this.form.firstName = user.firstName || user.first_name || ''
      this.form.lastName = user.lastName || user.last_name || ''
      this.form.email = user.email || ''
      this.form.username = user.username || ''
      this.form.bio = user.bio || ''
      this.form.location = user.location || ''
      this.form.currency = prefs.currency || 'USD'
      this.form.language = prefs.language || 'en'
      this.form.timezone = prefs.timezone || 'America/Los_Angeles'
      this.form.notifications = {
        email: notifications.email ?? prefs.notifications_email ?? true,
        push: notifications.push ?? prefs.notifications_push ?? true,
        marketing: notifications.marketing ?? prefs.notifications_marketing ?? false
      }
      this.form.socialLinks = user.socialLinks ? [...user.socialLinks] : (user.social_links ? [...user.social_links] : [])
    },
    saveProfile() {
      this.$emit('save-profile', this.form)
    },
    savePreferences() {
      this.$emit('save-preferences', {
        currency: this.form.currency,
        language: this.form.language,
        timezone: this.form.timezone,
        notifications: this.form.notifications
      })
      console.log('Saving preferences:', this.form)
    },
    addSocialLink() {
      this.form.socialLinks.push({
        platform: 'Website',
        url: '',
        public: true
      })
    },
    removeSocialLink(index) {
      this.form.socialLinks.splice(index, 1)
    },
    changePassword() {
      this.$emit('change-password')
    },
    deleteAccount() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        this.$emit('delete-account')
      }
    }
  }
}
</script>

<style scoped>
.profile-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.settings-section h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: all var(--transition-normal);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px var(--secondary-light);
}

.form-textarea {
  resize: vertical;
}

.input-with-action {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.input-with-action .form-input {
  flex: 1;
}

.remove-btn {
  background: var(--error-color);
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.checkbox-group {
  margin-bottom: var(--spacing-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.save-btn,
.add-btn {
  background: var(--secondary-color);
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  width: fit-content;
  margin-top: var(--spacing-md);
}

.save-btn:hover,
.add-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 196, 200, 0.3);
}

.add-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
}

.add-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.danger-zone {
  border: 2px solid var(--error-color);
}

.danger-zone h2 {
  color: var(--error-color);
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.danger-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.danger-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.danger-btn.delete {
  border-color: var(--error-color);
  color: var(--error-color);
}

.danger-btn.delete:hover {
  background: var(--error-color);
  color: white;
}

@media (max-width: 768px) {
  .settings-section {
    padding: var(--spacing-md);
  }
}
</style>

