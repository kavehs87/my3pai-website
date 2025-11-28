import { ref, readonly, computed } from 'vue'
import api from '@/services/api'
import { PROFILE as MOCK_PROFILE, EXTERNAL_LINKS as MOCK_EXTERNAL_LINKS } from '../constants'

/**
 * Composable for fetching and managing influencer profile data
 */
export function useInfluencer() {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const useMockData = ref(false)

  /**
   * Get flag emoji from language code (ISO 639-1)
   * Maps language codes to country flag emojis
   */
  const getLanguageFlag = (languageCode) => {
    const languageToCountry = {
      en: '🇬🇧',
      de: '🇩🇪',
      fr: '🇫🇷',
      it: '🇮🇹',
      es: '🇪🇸',
      pt: '🇵🇹',
      nl: '🇳🇱',
      pl: '🇵🇱',
      ru: '🇷🇺',
      ja: '🇯🇵',
      ko: '🇰🇷',
      zh: '🇨🇳',
      ar: '🇸🇦',
      hi: '🇮🇳',
      tr: '🇹🇷',
      sv: '🇸🇪',
      no: '🇳🇴',
      da: '🇩🇰',
      fi: '🇫🇮',
      cs: '🇨🇿',
      el: '🇬🇷',
      he: '🇮🇱',
      th: '🇹🇭',
      vi: '🇻🇳',
      id: '🇮🇩',
      ms: '🇲🇾',
      uk: '🇺🇦',
      ro: '🇷🇴',
      hu: '🇭🇺',
      bg: '🇧🇬',
      hr: '🇭🇷',
      sk: '🇸🇰',
      sl: '🇸🇮',
      lt: '🇱🇹',
      lv: '🇱🇻',
      et: '🇪🇪',
    }
    return languageToCountry[languageCode?.toLowerCase()] || '🌐'
  }

  /**
   * Format level string for display
   */
  const formatLevel = (level) => {
    const levelMap = {
      native: 'Native',
      fluent: 'Fluent',
      conversational: 'Conversational',
      basic: 'Basic',
    }
    return levelMap[level?.toLowerCase()] || level
  }

  /**
   * Transform API response to match the component's expected format
   */
  const transformProfile = (data) => {
    return {
      id: data.id,
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      firstName: data.firstName,
      lastName: data.lastName,
      handle: data.username ? `@${data.username}` : null,
      username: data.username,
      tagline: data.tagline || '',
      location: data.location ? `Based in ${data.location}` : '',
      subLocation: data.subLocation || '',
      bio: data.bio || '',
      image: data.avatar || null,
      coverImage: data.coverImage || null,
      verified: data.verified || false,
      stats: {
        rating: data.stats?.rating || null,
        reviews: data.stats?.reviewsCount || 0,
        locations: data.stats?.locationsCount || 0,
        mapsBuilt: data.stats?.mapsCount || 0,
        travelersGuided: data.stats?.travelersCount?.toLocaleString() || '0',
      },
      socials: (data.socials || []).map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        handle: s.handle,
      })),
      languages: (data.languages || []).map((l) => ({
        id: l.id,
        name: l.languageName,
        code: l.languageCode,
        level: formatLevel(l.level),
        flag: getLanguageFlag(l.languageCode),
      })),
      skills: (data.skills || []).map((s) => (typeof s === 'string' ? s : s.skill)),
      certifications: (data.certifications || []).map((c) =>
        typeof c === 'string' ? c : c.name
      ),
      externalLinks: (data.externalLinks || []).map((link) => ({
        id: link.id,
        platform: link.platform,
        title: link.title,
        subtitle: link.subtitle,
        url: link.url,
        rating: link.rating,
      })),
    }
  }

  /**
   * Fetch influencer profile by username
   */
  const fetchProfile = async (username) => {
    // Reset state
    loading.value = true
    error.value = null
    useMockData.value = false

    try {
      const result = await api.getInfluencerProfile(username)

      if (result.success && result.data?.data) {
        profile.value = transformProfile(result.data.data)
      } else {
        // Fallback to mock data during development
        console.warn('[useInfluencer] API failed, using mock data:', result.error)
        useMockData.value = true
        profile.value = {
          ...MOCK_PROFILE,
          externalLinks: MOCK_EXTERNAL_LINKS,
        }
        error.value = result.error || 'Failed to load profile'
      }
    } catch (err) {
      console.error('[useInfluencer] Error fetching profile:', err)
      // Fallback to mock data
      useMockData.value = true
      profile.value = {
        ...MOCK_PROFILE,
        externalLinks: MOCK_EXTERNAL_LINKS,
      }
      error.value = err.message || 'An unexpected error occurred'
    } finally {
      loading.value = false
    }
  }

  /**
   * Load mock data directly (for development/demo)
   */
  const loadMockData = () => {
    useMockData.value = true
    profile.value = {
      ...MOCK_PROFILE,
      externalLinks: MOCK_EXTERNAL_LINKS,
    }
    loading.value = false
    error.value = null
  }

  /**
   * Computed helper for bio paragraphs
   */
  const bioParagraphs = computed(() => {
    if (!profile.value?.bio) return []
    return profile.value.bio.split('\n\n').filter(Boolean)
  })

  /**
   * Check if profile has any data
   */
  const hasProfile = computed(() => Boolean(profile.value))

  /**
   * Check if profile has social links
   */
  const hasSocials = computed(
    () => profile.value?.socials?.length > 0
  )

  /**
   * Check if profile has external links
   */
  const hasExternalLinks = computed(
    () => profile.value?.externalLinks?.length > 0
  )

  return {
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
    useMockData: readonly(useMockData),
    bioParagraphs,
    hasProfile,
    hasSocials,
    hasExternalLinks,
    fetchProfile,
    loadMockData,
  }
}

export default useInfluencer

