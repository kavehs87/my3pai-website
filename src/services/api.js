// API Configuration
const DEFAULT_API_BASE_URL = 'https://api.my3pai.com/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.apiOrigin = this.getApiOrigin(this.baseURL)
    this.csrfInitialized = false
    this.csrfPromise = null
  }

  getApiOrigin(url) {
    try {
      const parsed = new URL(url)
      return parsed.origin
    } catch (error) {
      console.warn('Unable to derive API origin from base URL. Falling back to window origin.', error)
      return window.location.origin
    }
  }

  getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  }

  async ensureCsrf() {
    if (this.csrfInitialized) return
    if (this.csrfPromise) {
      await this.csrfPromise
      return
    }

    const csrfUrl = `${this.apiOrigin}/sanctum/csrf-cookie`
    this.csrfPromise = fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to initialize CSRF protection (${response.status})`)
        }
        this.csrfInitialized = true
      })
      .catch((error) => {
        console.error('CSRF cookie initialization failed:', error)
        throw error
      })
      .finally(() => {
        this.csrfPromise = null
      })

    await this.csrfPromise
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`
    const requiresCsrf = options.requireCsrf !== false

    if (requiresCsrf) {
      await this.ensureCsrf()
    }

    const config = {
      method: options.method || 'GET',
      credentials: 'include',
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    }

    if (options.body !== undefined) {
      config.body = options.body
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
    }

    if (config.body instanceof FormData && config.headers['Content-Type']) {
      delete config.headers['Content-Type']
    }

    try {
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      if (!response.headers.get('content-type')?.includes('application/json')) {
        if (response.ok) {
          return { success: true, data: await response.text() }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()

      if (!response.ok) {
        // Extract validation errors from Laravel response
        let errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`
        if (data.errors && typeof data.errors === 'object') {
          const validationErrors = Object.values(data.errors).flat()
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(', ')
          }
        }
        const error = new Error(errorMessage)
        error.status = response.status
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('API Request failed:', error)
      return { success: false, error: error.message, status: error.status || null }
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }

  // Google OAuth - redirect to Google
  getGoogleAuthUrl() {
    return `${this.baseURL}/auth/google`
  }

  // Get current user
  async getCurrentUser() {
    return this.request('/me')
  }

  // Logout
  async logout() {
    return this.request('/logout', { method: 'POST' })
  }

  // Register with email/password
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: userData
    })
  }

  // Login with email/password
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: credentials
    })
  }

  // Handle OAuth callback (if needed for frontend)
  async handleOAuthCallback(code, state) {
    // This might be handled by your Laravel backend automatically
    // But if you need to process it on frontend:
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: { code, state }
    })
  }

  // Profile API Methods
  
  // Get user profile with stats
  async getProfile() {
    return this.request('/profile')
  }

  // Update user profile
  async updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: profileData
    })
  }

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const url = `${this.baseURL}/profile/avatar`
    const headers = { 
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }

    try {
      await this.ensureCsrf()
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('Avatar upload failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Upload cover image
  async uploadCover(file) {
    const formData = new FormData()
    formData.append('cover', file)
    
    const url = `${this.baseURL}/profile/cover`
    const headers = { 
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }

    try {
      await this.ensureCsrf()
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('Cover upload failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Get preferences
  async getPreferences() {
    return this.request('/profile/preferences')
  }

  // Update preferences
  async updatePreferences(preferences) {
    return this.request('/profile/preferences', {
      method: 'PUT',
      body: preferences
    })
  }

  async updateLanguages(languages) {
    return this.request('/profile/languages', {
      method: 'PUT',
      body: { languages }
    })
  }

  // Social Links CRUD
  async getSocialLinks() {
    return this.request('/profile/social-links')
  }

  async createSocialLink(linkData) {
    return this.request('/profile/social-links', {
      method: 'POST',
      body: linkData
    })
  }

  async updateSocialLink(id, linkData) {
    return this.request(`/profile/social-links/${id}`, {
      method: 'PUT',
      body: linkData
    })
  }

  async deleteSocialLink(id) {
    return this.request(`/profile/social-links/${id}`, {
      method: 'DELETE'
    })
  }

  // Trips CRUD
  async getTrip(id) {
    return this.request(`/profile/trips/${id}`)
  }
  async getTrips(status = null) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/profile/trips${query}`)
  }

  async getCreators(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page)
    if (params.perPage) searchParams.append('perPage', params.perPage)
    if (params.tier) searchParams.append('tier', params.tier)
    if (params.specialty) searchParams.append('specialty', params.specialty)
    if (params.search) searchParams.append('search', params.search)
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request(`/creators${queryString}`)
  }

  async getCreator(id) {
    return this.request(`/creators/${id}`)
  }

  async getDiscoverTrips(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append('page', params.page)
    if (params.perPage) searchParams.append('perPage', params.perPage)
    if (params.status) searchParams.append('status', params.status)
    if (params.destination) searchParams.append('destination', params.destination)
    if (params.owner) searchParams.append('owner', params.owner)
    if (params?.dateRange?.start) searchParams.append('dateRange[start]', params.dateRange.start)
    if (params?.dateRange?.end) searchParams.append('dateRange[end]', params.dateRange.end)
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request(`/trips${queryString}`)
  }

  async createTrip(tripData) {
    return this.request('/profile/trips', {
      method: 'POST',
      body: tripData
    })
  }

  async updateTrip(id, tripData) {
    return this.request(`/profile/trips/${id}`, {
      method: 'PUT',
      body: tripData
    })
  }

  async uploadTripThumbnail(id, file) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    const url = `${this.baseURL}/profile/trips/${id}/thumbnail`
    const headers = { 
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
    try {
      await this.ensureCsrf()
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`)
      }
      return { success: true, data }
    } catch (e) {
      console.error('Upload trip thumbnail failed:', e)
      return { success: false, error: e.message }
    }
  }

  async uploadTripShortThumbnail(id, file) {
    const formData = new FormData()
    formData.append('shortThumbnail', file)
    const url = `${this.baseURL}/profile/trips/${id}/short-thumbnail`
    const headers = { 
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
    try {
      await this.ensureCsrf()
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`)
      }
      return { success: true, data }
    } catch (e) {
      console.error('Upload trip short thumbnail failed:', e)
      return { success: false, error: e.message }
    }
  }

  async deleteTrip(id) {
    return this.request(`/profile/trips/${id}`, {
      method: 'DELETE'
    })
  }

  // Change password
  async changePassword(passwordData) {
    return this.request('/profile/change-password', {
      method: 'POST',
      body: passwordData
    })
  }

  // Delete account
  async deleteAccount(payload) {
    const body = typeof payload === 'object' ? payload : { password: payload }
    return this.request('/profile/account', {
      method: 'DELETE',
      body
    })
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the class and instance
export { ApiService }
export default apiService
