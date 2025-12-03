/**
 * Comprehensive list of IANA timezones organized by region
 * Used for timezone selection in user preferences
 */

export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', group: 'Americas' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', group: 'Americas' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', group: 'Americas' },
  { value: 'America/Anchorage', label: 'Alaska', group: 'Americas' },
  { value: 'America/Phoenix', label: 'Arizona', group: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto', group: 'Americas' },
  { value: 'America/Vancouver', label: 'Vancouver', group: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', group: 'Americas' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires', group: 'Americas' },
  { value: 'America/Lima', label: 'Lima', group: 'Americas' },
  { value: 'America/Santiago', label: 'Santiago', group: 'Americas' },
  { value: 'America/Bogota', label: 'Bogota', group: 'Americas' },
  { value: 'America/Caracas', label: 'Caracas', group: 'Americas' },
  { value: 'America/Guatemala', label: 'Guatemala', group: 'Americas' },
  { value: 'America/Montevideo', label: 'Montevideo', group: 'Americas' },
  { value: 'America/Havana', label: 'Havana', group: 'Americas' },
  { value: 'America/Panama', label: 'Panama', group: 'Americas' },
  
  // Europe
  { value: 'Europe/London', label: 'London', group: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin', group: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome', group: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid', group: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam', group: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels', group: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna', group: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague', group: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw', group: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens', group: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki', group: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm', group: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo', group: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen', group: 'Europe' },
  { value: 'Europe/Dublin', label: 'Dublin', group: 'Europe' },
  { value: 'Europe/Lisbon', label: 'Lisbon', group: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul', group: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow', group: 'Europe' },
  { value: 'Europe/Kiev', label: 'Kiev', group: 'Europe' },
  { value: 'Europe/Bucharest', label: 'Bucharest', group: 'Europe' },
  { value: 'Europe/Budapest', label: 'Budapest', group: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich', group: 'Europe' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai', group: 'Asia' },
  { value: 'Asia/Tehran', label: 'Tehran', group: 'Asia' },
  { value: 'Asia/Karachi', label: 'Karachi', group: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi', group: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka', group: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok', group: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta', group: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore', group: 'Asia' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', group: 'Asia' },
  { value: 'Asia/Manila', label: 'Manila', group: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', group: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai', group: 'Asia' },
  { value: 'Asia/Beijing', label: 'Beijing', group: 'Asia' },
  { value: 'Asia/Taipei', label: 'Taipei', group: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo', group: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul', group: 'Asia' },
  { value: 'Asia/Yangon', label: 'Yangon', group: 'Asia' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City', group: 'Asia' },
  { value: 'Asia/Riyadh', label: 'Riyadh', group: 'Asia' },
  { value: 'Asia/Baghdad', label: 'Baghdad', group: 'Asia' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem', group: 'Asia' },
  { value: 'Asia/Amman', label: 'Amman', group: 'Asia' },
  { value: 'Asia/Beirut', label: 'Beirut', group: 'Asia' },
  { value: 'Asia/Almaty', label: 'Almaty', group: 'Asia' },
  { value: 'Asia/Tashkent', label: 'Tashkent', group: 'Asia' },
  { value: 'Asia/Baku', label: 'Baku', group: 'Asia' },
  { value: 'Asia/Yerevan', label: 'Yerevan', group: 'Asia' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', group: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', group: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos', group: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi', group: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Casablanca', group: 'Africa' },
  { value: 'Africa/Tunis', label: 'Tunis', group: 'Africa' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa', group: 'Africa' },
  { value: 'Africa/Accra', label: 'Accra', group: 'Africa' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam', group: 'Africa' },
  
  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney', group: 'Oceania' },
  { value: 'Australia/Melbourne', label: 'Melbourne', group: 'Oceania' },
  { value: 'Australia/Brisbane', label: 'Brisbane', group: 'Oceania' },
  { value: 'Australia/Perth', label: 'Perth', group: 'Oceania' },
  { value: 'Australia/Adelaide', label: 'Adelaide', group: 'Oceania' },
  { value: 'Pacific/Auckland', label: 'Auckland', group: 'Oceania' },
  { value: 'Pacific/Honolulu', label: 'Honolulu', group: 'Oceania' },
  { value: 'Pacific/Fiji', label: 'Fiji', group: 'Oceania' },
  
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', group: 'UTC' },
]

/**
 * Get timezone by value
 */
export const getTimezone = (value) => {
  return TIMEZONES.find(tz => tz.value === value) || null
}

/**
 * Get timezones grouped by region
 */
export const getTimezonesByGroup = () => {
  const grouped = {}
  TIMEZONES.forEach(tz => {
    if (!grouped[tz.group]) {
      grouped[tz.group] = []
    }
    grouped[tz.group].push(tz)
  })
  return grouped
}

/**
 * Get user's current timezone (browser detected)
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format timezone label with offset
 */
export const formatTimezoneLabel = (timezoneValue) => {
  const tz = getTimezone(timezoneValue)
  if (!tz) return timezoneValue
  
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneValue,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(now)
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || ''
    
    return `${tz.label} (${timeZoneName})`
  } catch (e) {
    return tz.label
  }
}

