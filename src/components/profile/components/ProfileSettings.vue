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

        <!-- Stripe Connect Section -->
        <div class="settings-section stripe-section">
          <h2><i class="fab fa-stripe"></i> Payments & Payouts</h2>
          <p class="section-description">
            Connect your Stripe account to receive payments for premium content, maps, and more.
          </p>
          
          <!-- Loading State -->
          <div v-if="stripe.loading" class="stripe-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading payment settings...</span>
          </div>
          
          <!-- Not Connected State -->
          <div v-else-if="!stripe.connected" class="stripe-not-connected">
            <div class="stripe-card">
              <div class="stripe-card-icon">
                <i class="fas fa-credit-card"></i>
              </div>
              <div class="stripe-card-content">
                <h3>Connect Your Stripe Account</h3>
                <p>Set up payments to start earning from your content. Stripe handles all payment processing securely.</p>
                <ul class="stripe-benefits">
                  <li><i class="fas fa-check"></i> Sell premium blog posts & podcasts</li>
                  <li><i class="fas fa-check"></i> Receive direct payouts to your bank</li>
                  <li><i class="fas fa-check"></i> Track earnings in real-time</li>
                </ul>
              </div>
            </div>
            <button 
              class="stripe-connect-btn" 
              @click="startStripeOnboarding"
              :disabled="stripe.onboarding"
            >
              <i :class="stripe.onboarding ? 'fas fa-spinner fa-spin' : 'fab fa-stripe'"></i>
              {{ stripe.onboarding ? 'Redirecting...' : 'Connect with Stripe' }}
            </button>
          </div>
          
          <!-- Connected State -->
          <div v-else class="stripe-connected">
            <div class="stripe-status-card" :class="stripe.status">
              <div class="status-header">
                <div class="status-badge" :class="stripe.status">
                  <i :class="stripeStatusIcon"></i>
                  <span>{{ stripeStatusLabel }}</span>
                </div>
                <span v-if="stripe.accountId" class="account-id">{{ stripe.accountId }}</span>
              </div>
              
              <!-- Status Details -->
              <div class="status-details">
                <div class="status-item">
                  <span class="status-label">Charges</span>
                  <span class="status-value" :class="{ enabled: stripe.chargesEnabled }">
                    <i :class="stripe.chargesEnabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ stripe.chargesEnabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">Payouts</span>
                  <span class="status-value" :class="{ enabled: stripe.payoutsEnabled }">
                    <i :class="stripe.payoutsEnabled ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ stripe.payoutsEnabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
              </div>
              
              <!-- Action Required Alert -->
              <div v-if="stripe.requiresAction" class="action-required-alert">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="alert-content">
                  <strong>Action Required</strong>
                  <p>Please complete your Stripe account setup to enable payments.</p>
                </div>
                <button class="alert-btn" @click="startStripeOnboarding" :disabled="stripe.onboarding">
                  {{ stripe.onboarding ? 'Redirecting...' : 'Complete Setup' }}
                </button>
              </div>
              
              <!-- Requirements List -->
              <div v-if="stripe.requirements?.currentlyDue?.length" class="requirements-list">
                <h4>Items needed:</h4>
                <ul>
                  <li v-for="req in stripe.requirements.currentlyDue" :key="req">
                    {{ formatRequirement(req) }}
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="stripe-actions">
              <button 
                class="stripe-dashboard-btn" 
                @click="openStripeDashboard"
                :disabled="stripe.dashboardLoading"
              >
                <i :class="stripe.dashboardLoading ? 'fas fa-spinner fa-spin' : 'fas fa-external-link-alt'"></i>
                {{ stripe.dashboardLoading ? 'Opening...' : 'Open Stripe Dashboard' }}
              </button>
              <button 
                class="stripe-refresh-btn" 
                @click="loadStripeStatus"
                :disabled="stripe.loading"
              >
                <i class="fas fa-sync-alt"></i>
                Refresh Status
              </button>
              <button 
                class="stripe-disconnect-btn" 
                @click="confirmDisconnectStripe"
                :disabled="stripe.disconnecting"
              >
                <i :class="stripe.disconnecting ? 'fas fa-spinner fa-spin' : 'fas fa-unlink'"></i>
                {{ stripe.disconnecting ? 'Disconnecting...' : 'Disconnect' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Disconnect Stripe Confirmation Modal -->
        <transition name="fade">
          <div v-if="stripe.showDisconnectModal" class="modal-overlay" @click.self="stripe.showDisconnectModal = false">
            <div class="modal-card disconnect-modal">
              <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Disconnect Stripe Account</h3>
                <button class="close-btn" @click="stripe.showDisconnectModal = false">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="modal-body">
                <p class="warning-text">
                  Are you sure you want to disconnect your Stripe account? This will:
                </p>
                <ul class="warning-list">
                  <li>Stop accepting new payments for your content</li>
                  <li>Disable premium content sales</li>
                  <li>Pending payouts will still be processed</li>
                </ul>
                <p class="warning-text">
                  You can reconnect at any time to resume accepting payments.
                </p>
              </div>
              <div class="modal-footer">
                <button class="btn-cancel" @click="stripe.showDisconnectModal = false">Cancel</button>
                <button class="btn-disconnect" @click="disconnectStripe" :disabled="stripe.disconnecting">
                  <i :class="stripe.disconnecting ? 'fas fa-spinner fa-spin' : 'fas fa-unlink'"></i>
                  {{ stripe.disconnecting ? 'Disconnecting...' : 'Yes, Disconnect' }}
                </button>
              </div>
            </div>
          </div>
        </transition>

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
import api from '@/services/api'
import toast from '@/utils/toast'

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
      },
      stripe: {
        loading: true,
        connected: false,
        accountId: null,
        status: null, // pending, active, restricted, disabled
        chargesEnabled: false,
        payoutsEnabled: false,
        requiresAction: false,
        requirements: null,
        onboarding: false,
        dashboardLoading: false,
        disconnecting: false,
        showDisconnectModal: false
      }
    }
  },
  computed: {
    stripeStatusIcon() {
      switch (this.stripe.status) {
        case 'active':
          return 'fas fa-check-circle'
        case 'pending':
          return 'fas fa-clock'
        case 'restricted':
          return 'fas fa-exclamation-circle'
        case 'disabled':
          return 'fas fa-ban'
        default:
          return 'fas fa-question-circle'
      }
    },
    stripeStatusLabel() {
      switch (this.stripe.status) {
        case 'active':
          return 'Active'
        case 'pending':
          return 'Pending Setup'
        case 'restricted':
          return 'Restricted'
        case 'disabled':
          return 'Disabled'
        default:
          return 'Unknown'
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
  mounted() {
    this.loadStripeStatus()
    this.handleStripeCallback()
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
    },
    
    // Stripe Connect Methods
    handleStripeCallback() {
      const urlParams = new URLSearchParams(window.location.search)
      const stripeStatus = urlParams.get('stripe')
      
      if (stripeStatus === 'success') {
        toast.success('Stripe account setup in progress! We\'re verifying your details.')
        // Clean up the URL
        this.cleanStripeParams()
      } else if (stripeStatus === 'refresh') {
        toast.info('Your Stripe session expired. Please try connecting again.')
        this.cleanStripeParams()
      }
    },
    
    cleanStripeParams() {
      // Remove stripe param from URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('stripe')
      window.history.replaceState({}, '', url.toString())
    },
    
    async loadStripeStatus() {
      this.stripe.loading = true
      try {
        const result = await api.getStripeConnectStatus()
        if (result.success) {
          const data = result.data?.data || result.data || {}
          this.stripe.connected = data.connected || false
          this.stripe.accountId = data.accountId || null
          this.stripe.status = data.status || null
          this.stripe.chargesEnabled = data.chargesEnabled || false
          this.stripe.payoutsEnabled = data.payoutsEnabled || false
          this.stripe.requiresAction = data.requiresAction || false
          this.stripe.requirements = data.requirements || null
        }
      } catch (err) {
        console.error('Failed to load Stripe status:', err)
      } finally {
        this.stripe.loading = false
      }
    },
    
    async startStripeOnboarding() {
      this.stripe.onboarding = true
      try {
        const returnUrl = `${window.location.origin}/profile?tab=settings&stripe=success`
        const refreshUrl = `${window.location.origin}/profile?tab=settings&stripe=refresh`
        
        const result = await api.stripeConnectOnboard(returnUrl, refreshUrl)
        if (result.success && result.data?.data?.onboardingUrl) {
          // Redirect to Stripe onboarding
          window.location.href = result.data.data.onboardingUrl
        } else if (result.success && result.data?.onboardingUrl) {
          window.location.href = result.data.onboardingUrl
        } else {
          toast.error(result.error || 'Failed to start Stripe onboarding')
          this.stripe.onboarding = false
        }
      } catch (err) {
        toast.error('Failed to connect with Stripe')
        this.stripe.onboarding = false
      }
    },
    
    async openStripeDashboard() {
      this.stripe.dashboardLoading = true
      try {
        const result = await api.getStripeConnectDashboard()
        if (result.success) {
          const url = result.data?.data?.dashboardUrl || result.data?.dashboardUrl
          if (url) {
            window.open(url, '_blank')
          } else {
            toast.error('Could not get dashboard URL')
          }
        } else {
          toast.error(result.error || 'Failed to open Stripe dashboard')
        }
      } catch (err) {
        toast.error('Failed to open Stripe dashboard')
      } finally {
        this.stripe.dashboardLoading = false
      }
    },
    
    confirmDisconnectStripe() {
      this.stripe.showDisconnectModal = true
    },
    
    async disconnectStripe() {
      this.stripe.disconnecting = true
      try {
        const result = await api.disconnectStripe()
        if (result.success) {
          toast.success('Stripe account disconnected')
          this.stripe.showDisconnectModal = false
          // Reset stripe state
          this.stripe.connected = false
          this.stripe.accountId = null
          this.stripe.status = null
          this.stripe.chargesEnabled = false
          this.stripe.payoutsEnabled = false
          this.stripe.requiresAction = false
          this.stripe.requirements = null
        } else {
          toast.error(result.error || 'Failed to disconnect Stripe account')
        }
      } catch (err) {
        toast.error('Failed to disconnect Stripe account')
      } finally {
        this.stripe.disconnecting = false
      }
    },
    
    formatRequirement(req) {
      // Convert snake_case requirement names to readable format
      const mappings = {
        'individual.verification.document': 'Identity document',
        'individual.verification.additional_document': 'Additional identity document',
        'business_profile.url': 'Business website URL',
        'business_profile.mcc': 'Business category',
        'external_account': 'Bank account for payouts',
        'tos_acceptance.date': 'Terms of Service acceptance',
        'tos_acceptance.ip': 'Terms of Service acceptance',
        'individual.dob.day': 'Date of birth',
        'individual.dob.month': 'Date of birth',
        'individual.dob.year': 'Date of birth',
        'individual.address.city': 'Address',
        'individual.address.line1': 'Address',
        'individual.address.postal_code': 'Postal code',
        'individual.address.state': 'State/Province',
        'individual.email': 'Email address',
        'individual.first_name': 'First name',
        'individual.last_name': 'Last name',
        'individual.phone': 'Phone number',
        'individual.ssn_last_4': 'Last 4 digits of SSN',
        'individual.id_number': 'ID number'
      }
      return mappings[req] || req.replace(/_/g, ' ').replace(/\./g, ' - ')
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

/* Stripe Connect Section Styles */
.stripe-section h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stripe-section h2 i {
  color: #635bff;
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.stripe-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.stripe-loading i {
  font-size: var(--font-size-lg);
  color: #635bff;
}

/* Not Connected State */
.stripe-not-connected {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.stripe-card {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f1ff 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(99, 91, 255, 0.1);
}

.stripe-card-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #635bff 0%, #8b83ff 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stripe-card-icon i {
  font-size: 28px;
  color: white;
}

.stripe-card-content h3 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.stripe-card-content p {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.stripe-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stripe-benefits li {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.stripe-benefits li i {
  color: #22c55e;
  font-size: var(--font-size-sm);
}

.stripe-connect-btn {
  background: linear-gradient(135deg, #635bff 0%, #8b83ff 100%);
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-normal);
  width: fit-content;
}

.stripe-connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 91, 255, 0.35);
}

.stripe-connect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Connected State */
.stripe-connected {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.stripe-status-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
}

.stripe-status-card.active {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.stripe-status-card.pending {
  border-color: rgba(234, 179, 8, 0.3);
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
}

.stripe-status-card.restricted {
  border-color: rgba(249, 115, 22, 0.3);
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.stripe-status-card.disabled {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.status-badge.active {
  background: #22c55e;
  color: white;
}

.status-badge.pending {
  background: #eab308;
  color: #422006;
}

.status-badge.restricted {
  background: #f97316;
  color: white;
}

.status-badge.disabled {
  background: #ef4444;
  color: white;
}

.account-id {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.status-details {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: #ef4444;
}

.status-value.enabled {
  color: #22c55e;
}

.status-value i {
  font-size: var(--font-size-sm);
}

/* Action Required Alert */
.action-required-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: #fef3c7;
  border-radius: var(--radius-md);
  border: 1px solid #f59e0b;
  margin-top: var(--spacing-md);
}

.action-required-alert > i {
  color: #f59e0b;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  color: #92400e;
  font-size: var(--font-size-sm);
}

.alert-content p {
  margin: 0;
  color: #a16207;
  font-size: var(--font-size-xs);
}

.alert-btn {
  background: #f59e0b;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
  transition: all var(--transition-normal);
}

.alert-btn:hover:not(:disabled) {
  background: #d97706;
}

.alert-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Requirements List */
.requirements-list {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
}

.requirements-list h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.requirements-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.requirements-list li::before {
  content: "•";
  color: #f59e0b;
}

/* Stripe Actions */
.stripe-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.stripe-dashboard-btn {
  background: #635bff;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.stripe-dashboard-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.stripe-dashboard-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.stripe-refresh-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.stripe-refresh-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
}

.stripe-refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.stripe-disconnect-btn {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  margin-left: auto;
}

.stripe-disconnect-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.stripe-disconnect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.disconnect-modal .modal-header h3 {
  color: #ef4444;
}

.disconnect-modal .modal-header h3 i {
  color: #ef4444;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.warning-text {
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md) 0;
  background: #fef2f2;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.warning-list li {
  padding: var(--spacing-xs) 0;
  color: #991b1b;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.warning-list li::before {
  content: "•";
  color: #ef4444;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.btn-cancel:hover {
  background: var(--bg-primary);
  border-color: var(--border-medium);
}

.btn-disconnect {
  background: #ef4444;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.btn-disconnect:hover:not(:disabled) {
  background: #dc2626;
}

.btn-disconnect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .settings-section {
    padding: var(--spacing-md);
  }

  .stripe-card {
    flex-direction: column;
    text-align: center;
  }

  .stripe-card-icon {
    margin: 0 auto;
  }

  .stripe-benefits {
    align-items: center;
  }

  .status-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .status-details {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .stripe-actions {
    flex-direction: column;
  }

  .stripe-disconnect-btn {
    margin-left: 0;
  }
}
</style>


