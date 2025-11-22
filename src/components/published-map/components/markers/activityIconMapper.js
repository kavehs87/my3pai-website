/**
 * Maps activity types to FontAwesome icon classes
 * Used for displaying icons on map markers
 */
export const activityIconMap = {
  // Accommodation
  'hotel': 'fas fa-bed',
  'accommodation': 'fas fa-bed',
  'hostel': 'fas fa-bed',
  'resort': 'fas fa-bed',
  'camping': 'fas fa-campground',
  'glamping': 'fas fa-campground',
  
  // Activities & Experiences
  'hiking': 'fas fa-hiking',
  'hike': 'fas fa-hiking',
  'trekking': 'fas fa-hiking',
  'walking': 'fas fa-walking',
  'trail-run': 'fas fa-running',
  'trail-running': 'fas fa-running',
  'cycling': 'fas fa-bicycle',
  'mountain-biking': 'fas fa-bicycle',
  'swimming': 'fas fa-swimmer',
  'diving': 'fas fa-swimmer',
  'snorkeling': 'fas fa-swimmer',
  'surfing': 'fas fa-water',
  'kayaking': 'fas fa-water',
  'rafting': 'fas fa-water',
  'sailing': 'fas fa-ship',
  'boat-trip': 'fas fa-ship',
  'boating': 'fas fa-ship',
  'fishing': 'fas fa-fish',
  'skiing': 'fas fa-skiing',
  'ski': 'fas fa-skiing',
  'snowboarding': 'fas fa-snowboarding',
  'rock-climbing': 'fas fa-mountain',
  'climbing': 'fas fa-mountain',
  'paragliding': 'fas fa-parachute-box',
  'skydiving': 'fas fa-parachute-box',
  
  // Cultural & Sightseeing
  'sightseeing': 'fas fa-camera',
  'photography': 'fas fa-camera',
  'museums': 'fas fa-landmark',
  'museum': 'fas fa-landmark',
  'galleries': 'fas fa-palette',
  'temple': 'fas fa-place-of-worship',
  'temple-visit': 'fas fa-place-of-worship',
  'cultural-tours': 'fas fa-theater-masks',
  'cultural': 'fas fa-landmark',
  'heritage': 'fas fa-monument',
  'architecture': 'fas fa-building',
  
  // Food & Dining
  'dining': 'fas fa-utensils',
  'restaurant': 'fas fa-utensils',
  'food-tours': 'fas fa-utensils',
  'food-drinks': 'fas fa-cocktail',
  'drinks': 'fas fa-cocktail',
  'cooking-class': 'fas fa-utensils',
  'market': 'fas fa-shopping-basket',
  'street-food': 'fas fa-utensils',
  
  // Entertainment & Nightlife
  'nightlife': 'fas fa-moon',
  'bars': 'fas fa-cocktail',
  'clubs': 'fas fa-music',
  'concerts': 'fas fa-music',
  'shows': 'fas fa-theater-masks',
  'theater': 'fas fa-theater-masks',
  
  // Shopping
  'shopping': 'fas fa-shopping-bag',
  'markets': 'fas fa-shopping-basket',
  'souvenirs': 'fas fa-shopping-bag',
  
  // Nature & Wildlife
  'wildlife': 'fas fa-paw',
  'safari': 'fas fa-paw',
  'bird-watching': 'fas fa-dove',
  'beaches': 'fas fa-umbrella-beach',
  'beach': 'fas fa-umbrella-beach',
  'mountains': 'fas fa-mountain',
  'mountain': 'fas fa-mountain',
  'forest': 'fas fa-tree',
  'jungle': 'fas fa-tree',
  'waterfalls': 'fas fa-water',
  'caves': 'fas fa-mountain',
  'volcano': 'fas fa-mountain',
  
  // Adventure Sports
  'adventure-sports': 'fas fa-running',
  'bungee-jumping': 'fas fa-running',
  'zip-lining': 'fas fa-running',
  'atv': 'fas fa-motorcycle',
  'quad-biking': 'fas fa-motorcycle',
  
  // Wellness & Relaxation
  'spa': 'fas fa-spa',
  'wellness': 'fas fa-spa',
  'yoga': 'fas fa-spa',
  'meditation': 'fas fa-spa',
  
  // Default fallback
  'default': 'fas fa-map-marker-alt',
  'activity': 'fas fa-user',
  'experience': 'fas fa-star'
}

/**
 * Get icon class for an activity
 * @param {string} activityKey - The activity key (e.g., 'hiking', 'museums')
 * @returns {string} FontAwesome icon class
 */
export function getActivityIcon(activityKey) {
  if (!activityKey) return activityIconMap.default
  
  const normalizedKey = activityKey.toLowerCase().replace(/[_\s]/g, '-')
  return activityIconMap[normalizedKey] || activityIconMap.default
}

/**
 * Activities to exclude from primary icon selection (too common/generic)
 */
const EXCLUDED_ACTIVITIES = ['sightseeing', 'photography']

/**
 * Get primary activity icon from a POI's activities array
 * @param {Object} poi - POI object
 * @returns {string} FontAwesome icon class
 */
export function getPOIPrimaryIcon(poi) {
  // Check if POI has activities
  const activities = poi.category?.activities || []
  
  if (activities.length > 0) {
    // Filter out excluded activities (like "sightseeing" which is too common)
    const meaningfulActivities = activities.filter(activity => {
      const normalized = activity.toLowerCase().replace(/[_\s]/g, '-')
      return !EXCLUDED_ACTIVITIES.includes(normalized)
    })
    
    // Use first meaningful activity, or fall back to first activity if all were excluded
    const activityToUse = meaningfulActivities.length > 0 
      ? meaningfulActivities[0] 
      : activities[0]
    
    return getActivityIcon(activityToUse)
  }
  
  // Fallback to place type
  const placeType = poi.category?.placeType
  if (placeType) {
    return getPlaceTypeIcon(placeType)
  }
  
  return activityIconMap.default
}

/**
 * Get icon based on place type
 * @param {string} placeType - Place type (nature, city, culture, food, adventure, other)
 * @returns {string} FontAwesome icon class
 */
export function getPlaceTypeIcon(placeType) {
  const placeTypeIcons = {
    'nature': 'fas fa-tree',
    'city': 'fas fa-city',
    'culture': 'fas fa-landmark',
    'food': 'fas fa-utensils',
    'adventure': 'fas fa-mountain',
    'other': 'fas fa-map-marker-alt'
  }
  
  return placeTypeIcons[placeType] || activityIconMap.default
}

