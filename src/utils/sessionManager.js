/**
 * Session Manager for Guest Cart Support
 * 
 * Manages guest session IDs stored in localStorage.
 * Session IDs are used to identify guest carts on the backend.
 */

const STORAGE_KEY = 'guest_session_id'

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Get or create guest session ID
 * @returns {string} Session ID
 */
export function getGuestSessionId() {
  try {
    let sessionId = localStorage.getItem(STORAGE_KEY)
    
    if (!sessionId) {
      sessionId = generateUUID()
      localStorage.setItem(STORAGE_KEY, sessionId)
    }
    
    return sessionId
  } catch (error) {
    console.error('Error accessing localStorage for session ID:', error)
    // Fallback: generate a session ID in memory (won't persist)
    return generateUUID()
  }
}

/**
 * Clear guest session ID
 * Called on logout or after successful cart merge
 */
export function clearGuestSessionId() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing session ID from localStorage:', error)
  }
}

/**
 * Check if a guest session ID exists
 * @returns {boolean}
 */
export function hasGuestSessionId() {
  try {
    return !!localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    return false
  }
}

export default {
  getGuestSessionId,
  clearGuestSessionId,
  hasGuestSessionId
}

