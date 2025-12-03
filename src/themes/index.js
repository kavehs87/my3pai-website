/**
 * Theme Registry
 * Maps theme IDs to their components and metadata
 */

import ModernTheme from './modern/Profile.vue'
import BasicTheme from './basic/Profile.vue'
import DarkBlueTheme from './dark-blue/Profile.vue'

// Lazy load library pages - loaded dynamically based on theme
const ModernMasterclassesLibrary = () => import('./modern/MasterclassesLibrary.vue')
const ModernMediaAssetsLibrary = () => import('./modern/MediaAssetsLibrary.vue')
const BasicMasterclassesLibrary = () => import('./basic/MasterclassesLibrary.vue')
const BasicMediaAssetsLibrary = () => import('./basic/MediaAssetsLibrary.vue')

export const themes = {
  modern: {
    id: 'modern',
    name: 'Modern',
    component: ModernTheme,
    pages: {
      masterclasses: ModernMasterclassesLibrary,
      mediaAssets: ModernMediaAssetsLibrary
    },
    preview: '/theme-previews/modern.jpg',
    description: 'Clean and contemporary design'
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    component: BasicTheme,
    pages: {
      masterclasses: BasicMasterclassesLibrary,
      mediaAssets: BasicMediaAssetsLibrary
    },
    preview: '/theme-previews/basic.jpg',
    description: 'Simple and straightforward design'
  },
  'dark-blue': {
    id: 'dark-blue',
    name: 'Dark Blue',
    component: DarkBlueTheme,
    pages: {
      masterclasses: ModernMasterclassesLibrary, // Use modern for now, can create theme-specific later
      mediaAssets: ModernMediaAssetsLibrary
    },
    preview: '/theme-previews/dark-blue.jpg',
    description: 'Professional dark blue theme with teal accents'
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

/**
 * Get theme page component by page type
 * @param {string} themeId - Theme identifier
 * @param {string} pageType - Page type ('masterclasses' or 'mediaAssets')
 * @returns {Promise|Component} Theme page component
 */
export const getThemePage = async (themeId, pageType) => {
  const theme = getTheme(themeId)
  if (theme?.pages?.[pageType]) {
    const pageLoader = theme.pages[pageType]
    return typeof pageLoader === 'function' ? await pageLoader() : pageLoader
  }
  // Fallback to modern theme
  const fallbackTheme = themes.modern
  if (fallbackTheme?.pages?.[pageType]) {
    const pageLoader = fallbackTheme.pages[pageType]
    return typeof pageLoader === 'function' ? await pageLoader() : pageLoader
  }
  return null
}

