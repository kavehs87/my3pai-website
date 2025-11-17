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
              <label>Display Name</label>
              <input
                v-model="form.displayName"
                type="text"
                placeholder="Public name shown on your profile"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Tier</label>
              <select v-model="form.tier" class="form-input">
                <option value="">Select tier</option>
                <option v-for="tier in tierOptions" :key="tier" :value="tier">{{ tier }}</option>
              </select>
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
              <label>Specialties</label>
              <div class="tag-input">
                <input
                  v-model="specialtyInput"
                  type="text"
                  placeholder="Add specialty and press Enter"
                  class="form-input"
                  @keydown="handleSpecialtyKey"
                />
                <button type="button" class="chip-add" @click="addSpecialty">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div v-if="form.specialties.length" class="chip-list">
                <span v-for="(specialty, idx) in form.specialties" :key="`${specialty}-${idx}`" class="chip">
                  {{ specialty }}
                  <button type="button" class="chip-remove" @click="removeSpecialty(idx)">×</button>
                </span>
              </div>
              <p class="helper-text">Highlight the types of travel you specialise in (e.g. Adventure, Food Tours).</p>
            </div>
            <div class="form-group">
              <label>Countries Visited</label>
              <div class="tag-input">
                <input
                  v-model="countryInput"
                  type="text"
                  placeholder="Add ISO country code (e.g. US, FR)"
                  class="form-input"
                  @keydown="handleCountryKey"
                />
                <button type="button" class="chip-add" @click="addCountry">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div v-if="form.countriesVisited.length" class="chip-list">
                <span v-for="(country, idx) in form.countriesVisited" :key="`${country}-${idx}`" class="chip">
                  {{ country }}
                  <button type="button" class="chip-remove" @click="removeCountry(idx)">×</button>
                </span>
              </div>
              <p class="helper-text">Share where you’ve travelled. Use two-letter ISO codes (e.g. JP, TH).</p>
            </div>
            <div class="form-group">
              <label>Featured Plan ID</label>
              <input
                v-model.number="form.featuredPlanId"
                type="number"
                min="1"
                placeholder="Enter the ID of the plan to spotlight"
                class="form-input"
              />
              <p class="helper-text">Choose a plan you want highlighted on your public profile.</p>
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

        <div class="settings-section">
          <h2>Languages</h2>
          <div class="settings-form">
            <div class="language-list" v-if="form.languages.length">
              <div
                class="language-row"
                v-for="(language, index) in form.languages"
                :key="language.id || index"
              >
                <div class="form-group">
                  <label>Language</label>
                  <input
                    v-model="language.name"
                    type="text"
                    placeholder="Language"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Proficiency</label>
                  <select v-model="language.proficiency" class="form-input">
                    <option value="">Select proficiency</option>
                    <option v-for="level in proficiencyOptions" :key="level" :value="level">{{ level }}</option>
                  </select>
                </div>
                <button type="button" class="remove-btn sm" @click="removeLanguageRow(index)" title="Remove language">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="language-add">
              <div class="form-group">
                <label>Add Language</label>
                <input
                  v-model="newLanguage.name"
                  type="text"
                  placeholder="Language"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Proficiency</label>
                <select v-model="newLanguage.proficiency" class="form-input">
                  <option value="">Select proficiency</option>
                  <option v-for="level in proficiencyOptions" :key="`new-${level}`" :value="level">
                    {{ level }}
                  </option>
                </select>
              </div>
              <button type="button" class="add-btn inline" @click="addLanguageRow">
                <i class="fas fa-plus"></i>
                Add Language
              </button>
            </div>

            <button class="save-btn" @click="saveLanguages" :disabled="isSavingLanguages">
              <i class="fas fa-save"></i>
              <span v-if="isSavingLanguages">Saving...</span>
              <span v-else>Save Languages</span>
            </button>
          </div>
        </div>

        <div class="settings-section" id="social-links-section">
          <h2>Social Links</h2>
          <div class="settings-form">
            <div class="form-group" v-for="(link, index) in form.socialLinks" :key="index">
              <div class="social-link-row">
                <div class="platform-select-wrapper">
                  <label>Platform</label>
                  <select v-model="link.platform" class="form-input">
                    <option value="Website">Website</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Pinterest">Pinterest</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="url-input-wrapper">
                  <label>URL</label>
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
                      type="button"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button class="add-btn" @click="addSocialLink">
              <i class="fas fa-plus"></i>
              Add Social Link
            </button>
            <button class="save-btn" @click="saveSocialLinks" :disabled="isSavingSocialLinks">
              <i class="fas fa-save"></i>
              <span v-if="isSavingSocialLinks">Saving...</span>
              <span v-else>Save Social Links</span>
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
        displayName: '',
        tier: '',
        bio: '',
        location: '',
        specialties: [],
        countriesVisited: [],
        featuredPlanId: null,
        currency: 'USD',
        language: 'en',
        timezone: 'America/Los_Angeles',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        socialLinks: [],
        languages: []
      },
      specialtyInput: '',
      countryInput: '',
      newLanguage: { name: '', proficiency: '' },
      originalSocialLinks: [], // Store original links to compare changes
      isSavingSocialLinks: false,
      isSavingLanguages: false,
      tierOptions: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Creator'],
      proficiencyOptions: ['Native', 'Fluent', 'Intermediate', 'Basic']
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
      this.form.displayName = user.displayName || user.display_name || ''
      this.form.tier = user.tier || ''
      this.form.bio = user.bio || ''
      this.form.location = user.location || ''
      const specialties = Array.isArray(user.specialties)
        ? [...user.specialties]
        : (typeof user.specialties === 'string'
            ? user.specialties.split(',').map(s => s.trim()).filter(Boolean)
            : [])
      this.form.specialties = specialties
      const countries = Array.isArray(user.countriesVisited || user.countries_visited)
        ? (user.countriesVisited || user.countries_visited).map(code => (code || '').toUpperCase()).filter(Boolean)
        : []
      this.form.countriesVisited = countries
      this.form.featuredPlanId = user.featuredPlan?.id || user.featured_plan?.id || null
      this.form.currency = prefs.currency || 'USD'
      this.form.language = prefs.language || 'en'
      this.form.timezone = prefs.timezone || 'America/Los_Angeles'
      this.form.notifications = {
        email: notifications.email ?? prefs.notifications_email ?? true,
        push: notifications.push ?? prefs.notifications_push ?? true,
        marketing: notifications.marketing ?? prefs.notifications_marketing ?? false
      }
      // Deep copy social links to track original state
      const links = user.socialLinks ? [...user.socialLinks] : (user.social_links ? [...user.social_links] : [])
      this.form.socialLinks = links.map(link => ({ ...link }))
      this.originalSocialLinks = links.map(link => ({ ...link })) // Store deep copy of original
      const langs = Array.isArray(user.languages) ? user.languages.map(lang => ({
        id: lang.id,
        name: lang.name || '',
        proficiency: lang.proficiency || ''
      })) : []
      this.form.languages = langs.length ? langs : []
    },
    saveProfile() {
      const payload = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        username: this.form.username,
        displayName: this.form.displayName,
        tier: this.form.tier,
        bio: this.form.bio,
        location: this.form.location,
        specialties: [...this.form.specialties],
        countriesVisited: [...this.form.countriesVisited],
        featuredPlanId: this.form.featuredPlanId
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
    saveSocialLinks() {
      this.isSavingSocialLinks = true
      this.$emit('save-social-links', {
        current: this.form.socialLinks,
        original: this.originalSocialLinks
      })
    },
    addSpecialty() {
      const value = (this.specialtyInput || '').trim()
      if (!value) return
      if (!this.form.specialties.includes(value)) {
        this.form.specialties.push(value)
      }
      this.specialtyInput = ''
    },
    removeSpecialty(index) {
      this.form.specialties.splice(index, 1)
    },
    handleSpecialtyKey(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.addSpecialty()
      }
    },
    addCountry() {
      const value = (this.countryInput || '').trim().toUpperCase()
      if (!value) return
      if (!this.form.countriesVisited.includes(value)) {
        this.form.countriesVisited.push(value)
      }
      this.countryInput = ''
    },
    removeCountry(index) {
      this.form.countriesVisited.splice(index, 1)
    },
    handleCountryKey(event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.addCountry()
      }
    },
    addLanguageRow() {
      if (!this.newLanguage.name.trim()) {
        return
      }
      this.form.languages.push({
        id: Date.now(),
        name: this.newLanguage.name.trim(),
        proficiency: this.newLanguage.proficiency || ''
      })
      this.newLanguage = { name: '', proficiency: '' }
    },
    removeLanguageRow(index) {
      this.form.languages.splice(index, 1)
    },
    saveLanguages() {
      this.isSavingLanguages = true
      const payload = this.form.languages
        .filter(lang => lang.name && lang.name.trim())
        .map(({ name, proficiency }) => ({
          name: name.trim(),
          proficiency: proficiency ? proficiency.trim() : ''
        }))
      this.$emit('save-languages', payload)
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

.social-link-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--spacing-md);
  align-items: end;
}

.platform-select-wrapper,
.url-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.preferences-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.tag-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chip-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 40px;
  height: 40px;
}

.chip-add:hover {
  background: var(--secondary-light);
  color: var(--secondary-color);
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.chip-remove {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.chip-remove:hover {
  color: var(--error-color);
}

.helper-text {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.language-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr) 40px;
  gap: var(--spacing-md);
  align-items: end;
}

.language-add {
  display: grid;
  grid-template-columns: repeat(2, 1fr) auto;
  gap: var(--spacing-md);
  align-items: end;
}

.add-btn.inline {
  margin-top: 0;
  height: fit-content;
}

.remove-btn.sm {
  width: 36px;
  height: 36px;
}

@media (max-width: 768px) {
  .social-link-row {
    grid-template-columns: 1fr;
  }
  
  .preferences-row {
    grid-template-columns: 1fr;
  }

  .language-row,
  .language-add {
    grid-template-columns: 1fr;
  }
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

