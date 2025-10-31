// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
  }

  // Set authentication token
  setToken(token) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  // Remove authentication token
  removeToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  // Get headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options
    }

    // Handle body - if it's an object and not already a string, stringify it
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
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
        throw new Error(errorMessage)
      }

      return { success: true, data }
    } catch (error) {
      console.error('API Request failed:', error)
      return { success: false, error: error.message }
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
    const result = await this.request('/logout', { method: 'GET' })
    if (result.success) {
      this.removeToken()
    }
    return result
  }

  // Register with email/password
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // Login with email/password
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  // Handle OAuth callback (if needed for frontend)
  async handleOAuthCallback(code, state) {
    // This might be handled by your Laravel backend automatically
    // But if you need to process it on frontend:
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state })
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
      body: JSON.stringify(profileData)
    })
  }

  // Upload avatar
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const url = `${this.baseURL}/profile/avatar`
    const headers = { 'Accept': 'application/json' }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
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
    const headers = { 'Accept': 'application/json' }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
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
      body: JSON.stringify(preferences)
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

  async createTrip(tripData) {
    return this.request('/profile/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    })
  }

  async updateTrip(id, tripData) {
    return this.request(`/profile/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData)
    })
  }

  async uploadTripThumbnail(id, file) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    const url = `${this.baseURL}/profile/trips/${id}/thumbnail`
    const headers = { 'Accept': 'application/json' }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
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

  async deleteTrip(id) {
    return this.request(`/profile/trips/${id}`, {
      method: 'DELETE'
    })
  }

  // Change password
  async changePassword(passwordData) {
    return this.request('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    })
  }

  // Delete account
  async deleteAccount(password) {
    return this.request('/profile/account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    })
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the class and instance
export { ApiService }
export default apiService
