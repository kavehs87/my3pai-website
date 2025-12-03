/**
 * Simplified timezone utility functions for UI-side timezone handling
 * All conversions happen on the frontend using browser's Intl API
 */

/**
 * Convert a time from one timezone to another
 * @param {string} timeString - Time in HH:MM format (e.g., "14:30")
 * @param {string} dateString - Date in YYYY-MM-DD format (e.g., "2025-12-03")
 * @param {string} fromTimezone - Source timezone (e.g., "Europe/Dublin")
 * @param {string} toTimezone - Target timezone (e.g., "Asia/Tehran")
 * @returns {string} - Time in HH:MM format in target timezone
 */
export function convertTime(timeString, dateString, fromTimezone, toTimezone) {
  if (!timeString || !dateString || !fromTimezone || !toTimezone || fromTimezone === toTimezone) {
    return timeString
  }

  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    const [year, month, day] = dateString.split('-').map(Number)
    
    // Create a date object representing this time in the source timezone
    // We'll create it in UTC first, then adjust by the timezone offset
    
    // Create date components in UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
    
    // Get the offset difference between source and target timezones at this date
    const sourceOffset = getTimezoneOffsetMinutes(fromTimezone, utcDate)
    const targetOffset = getTimezoneOffsetMinutes(toTimezone, utcDate)
    const offsetDiff = targetOffset - sourceOffset
    
    // Adjust the time by the offset difference
    const totalMinutes = hours * 60 + minutes + offsetDiff
    const adjustedHours = ((Math.floor(totalMinutes / 60) % 24) + 24) % 24
    const adjustedMins = ((totalMinutes % 60) + 60) % 60
    
    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMins).padStart(2, '0')}`
  } catch (error) {
    console.error('Error converting time:', error)
    return timeString
  }
}

/**
 * Get timezone offset in minutes for a specific timezone at a specific date
 */
function getTimezoneOffsetMinutes(timezone, date) {
  try {
    // Use Intl.DateTimeFormat to get the timezone offset
    // Format the date in UTC and in the target timezone
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    // Get what time it is in UTC vs the timezone for the same moment
    const utcParts = utcFormatter.formatToParts(date)
    const tzParts = tzFormatter.formatToParts(date)
    
    const utcHour = parseInt(utcParts.find(p => p.type === 'hour').value)
    const utcMin = parseInt(utcParts.find(p => p.type === 'minute').value)
    const tzHour = parseInt(tzParts.find(p => p.type === 'hour').value)
    const tzMin = parseInt(tzParts.find(p => p.type === 'minute').value)
    
    const utcTotalMin = utcHour * 60 + utcMin
    const tzTotalMin = tzHour * 60 + tzMin
    
    // Return offset in minutes (positive means ahead of UTC)
    return tzTotalMin - utcTotalMin
  } catch (error) {
    console.error('Error getting timezone offset:', error)
    return 0
  }
}

/**
 * Format time with 12-hour format (AM/PM)
 */
export function formatTime12Hour(timeString) {
  if (!timeString) return ''
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    const hour12 = hours % 12 || 12
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`
  } catch (error) {
    console.error('Error formatting time:', error)
    return timeString
  }
}

/**
 * Check if a time slot is in the past (in a specific timezone)
 */
export function isTimeSlotPast(timeString, dateString, timezone) {
  if (!timeString || !dateString || !timezone) return false
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    const [year, month, day] = dateString.split('-').map(Number)
    
    // Get current date/time in the target timezone
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    const parts = formatter.formatToParts(now)
    const nowYear = parseInt(parts.find(p => p.type === 'year').value)
    const nowMonth = parseInt(parts.find(p => p.type === 'month').value) - 1
    const nowDay = parseInt(parts.find(p => p.type === 'day').value)
    const nowHour = parseInt(parts.find(p => p.type === 'hour').value)
    const nowMinute = parseInt(parts.find(p => p.type === 'minute').value)
    
    // Compare dates
    if (year < nowYear) return true
    if (year > nowYear) return false
    if (month - 1 < nowMonth) return true
    if (month - 1 > nowMonth) return false
    if (day < nowDay) return true
    if (day > nowDay) return false
    
    // Same date, compare times (with 5 minute buffer)
    const slotMinutes = hours * 60 + minutes
    const nowMinutes = nowHour * 60 + nowMinute
    const bufferMinutes = 5
    
    return slotMinutes < (nowMinutes - bufferMinutes)
  } catch (error) {
    console.error('Error checking if time slot is past:', error)
    return false
  }
}

/**
 * Convert datetime from customer timezone to UTC for booking
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in HH:MM format (in customer's browser timezone)
 * @param {string} customerTimezone - Customer's timezone (browser timezone)
 * @returns {string} - ISO 8601 string in UTC
 */
export function convertDateTimeToUTC(dateString, timeString, customerTimezone) {
  if (!dateString || !timeString || !customerTimezone) {
    return null
  }

  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    const [year, month, day] = dateString.split('-').map(Number)
    
    // Create a date object representing this time in customer's timezone
    // Create date components
    const date = new Date(year, month - 1, day, hours, minutes, 0)
    
    // Get the offset for customer's timezone at this date
    const utcEquivalent = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
    const offsetMinutes = getTimezoneOffsetMinutes(customerTimezone, utcEquivalent)
    
    // Adjust UTC date by the offset to get the actual UTC time
    const actualUTC = new Date(utcEquivalent.getTime() - (offsetMinutes * 60 * 1000))
    
    return actualUTC.toISOString()
  } catch (error) {
    console.error('Error converting datetime to UTC:', error)
    return null
  }
}
