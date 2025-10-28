import { ref } from 'vue'

// Create a simple event bus using Vue 3's reactivity
const events = ref({})

export const eventBus = {
  // Listen to an event
  on(event, callback) {
    if (!events.value[event]) {
      events.value[event] = []
    }
    events.value[event].push(callback)
  },

  // Remove event listener
  off(event, callback) {
    if (events.value[event]) {
      const index = events.value[event].indexOf(callback)
      if (index > -1) {
        events.value[event].splice(index, 1)
      }
    }
  },

  // Emit an event
  emit(event, data) {
    if (events.value[event]) {
      events.value[event].forEach(callback => callback(data))
    }
  }
}

export default eventBus
