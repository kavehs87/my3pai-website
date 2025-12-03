import { ref, readonly, computed } from 'vue'
import api from '@/services/api'

/**
 * Composable for fetching and managing consultation data
 */
export function useConsultation() {
  const consultation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch consultation for an influencer by username
   */
  const fetchConsultation = async (username) => {
    if (!username) {
      consultation.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      // No timezone parameter - backend returns data in influencer's timezone
      const result = await api.getInfluencerConsultation(username)

      if (result.success && result.data?.data) {
        consultation.value = result.data.data
      } else {
        consultation.value = null
        error.value = result.error || 'Consultation not available'
      }
    } catch (err) {
      console.error('[useConsultation] Error fetching consultation:', err)
      consultation.value = null
      error.value = err.message || 'Failed to load consultation'
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if consultation is available and active
   */
  const isAvailable = computed(() => {
    return consultation.value?.isActive === true
  })

  return {
    consultation: readonly(consultation),
    loading: readonly(loading),
    error: readonly(error),
    isAvailable,
    fetchConsultation,
  }
}

export default useConsultation

