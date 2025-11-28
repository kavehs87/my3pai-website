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
            <div class="form-group">
              <label>Tagline <span class="label-hint">(Creator Profile)</span></label>
              <input
                v-model="form.tagline"
                type="text"
                placeholder="e.g., Mountain and lake routes specialist"
                class="form-input"
                maxlength="255"
              />
              <p class="helper-text">A short description that appears on your public profile</p>
            </div>
            <div class="form-group">
              <label>Secondary Location <span class="label-hint">(Creator Profile)</span></label>
              <input
                v-model="form.subLocation"
                type="text"
                placeholder="e.g., Lives in Bern"
                class="form-input"
                maxlength="255"
              />
              <p class="helper-text">Additional location info shown on your profile</p>
            </div>
            <button class="save-btn" @click="saveProfile">
              <i class="fas fa-save"></i>
              Save Changes
            </button>
          </div>
        </div>

        <div class="settings-section" id="preferences-section">
          <h2>Preferences & Notifications</h2>
          <div class="settings-form">
            <div class="preferences-row">
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
            
            <div class="form-group">
              <label>Notifications</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="form.notifications.email"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>Email Notifications</span>
                </label>
                <label class="checkbox-label">
                  <input
                    v-model="form.notifications.push"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>Push Notifications</span>
                </label>
                <label class="checkbox-label">
                  <input
                    v-model="form.notifications.marketing"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>Marketing Emails</span>
                </label>
              </div>
            </div>
            
            <button class="save-btn" @click="savePreferences">
              <i class="fas fa-save"></i>
              Save Preferences
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
        username: '',
        bio: '',
        location: '',
        tagline: '',
        subLocation: '',
        currency: 'USD',
        language: 'en',
        timezone: 'America/Los_Angeles',
        notifications: {
          email: true,
          push: true,
          marketing: false
        }
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
      this.form.username = user.username || ''
      this.form.bio = user.bio || ''
      this.form.location = user.location || ''
      this.form.tagline = user.tagline || ''
      this.form.subLocation = user.subLocation || user.sub_location || ''
      this.form.currency = prefs.currency || 'USD'
      this.form.language = prefs.language || 'en'
      this.form.timezone = prefs.timezone || 'America/Los_Angeles'
      this.form.notifications = {
        email: notifications.email ?? prefs.notifications_email ?? true,
        push: notifications.push ?? prefs.notifications_push ?? true,
        marketing: notifications.marketing ?? prefs.notifications_marketing ?? false
      }
    },
    saveProfile() {
      const payload = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        username: this.form.username,
        bio: this.form.bio,
        location: this.form.location,
        tagline: this.form.tagline,
        subLocation: this.form.subLocation
      }
      this.$emit('save-profile', payload)
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
    changePassword() {
      this.$emit('change-password')
    },
    deleteAccount() {
      this.$emit('delete-account')
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

.label-hint {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
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

.preferences-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.helper-text {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .preferences-row {
    grid-template-columns: 1fr;
  }
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

.save-btn {
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

.save-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 196, 200, 0.3);
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

