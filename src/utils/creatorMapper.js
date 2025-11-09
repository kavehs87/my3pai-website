const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop'
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop'

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const ensureAtHandle = (username) => {
  if (!username) return ''
  const handle = username.trim()
  return handle.startsWith('@') ? handle : `@${handle}`
}

export function mapProfileToCreator(payload = {}) {
  const user = payload.user || payload
  const stats = payload.stats || user.stats || {}

  const nameParts = [user.firstName || user.first_name, user.lastName || user.last_name].filter(Boolean)
  const nameFallback = nameParts.join(' ').trim()

  const coverFromFeatured =
    (user.featuredPlan && user.featuredPlan.thumbnail) || (user.featured_plan && user.featured_plan.thumbnail)

  const featuredPlan = user.featuredPlan || user.featured_plan || {} /* Profile API guarantees {} instead of null */
  const recentPlans = Array.isArray(user.recentPlans || user.recent_plans) ? user.recentPlans || user.recent_plans : []

  return {
    id: user.id,
    name: user.displayName || user.display_name || nameFallback || ensureAtHandle(user.username) || 'Creator',
    username: ensureAtHandle(user.username),
    avatar: user.avatar || user.avatar_url || DEFAULT_AVATAR,
    coverImage: user.coverImage || user.cover_image || coverFromFeatured || DEFAULT_COVER,
    bio: user.bio || '',
    location: user.location || '',
    joinedDate: user.joinedDate || user.joined_date || user.created_at || '',
    verified: Boolean(user.verified),
    tier: user.tier || '',
    specialties: toArray(user.specialties),
    rating: user.rating || null,
    countriesVisited: Array.isArray(user.countriesVisited || user.countries_visited)
      ? user.countriesVisited || user.countries_visited
      : [],
    languages: Array.isArray(user.languages) ? user.languages : [],
    socialLinks: Array.isArray(user.socialLinks || user.social_links)
      ? user.socialLinks || user.social_links
      : [],
    partnerships: Array.isArray(user.partnerships) ? user.partnerships : [],
    featuredPlan,
    recentPlans,
    preferences: user.preferences || {},
    stats: {
      followers: Number.isFinite(stats.followers) ? stats.followers : 0,
      following: Number.isFinite(stats.following) ? stats.following : 0,
      totalPlans: Number.isFinite(stats.totalPlans) ? stats.totalPlans : 0,
      totalViews: Number.isFinite(stats.totalViews) ? stats.totalViews : 0,
      totalLikes: Number.isFinite(stats.totalLikes) ? stats.totalLikes : 0,
      totalTrips: Number.isFinite(stats.totalTrips) ? stats.totalTrips : 0,
      totalItineraries: Number.isFinite(stats.totalItineraries) ? stats.totalItineraries : 0,
      savedPlans: Number.isFinite(stats.savedPlans) ? stats.savedPlans : 0,
      countriesVisited: Number.isFinite(stats.countriesVisited) ? stats.countriesVisited : 0,
      totalDaysTraveled: Number.isFinite(stats.totalDaysTraveled) ? stats.totalDaysTraveled : 0
    }
  }
}

export function formatCount(value) {
  if (value === null || value === undefined) return '0'
  const numeric = typeof value === 'string' ? Number(value.replace(/[^\d.-]/g, '')) : Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  if (numeric >= 1_000_000_000) return `${(numeric / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(numeric)
}


