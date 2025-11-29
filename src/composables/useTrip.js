import { ref, computed } from 'vue'
import { MOCK_TRIPS } from '@/data/travelCollaboration/constants.js'

const activeTripId = ref('t1')
const userMode = ref('traveler')
const intentFilter = ref('all')

export function useTrip() {
  const activeTrip = computed(() => {
    return MOCK_TRIPS.find(t => t.id === activeTripId.value)
  })

  const setActiveTrip = (id) => {
    activeTripId.value = id
  }

  const setUserMode = (mode) => {
    userMode.value = mode
  }

  const setIntentFilter = (filter) => {
    intentFilter.value = filter
  }

  return {
    activeTripId,
    activeTrip,
    userMode,
    intentFilter,
    setActiveTrip,
    setUserMode,
    setIntentFilter
  }
}

