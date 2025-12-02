/**
 * Theme Registry
 * Maps theme IDs to their components and metadata
 */

import ModernTheme from './modern/Profile.vue'
import MinimalTheme from './minimal/Profile.vue'

export const themes = {
  modern: {
    id: 'modern',
    name: 'Modern',
    component: ModernTheme,
    preview: '/theme-previews/modern.jpg',
    description: 'Clean and contemporary design'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    component: MinimalTheme,
    preview: '/theme-previews/minimal.jpg',
    description: 'Simple and elegant design'
  }
}

/**
 * Get theme by ID, fallback to 'modern' if not found
 * @param {string} themeId - Theme identifier
 * @returns {Object} Theme object with component and metadata
 */
export const getTheme = (themeId) => {
  return themes[themeId] || themes.modern
}

/**
 * Get all available themes
 * @returns {Array} Array of theme objects
 */
export const getAvailableThemes = () => {
  return Object.values(themes)
}

/**
 * Check if theme exists
 * @param {string} themeId - Theme identifier
 * @returns {boolean}
 */
export const themeExists = (themeId) => {
  return !!themes[themeId]
}

