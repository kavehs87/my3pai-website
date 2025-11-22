/**
 * Color schemes for map markers based on activity categories
 * Colors are defined as hex values for Google Maps Advanced Markers
 */

export const markerColorSchemes = {
  // Accommodation - Teal
  accommodation: {
    background: '#14B8A6', // Teal-500
    border: '#0D9488',     // Teal-600
    icon: '#FFFFFF',
    category: 'accommodation'
  },
  
  // Hiking & Trekking - Forest Green
  hiking: {
    background: '#16A34A', // Green-600
    border: '#15803D',     // Green-700
    icon: '#FFFFFF',
    category: 'hiking'
  },
  
  // Water Activities - Cyan
  water: {
    background: '#06B6D4', // Cyan-500
    border: '#0891B2',     // Cyan-600
    icon: '#FFFFFF',
    category: 'water'
  },
  
  // Boating & Sailing - Sky Blue
  boating: {
    background: '#0EA5E9', // Sky-500
    border: '#0284C7',     // Sky-600
    icon: '#FFFFFF',
    category: 'boating'
  },
  
  // Cultural & Museums - Amber/Yellow
  cultural: {
    background: '#F59E0B', // Amber-500
    border: '#D97706',     // Amber-600
    icon: '#FFFFFF',
    category: 'cultural'
  },
  
  // Food & Dining - Orange
  food: {
    background: '#F97316', // Orange-500
    border: '#EA580C',     // Orange-600
    icon: '#FFFFFF',
    category: 'food'
  },
  
  // Adventure Sports - Purple
  adventure: {
    background: '#8B5CF6', // Purple-500
    border: '#7C3AED',      // Purple-600
    icon: '#FFFFFF',
    category: 'adventure'
  },
  
  // Nature & Wildlife - Emerald Green
  nature: {
    background: '#10B981', // Emerald-500
    border: '#059669',     // Emerald-600
    icon: '#FFFFFF',
    category: 'nature'
  },
  
  // Winter Sports - Ice Blue
  winter: {
    background: '#38BDF8', // Sky-400
    border: '#0EA5E9',     // Sky-500
    icon: '#FFFFFF',
    category: 'winter'
  },
  
  // Shopping - Pink
  shopping: {
    background: '#EC4899', // Pink-500
    border: '#DB2777',     // Pink-600
    icon: '#FFFFFF',
    category: 'shopping'
  },
  
  // Entertainment & Nightlife - Indigo
  entertainment: {
    background: '#6366F1', // Indigo-500
    border: '#4F46E5',     // Indigo-600
    icon: '#FFFFFF',
    category: 'entertainment'
  },
  
  // Cycling & Biking - Lime Green
  cycling: {
    background: '#84CC16', // Lime-500
    border: '#65A30D',     // Lime-600
    icon: '#FFFFFF',
    category: 'cycling'
  },
  
  // Running & Trail - Teal
  running: {
    background: '#2DD4BF', // Teal-400
    border: '#14B8A6',     // Teal-500
    icon: '#FFFFFF',
    category: 'running'
  },
  
  // Mountains & Climbing - Slate Gray
  mountain: {
    background: '#64748B', // Slate-500
    border: '#475569',     // Slate-600
    icon: '#FFFFFF',
    category: 'mountain'
  },
  
  // Wildlife & Safari - Brown/Amber
  wildlife: {
    background: '#D97706', // Amber-600
    border: '#B45309',     // Amber-700
    icon: '#FFFFFF',
    category: 'wildlife'
  },
  
  // Beach & Coastal - Turquoise
  beach: {
    background: '#2DD4BF', // Teal-400
    border: '#14B8A6',     // Teal-500
    icon: '#FFFFFF',
    category: 'beach'
  },
  
  // Default - Blue
  default: {
    background: '#3B82F6', // Blue-500
    border: '#2563EB',     // Blue-600
    icon: '#FFFFFF',
    category: 'default'
  }
}

/**
 * Direct activity to color scheme mappings
 * More specific mappings for better color diversity
 */
const activityColorMap = {
  // Accommodation
  'hotel': 'accommodation',
  'accommodation': 'accommodation',
  'hostel': 'accommodation',
  'resort': 'accommodation',
  'camping': 'accommodation',
  'glamping': 'accommodation',
  
  // Hiking & Trekking - Forest Green
  'hiking': 'hiking',
  'hike': 'hiking',
  'trekking': 'hiking',
  'walking': 'hiking',
  
  // Running & Trail - Teal
  'trail-run': 'running',
  'trail-running': 'running',
  
  // Cycling & Biking - Lime Green
  'cycling': 'cycling',
  'mountain-biking': 'cycling',
  
  // Water Activities - Cyan
  'swimming': 'water',
  'diving': 'water',
  'snorkeling': 'water',
  'surfing': 'water',
  'kayaking': 'water',
  'rafting': 'water',
  'fishing': 'water',
  
  // Boating & Sailing - Sky Blue
  'sailing': 'boating',
  'boat-trip': 'boating',
  'boating': 'boating',
  
  // Winter Sports - Ice Blue
  'skiing': 'winter',
  'ski': 'winter',
  'snowboarding': 'winter',
  
  // Mountains & Climbing - Slate Gray
  'rock-climbing': 'mountain',
  'climbing': 'mountain',
  'mountains': 'mountain',
  'mountain': 'mountain',
  'caves': 'mountain',
  'volcano': 'mountain',
  
  // Adventure Sports - Purple
  'adventure-sports': 'adventure',
  'paragliding': 'adventure',
  'skydiving': 'adventure',
  'bungee-jumping': 'adventure',
  'zip-lining': 'adventure',
  'atv': 'adventure',
  'quad-biking': 'adventure',
  
  // Cultural & Museums - Amber/Yellow
  'museums': 'cultural',
  'museum': 'cultural',
  'galleries': 'cultural',
  'temple': 'cultural',
  'temple-visit': 'cultural',
  'cultural-tours': 'cultural',
  'cultural': 'cultural',
  'heritage': 'cultural',
  'architecture': 'cultural',
  
  // Wildlife & Safari - Brown/Amber
  'wildlife': 'wildlife',
  'safari': 'wildlife',
  'bird-watching': 'wildlife',
  
  // Beach & Coastal - Turquoise
  'beaches': 'beach',
  'beach': 'beach',
  'waterfalls': 'beach',
  
  // Nature & Forests - Emerald Green
  'forest': 'nature',
  'jungle': 'nature',
  
  // Food & Dining - Orange
  'dining': 'food',
  'restaurant': 'food',
  'food-tours': 'food',
  'food-drinks': 'food',
  'drinks': 'food',
  'cooking-class': 'food',
  'market': 'food',
  'street-food': 'food',
  
  // Shopping - Pink
  'shopping': 'shopping',
  'markets': 'shopping',
  'souvenirs': 'shopping',
  
  // Entertainment & Nightlife - Indigo
  'nightlife': 'entertainment',
  'bars': 'entertainment',
  'clubs': 'entertainment',
  'concerts': 'entertainment',
  'shows': 'entertainment',
  'theater': 'entertainment',
  
  // Wellness - Nature Green (same as nature)
  'spa': 'nature',
  'wellness': 'nature',
  'yoga': 'nature',
  'meditation': 'nature'
}

/**
 * Get color scheme for an activity
 * @param {string} activityKey - The activity key
 * @returns {Object} Color scheme object
 */
export function getActivityColorScheme(activityKey) {
  if (!activityKey) return markerColorSchemes.default
  
  const normalizedKey = activityKey.toLowerCase().replace(/[_\s]/g, '-')
  const colorSchemeKey = activityColorMap[normalizedKey] || 'default'
  return markerColorSchemes[colorSchemeKey] || markerColorSchemes.default
}

/**
 * Activities to exclude from color scheme selection (too common/generic)
 */
const EXCLUDED_ACTIVITIES = ['sightseeing', 'photography']

/**
 * Get color scheme for a POI based on its activities or place type
 * @param {Object} poi - POI object
 * @returns {Object} Color scheme object
 */
export function getPOIColorScheme(poi) {
  // Check activities first
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
    
    return getActivityColorScheme(activityToUse)
  }
  
  // Fallback to place type
  const placeType = poi.category?.placeType
  if (placeType) {
    const placeTypeMap = {
      'nature': markerColorSchemes.nature,
      'city': markerColorSchemes.cultural,
      'culture': markerColorSchemes.cultural,
      'food': markerColorSchemes.food,
      'adventure': markerColorSchemes.adventure,
      'other': markerColorSchemes.default
    }
    return placeTypeMap[placeType] || markerColorSchemes.default
  }
  
  return markerColorSchemes.default
}

