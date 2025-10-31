// Toast notification utility
import { useToast } from 'vue-toastification'

// Get toast instance
export const getToast = () => {
  return useToast()
}

// Convenience methods
export const toast = {
  success(message, options = {}) {
    const toastInstance = useToast()
    return toastInstance.success(message, {
      timeout: 4000,
      ...options
    })
  },
  error(message, options = {}) {
    const toastInstance = useToast()
    return toastInstance.error(message, {
      timeout: 5000,
      ...options
    })
  },
  info(message, options = {}) {
    const toastInstance = useToast()
    return toastInstance.info(message, {
      timeout: 4000,
      ...options
    })
  },
  warning(message, options = {}) {
    const toastInstance = useToast()
    return toastInstance.warning(message, {
      timeout: 4000,
      ...options
    })
  }
}

export default toast

