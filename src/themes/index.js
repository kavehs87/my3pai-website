/**
 * Theme Registry
 * Maps theme IDs to their components and metadata
 */

import BasicTheme from './basic/Profile.vue'
import DarkBlueTheme from './dark-blue/Profile.vue'
import WanderLuxeTheme from './wanderluxe/Profile.vue'

// Lazy load library pages - loaded dynamically based on theme
const BasicMasterclassesLibrary = () => import('./basic/MasterclassesLibrary.vue')
const BasicMediaAssetsLibrary = () => import('./basic/MediaAssetsLibrary.vue')

// Lazy load dark-blue theme views
const DarkBlueHomeView = () => import('./dark-blue/views/HomeView.vue')
const DarkBluePodcastsView = () => import('./dark-blue/views/PodcastsView.vue')
const DarkBlueBlogView = () => import('./dark-blue/views/BlogView.vue')
const DarkBlueBlogPostView = () => import('./dark-blue/views/BlogPostView.vue')
const DarkBlueMapsView = () => import('./dark-blue/views/MapsView.vue')
const DarkBlueClassesView = () => import('./dark-blue/views/ClassesView.vue')
const DarkBlueAssetsView = () => import('./dark-blue/views/AssetsView.vue')
const DarkBlueSocialsView = () => import('./dark-blue/views/SocialsView.vue')
const DarkBlueConsultationView = () => import('./dark-blue/views/ConsultationView.vue')
const DarkBlueCheckoutView = () => import('./dark-blue/views/CheckoutView.vue')
const DarkBlueContactView = () => import('./dark-blue/views/ContactView.vue')
const DarkBlueTermsView = () => import('./dark-blue/views/TermsView.vue')
const DarkBluePrivacyView = () => import('./dark-blue/views/PrivacyView.vue')

// Lazy load wanderluxe theme views
const WanderLuxeHomeView = () => import('./wanderluxe/views/HomeView.vue')
const WanderLuxeAssetsView = () => import('./wanderluxe/views/StoreView.vue')
const WanderLuxeConsultationView = () => import('./wanderluxe/views/ConsultationView.vue')
const WanderLuxeBlogView = () => import('./wanderluxe/views/BlogView.vue')
const WanderLuxeBlogPostView = () => import('./wanderluxe/views/BlogPostView.vue')
const WanderLuxePodcastsView = () => import('./wanderluxe/views/PodcastsView.vue')
const WanderLuxeMapsView = () => import('./wanderluxe/views/DestinationsView.vue')
const WanderLuxeClassesView = () => import('./wanderluxe/views/TrainingView.vue')
const WanderLuxeCheckoutView = () => import('./wanderluxe/views/CheckoutView.vue')
const WanderLuxeContactView = () => import('./wanderluxe/views/ContactView.vue')
const WanderLuxeTermsView = () => import('./wanderluxe/views/TermsView.vue')
const WanderLuxePrivacyView = () => import('./wanderluxe/views/PrivacyView.vue')

export const themes = {
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
      masterclasses: BasicMasterclassesLibrary, // Use basic for library pages
      mediaAssets: BasicMediaAssetsLibrary
    },
    views: {
      HomeView: DarkBlueHomeView,
      PodcastsView: DarkBluePodcastsView,
      BlogView: DarkBlueBlogView,
      BlogPostView: DarkBlueBlogPostView,
      MapsView: DarkBlueMapsView,
      ClassesView: DarkBlueClassesView,
      AssetsView: DarkBlueAssetsView,
      SocialsView: DarkBlueSocialsView,
      ConsultationView: DarkBlueConsultationView,
      CheckoutView: DarkBlueCheckoutView,
      ContactView: DarkBlueContactView,
      TermsView: DarkBlueTermsView,
      PrivacyView: DarkBluePrivacyView,
    },
    preview: '/theme-previews/dark-blue.jpg',
    description: 'Professional dark blue theme with teal accents'
  },
  wanderluxe: {
    id: 'wanderluxe',
    name: 'WanderLuxe',
    component: WanderLuxeTheme,
    pages: {
      masterclasses: BasicMasterclassesLibrary, // Use basic for library pages
      mediaAssets: BasicMediaAssetsLibrary
    },
    views: {
      HomeView: WanderLuxeHomeView,
      AssetsView: WanderLuxeAssetsView, // StoreView component for assets route
      ConsultationView: WanderLuxeConsultationView,
      BlogView: WanderLuxeBlogView,
      BlogPostView: WanderLuxeBlogPostView,
      PodcastsView: WanderLuxePodcastsView,
      MapsView: WanderLuxeMapsView, // DestinationsView component for maps route
      ClassesView: WanderLuxeClassesView, // TrainingView component for classes route
      CheckoutView: WanderLuxeCheckoutView,
      ContactView: WanderLuxeContactView,
      TermsView: WanderLuxeTermsView,
      PrivacyView: WanderLuxePrivacyView,
      // Other views will be added as they are created
      // For now, fallback to dark-blue for missing views
    },
    preview: '/theme-previews/wanderluxe.jpg',
    description: 'Elegant sidebar-based layout with collapsible profile'
  }
}

/**
 * Get theme by ID, fallback to 'dark-blue' if not found
 * @param {string} themeId - Theme identifier
 * @returns {Object} Theme object with component and metadata
 */
export const getTheme = (themeId) => {
  return themes[themeId] || themes['dark-blue']
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
  // Fallback to basic theme for library pages
  const fallbackTheme = themes.basic
  if (fallbackTheme?.pages?.[pageType]) {
    const pageLoader = fallbackTheme.pages[pageType]
    return typeof pageLoader === 'function' ? await pageLoader() : pageLoader
  }
  return null
}

/**
 * Get theme-specific view component by view name
 * @param {string} themeId - Theme identifier
 * @param {string} viewName - View name (e.g., 'HomeView', 'BlogView')
 * @returns {Promise|Component|null} Theme view component or null if not found
 */
export const getThemeView = async (themeId, viewName) => {
  const theme = getTheme(themeId)
  if (theme?.views?.[viewName]) {
    const viewLoader = theme.views[viewName]
    return typeof viewLoader === 'function' ? await viewLoader() : viewLoader
  }
  // Fallback to dark-blue theme for views
  const fallbackTheme = themes['dark-blue']
  if (fallbackTheme?.views?.[viewName]) {
    const viewLoader = fallbackTheme.views[viewName]
    return typeof viewLoader === 'function' ? await viewLoader() : viewLoader
  }
  return null
}

