// API Configuration
const DEFAULT_API_BASE_URL = 'https://api.my3pai.com/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')
const XSRF_COOKIE_NAME = 'XSRF-TOKEN'
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN'

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

    const xsrfToken = this.getXsrfToken()
    if (xsrfToken) {
      config.headers[XSRF_HEADER_NAME] = xsrfToken
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

  getXsrfToken() {
    const raw = this.getCookie(XSRF_COOKIE_NAME)
    return raw ? decodeURIComponent(raw) : null
  }

  getCookie(name) {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? match[1] : null
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
    const xsrfToken = this.getXsrfToken()
    if (xsrfToken) {
      headers[XSRF_HEADER_NAME] = xsrfToken
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
    const xsrfToken = this.getXsrfToken()
    if (xsrfToken) {
      headers[XSRF_HEADER_NAME] = xsrfToken
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

  // Trips CRUD
  // Itineraries & POIs
  async createItinerary(itineraryData) {
    return this.request('/itineraries', {
      method: 'POST',
      body: itineraryData
    })
  }

  async updateItinerary(itineraryId, itineraryData) {
    return this.request(`/itineraries/${itineraryId}`, {
      method: 'PUT',
      body: itineraryData
    })
  }

  async uploadItineraryThumbnail(itineraryId, file) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    return this.request(`/itineraries/${itineraryId}/thumbnail`, {
      method: 'POST',
      body: formData
    })
  }

  async savePoi(itineraryId, poiData) {
    return this.request(`/itineraries/${itineraryId}/pois`, {
      method: 'POST',
      body: poiData
    })
  }

  async uploadPoiMedia(poiId, files = []) {
    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))
    return this.request(`/pois/${poiId}/media`, {
      method: 'POST',
      body: formData
    })
  }

  async deletePoi(poiId) {
    return this.request(`/pois/${poiId}`, {
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
