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
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
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

  // Handle OAuth callback (if needed for frontend)
  async handleOAuthCallback(code, state) {
    // This might be handled by your Laravel backend automatically
    // But if you need to process it on frontend:
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state })
    })
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the class and instance
export { ApiService }
export default apiService
