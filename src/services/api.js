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
        // Check for error, message, or errors fields
        let errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
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

  buildQueryString(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item === undefined || item === null || item === '') return
          query.append(key, item)
        })
        return
      }
      if (typeof value === 'object') {
        query.append(key, JSON.stringify(value))
        return
      }
      query.append(key, value)
    })
    const queryString = query.toString()
    return queryString ? `?${queryString}` : ''
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

  // Maps CRUD
  // Maps & POIs
  async createMap(mapData) {
    return this.request('/maps', {
      method: 'POST',
      body: mapData
    })
  }

  async getMap(mapId) {
    if (!mapId) {
      return { success: false, error: 'Missing map identifier.' }
    }
    return this.request(`/maps/${mapId}`)
  }

  async getPublicMap(username, slug) {
    if (!username || !slug) {
      return { success: false, error: 'Missing username or slug.' }
    }
    // Public endpoint - no auth required, skip CSRF for public endpoints
    return this.request(`/u/${username}/${slug}`, {
      requireCsrf: false
    })
  }

  // Get POI filter metadata (activities, countries, etc.)
  async getPoiFilterMetadata() {
    // Public endpoint - no auth required
    return this.request('/pois/filters/metadata', {
      requireCsrf: false
    })
  }

  async getMaps(params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/maps${queryString}`)
  }

  async updateMap(mapId, mapData) {
    return this.request(`/maps/${mapId}`, {
      method: 'PUT',
      body: mapData
    })
  }

  async uploadMapThumbnail(mapId, file) {
    const formData = new FormData()
    formData.append('thumbnail', file)
    return this.request(`/maps/${mapId}/thumbnail`, {
      method: 'POST',
      body: formData
    })
  }

  async deleteMapThumbnail(mapId) {
    if (!mapId) {
      return { success: false, error: 'Missing map identifier.' }
    }
    return this.request(`/maps/${mapId}/thumbnail`, {
      method: 'DELETE'
    })
  }

  async savePoi(mapId, poiData) {
    return this.request(`/maps/${mapId}/pois`, {
      method: 'POST',
      body: poiData
    })
  }

  async updatePoi(mapId, poiId, poiData) {
    if (!mapId || !poiId) {
      return { success: false, error: 'Missing map or POI identifier.' }
    }
    return this.request(`/maps/${mapId}/pois/${poiId}`, {
      method: 'PUT',
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

  async deletePoiMedia(poiId, mediaId) {
    if (!poiId || !mediaId) {
      return { success: false, error: 'Missing POI or media identifier.' }
    }
    return this.request(`/pois/${poiId}/media/${mediaId}`, {
      method: 'DELETE'
    })
  }

  async reorderPoiMedia(poiId, order = []) {
    if (!poiId || !Array.isArray(order) || !order.length) {
      return { success: false, error: 'Missing POI identifier or media order.' }
    }
    return this.request(`/pois/${poiId}/media/reorder`, {
      method: 'PATCH',
      body: { order }
    })
  }

  async uploadPoiAudio(poiId, audioFile) {
    if (!poiId || !audioFile) {
      return { success: false, error: 'Missing POI identifier or audio file.' }
    }
    const formData = new FormData()
    formData.append('audio', audioFile)
    return this.request(`/pois/${poiId}/audio`, {
      method: 'POST',
      body: formData
    })
  }

  async uploadPoiPdf(poiId, pdfFile) {
    if (!poiId || !pdfFile) {
      return { success: false, error: 'Missing POI identifier or PDF file.' }
    }
    const formData = new FormData()
    formData.append('pdf', pdfFile)
    return this.request(`/pois/${poiId}/pdf`, {
      method: 'POST',
      body: formData
    })
  }

  async deletePoi(mapId, poiId) {
    if (!mapId || !poiId) {
      return { success: false, error: 'Missing map or POI identifier.' }
    }
    return this.request(`/maps/${mapId}/pois/${poiId}`, {
      method: 'DELETE'
    })
  }

  async deleteMap(mapId) {
    return this.request(`/maps/${mapId}`, {
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

  // ========================================
  // Influencer Profile API Methods
  // ========================================

  /**
   * Get public influencer profile by username
   * Public endpoint - no auth required
   */
  async getInfluencerProfile(username) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    return this.request(`/influencers/${encodeURIComponent(username)}`, {
      requireCsrf: false
    })
  }

  /**
   * Get current user's social links
   */
  async getInfluencerSocials() {
    return this.request('/influencer/socials')
  }

  /**
   * Create a new social link
   */
  async createInfluencerSocial(data) {
    return this.request('/influencer/socials', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update an existing social link
   */
  async updateInfluencerSocial(id, data) {
    return this.request(`/influencer/socials/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a social link
   */
  async deleteInfluencerSocial(id) {
    return this.request(`/influencer/socials/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Reorder social links
   */
  async reorderInfluencerSocials(ids) {
    return this.request('/influencer/socials/reorder', {
      method: 'PATCH',
      body: { ids }
    })
  }

  /**
   * Get current user's languages
   */
  async getInfluencerLanguages() {
    return this.request('/influencer/languages')
  }

  /**
   * Create a new language
   */
  async createInfluencerLanguage(data) {
    return this.request('/influencer/languages', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update an existing language
   */
  async updateInfluencerLanguage(id, data) {
    return this.request(`/influencer/languages/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a language
   */
  async deleteInfluencerLanguage(id) {
    return this.request(`/influencer/languages/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get current user's skills
   */
  async getInfluencerSkills() {
    return this.request('/influencer/skills')
  }

  /**
   * Create a new skill
   */
  async createInfluencerSkill(data) {
    return this.request('/influencer/skills', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update an existing skill
   */
  async updateInfluencerSkill(id, data) {
    return this.request(`/influencer/skills/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a skill
   */
  async deleteInfluencerSkill(id) {
    return this.request(`/influencer/skills/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get current user's certifications
   */
  async getInfluencerCertifications() {
    return this.request('/influencer/certifications')
  }

  /**
   * Create a new certification
   */
  async createInfluencerCertification(data) {
    return this.request('/influencer/certifications', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update an existing certification
   */
  async updateInfluencerCertification(id, data) {
    return this.request(`/influencer/certifications/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a certification
   */
  async deleteInfluencerCertification(id) {
    return this.request(`/influencer/certifications/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get current user's external links
   */
  async getInfluencerExternalLinks() {
    return this.request('/influencer/external-links')
  }

  /**
   * Create a new external link
   */
  async createInfluencerExternalLink(data) {
    return this.request('/influencer/external-links', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update an existing external link
   */
  async updateInfluencerExternalLink(id, data) {
    return this.request(`/influencer/external-links/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete an external link
   */
  async deleteInfluencerExternalLink(id) {
    return this.request(`/influencer/external-links/${id}`, {
      method: 'DELETE'
    })
  }

  // ========================================
  // Blog API Methods
  // ========================================

  /**
   * Get public blog posts for an influencer (no auth)
   */
  async getInfluencerBlogPosts(username, params = {}) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    const queryString = this.buildQueryString(params)
    return this.request(`/influencers/${encodeURIComponent(username)}/blog${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Get a single blog post by slug (no auth, premium gated)
   */
  async getInfluencerBlogPost(username, slug) {
    if (!username || !slug) {
      return { success: false, error: 'Username and slug are required.' }
    }
    return this.request(`/influencers/${encodeURIComponent(username)}/blog/${encodeURIComponent(slug)}`, {
      requireCsrf: false
    })
  }

  /**
   * Get own blog posts (includes drafts)
   */
  async getMyBlogPosts() {
    return this.request('/influencer/blog')
  }

  /**
   * Create a blog post
   */
  async createBlogPost(data) {
    return this.request('/influencer/blog', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update a blog post
   */
  async updateBlogPost(id, data) {
    return this.request(`/influencer/blog/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(id) {
    return this.request(`/influencer/blog/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Upload blog post cover image
   */
  async uploadBlogCover(id, file) {
    const formData = new FormData()
    formData.append('cover', file)
    return this.request(`/influencer/blog/${id}/cover`, {
      method: 'POST',
      body: formData
    })
  }

  // ========================================
  // Podcast API Methods
  // ========================================

  /**
   * Get public podcast episodes for an influencer (no auth)
   */
  async getInfluencerPodcastEpisodes(username, params = {}) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    const queryString = this.buildQueryString(params)
    return this.request(`/influencers/${encodeURIComponent(username)}/podcast${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Get a single podcast episode by slug (no auth, premium gated)
   */
  async getInfluencerPodcastEpisode(username, slug) {
    if (!username || !slug) {
      return { success: false, error: 'Username and slug are required.' }
    }
    return this.request(`/influencers/${encodeURIComponent(username)}/podcast/${encodeURIComponent(slug)}`, {
      requireCsrf: false
    })
  }

  /**
   * Get own podcast episodes (includes drafts)
   */
  async getMyPodcastEpisodes() {
    return this.request('/influencer/podcast')
  }

  /**
   * Create a podcast episode
   */
  async createPodcastEpisode(data) {
    return this.request('/influencer/podcast', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update a podcast episode
   */
  async updatePodcastEpisode(id, data) {
    return this.request(`/influencer/podcast/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a podcast episode
   */
  async deletePodcastEpisode(id) {
    return this.request(`/influencer/podcast/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Upload podcast audio file
   */
  async uploadPodcastAudio(id, file) {
    const formData = new FormData()
    formData.append('audio', file)
    return this.request(`/influencer/podcast/${id}/audio`, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Upload podcast cover image
   */
  async uploadPodcastCover(id, file) {
    const formData = new FormData()
    formData.append('cover', file)
    return this.request(`/influencer/podcast/${id}/cover`, {
      method: 'POST',
      body: formData
    })
  }

  // ========================================
  // Intro Video API Methods
  // ========================================

  /**
   * Get current user's influencer settings (intro video, etc.)
   */
  async getInfluencerSettings() {
    return this.request('/influencer/settings')
  }

  /**
   * Get creator tools visibility settings
   */
  async getCreatorToolsVisibility() {
    return this.request('/influencer/creator-tools-visibility')
  }

  /**
   * Update creator tools visibility settings
   */
  async updateCreatorToolsVisibility(settings) {
    return this.request('/influencer/creator-tools-visibility', {
      method: 'PUT',
      body: settings
    })
  }

  /**
   * Upload intro video
   */
  async uploadIntroVideo(file) {
    const formData = new FormData()
    formData.append('video', file)
    return this.request('/influencer/intro-video', {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Delete intro video
   */
  async deleteIntroVideo() {
    return this.request('/influencer/intro-video', {
      method: 'DELETE'
    })
  }

  // ========================================
  // Stripe Connect API Methods
  // ========================================

  /**
   * Start Stripe Connect onboarding
   */
  async stripeConnectOnboard(returnUrl, refreshUrl) {
    return this.request('/stripe/connect/onboard', {
      method: 'POST',
      body: { returnUrl, refreshUrl }
    })
  }

  /**
   * Get Stripe Connect account status
   */
  async getStripeConnectStatus() {
    return this.request('/stripe/connect/status')
  }

  /**
   * Get Stripe Express Dashboard link
   */
  async getStripeConnectDashboard() {
    return this.request('/stripe/connect/dashboard', {
      method: 'POST'
    })
  }

  /**
   * Disconnect Stripe account
   */
  async disconnectStripe() {
    return this.request('/stripe/connect', {
      method: 'DELETE'
    })
  }

  // ========================================
  // Masterclasses API Methods
  // ========================================

  /**
   * Get public masterclasses for an influencer
   */
  async getInfluencerMasterclasses(username, params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/influencers/${username}/masterclasses${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Get single public masterclass
   */
  async getInfluencerMasterclass(username, slug) {
    return this.request(`/influencers/${username}/masterclasses/${slug}`, {
      requireCsrf: false
    })
  }

  /**
   * Get own masterclasses (includes drafts)
   */
  async getMyMasterclasses() {
    return this.request('/influencer/masterclasses')
  }

  /**
   * Create masterclass
   */
  async createMasterclass(data) {
    return this.request('/influencer/masterclasses', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update masterclass
   */
  async updateMasterclass(id, data) {
    return this.request(`/influencer/masterclasses/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete masterclass
   */
  async deleteMasterclass(id) {
    return this.request(`/influencer/masterclasses/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Upload masterclass cover image
   */
  async uploadMasterclassCover(id, file) {
    const formData = new FormData()
    formData.append('cover', file)
    return this.request(`/influencer/masterclasses/${id}/cover`, {
      method: 'POST',
      body: formData
    })
  }

  // ========================================
  // Consultation API Methods
  // ========================================

  /**
   * Get public consultation details for an influencer (no auth)
   */
  async getInfluencerConsultation(username) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    return this.request(`/influencers/${encodeURIComponent(username)}/consultation`, {
      requireCsrf: false
    })
  }

  /**
   * Get own consultation settings
   */
  async getMyConsultation() {
    return this.request('/influencer/consultation')
  }

  /**
   * Update or create consultation settings
   */
  async updateConsultation(data) {
    return this.request('/influencer/consultation', {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Get consultation availability (booked slots) by username
   * Public endpoint - no auth required
   */
  async getConsultationAvailabilityByUsername(username, params = {}) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    const queryString = this.buildQueryString(params)
    return this.request(`/influencers/${encodeURIComponent(username)}/consultation/availability${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Get consultation availability (booked slots) by consultation ID
   * Public endpoint - no auth required
   */
  async getConsultationAvailability(consultationId, params = {}) {
    if (!consultationId) {
      return { success: false, error: 'Consultation ID is required.' }
    }
    const queryString = this.buildQueryString(params)
    return this.request(`/consultations/${consultationId}/availability${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Book a consultation
   */
  async bookConsultation(consultationId, bookingData) {
    return this.request(`/consultations/${consultationId}/book`, {
      method: 'POST',
      body: bookingData
    })
  }

  /**
   * Get my consultation bookings (as customer)
   */
  async getMyConsultationBookings(params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/consultations/my-bookings${queryString}`)
  }

  /**
   * Get single booking details
   */
  async getConsultationBooking(id) {
    return this.request(`/consultations/bookings/${id}`)
  }

  /**
   * Cancel a consultation booking
   */
  async cancelConsultationBooking(id, reason = null) {
    return this.request(`/consultations/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: reason ? { reason } : {}
    })
  }

  /**
   * Get consultation bookings (as influencer)
   */
  async getInfluencerConsultationBookings(params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/influencer/consultation/bookings${queryString}`)
  }

  /**
   * Get single booking (as influencer)
   */
  async getInfluencerConsultationBooking(id) {
    return this.request(`/influencer/consultation/bookings/${id}`)
  }

  /**
   * Confirm a booking (influencer only)
   */
  async confirmConsultationBooking(id, videoCallLink = null) {
    return this.request(`/influencer/consultation/bookings/${id}/confirm`, {
      method: 'PATCH',
      body: videoCallLink ? { video_call_link: videoCallLink } : {}
    })
  }

  /**
   * Complete a booking (influencer only)
   */
  async completeConsultationBooking(id) {
    return this.request(`/influencer/consultation/bookings/${id}/complete`, {
      method: 'PATCH'
    })
  }

  // ========================================
  // Media Assets API Methods
  // ========================================

  /**
   * Get public media assets for an influencer (no auth)
   */
  async getInfluencerMediaAssets(username, params = {}) {
    if (!username) {
      return { success: false, error: 'Username is required.' }
    }
    const queryString = this.buildQueryString(params)
    return this.request(`/influencers/${encodeURIComponent(username)}/media-assets${queryString}`, {
      requireCsrf: false
    })
  }

  /**
   * Get single public media asset (no auth)
   */
  async getInfluencerMediaAsset(username, id) {
    if (!username || !id) {
      return { success: false, error: 'Username and asset ID are required.' }
    }
    return this.request(`/influencers/${encodeURIComponent(username)}/media-assets/${id}`, {
      requireCsrf: false
    })
  }

  /**
   * Get own media assets (includes inactive/draft)
   */
  async getMyMediaAssets(params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/influencer/media-assets${queryString}`)
  }

  /**
   * Create a new media asset
   */
  async createMediaAsset(data) {
    return this.request('/influencer/media-assets', {
      method: 'POST',
      body: data
    })
  }

  /**
   * Update a media asset
   */
  async updateMediaAsset(id, data) {
    return this.request(`/influencer/media-assets/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  /**
   * Delete a media asset
   */
  async deleteMediaAsset(id) {
    return this.request(`/influencer/media-assets/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Upload asset file
   */
  async uploadMediaAssetFile(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    return this.request(`/influencer/media-assets/${id}/file`, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Upload asset preview image
   */
  async uploadMediaAssetImage(id, file) {
    const formData = new FormData()
    formData.append('image', file)
    return this.request(`/influencer/media-assets/${id}/image`, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Delete asset file
   */
  async deleteMediaAssetFile(id) {
    return this.request(`/influencer/media-assets/${id}/file`, {
      method: 'DELETE'
    })
  }

  /**
   * Delete asset preview image
   */
  async deleteMediaAssetImage(id) {
    return this.request(`/influencer/media-assets/${id}/image`, {
      method: 'DELETE'
    })
  }

  /**
   * Purchase a media asset
   */
  async purchaseMediaAsset(id) {
    return this.request(`/media-assets/${id}/purchase`, {
      method: 'POST'
    })
  }

  /**
   * Get my purchased media assets
   */
  async getMyPurchasedMediaAssets(params = {}) {
    const queryString = this.buildQueryString(params)
    return this.request(`/media-assets/my-purchases${queryString}`)
  }

  /**
   * Fetch an image as a blob with proper credentials and CORS handling
   * This is useful for fetching images from storage that may have CORS restrictions
   */
  async fetchImageAsBlob(imageUrl) {
    // If the URL is from the API origin, use credentials
    const url = new URL(imageUrl)
    const isApiOrigin = url.origin === this.apiOrigin

    const config = {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'image/*'
      }
    }

    // Only add credentials for same-origin requests
    if (isApiOrigin) {
      await this.ensureCsrf()
      const xsrfToken = this.getXsrfToken()
      if (xsrfToken) {
        config.headers[XSRF_HEADER_NAME] = xsrfToken
      }
    }

    try {
      const response = await fetch(imageUrl, config)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      }
      return await response.blob()
    } catch (error) {
      console.error('Failed to fetch image as blob:', error)
      throw error
    }
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the class and instance
export { ApiService }
export default apiService
