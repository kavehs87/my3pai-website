<template>
  <div class="mini-cal" aria-label="Mini calendar">
    <div class="cal-header">
      <button class="nav-btn" type="button" @click="prevMonth" title="Previous month">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="cal-month">{{ monthYear }}</div>
      <button class="nav-btn" type="button" @click="nextMonth" title="Next month">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <div class="cal-grid cal-dow">
      <div v-for="d in dow" :key="d" class="dow">{{ d }}</div>
    </div>
    <div class="cal-grid cal-days">
      <div v-for="n in leading" :key="'l'+n" class="day other"></div>
      <button
        v-for="d in daysInMonth"
        :key="d"
        type="button"
        class="day"
        :class="getDayClasses(d)"
        :title="dateTitle(d)"
        @click="handleDateClick(d, $event)"
      >
        <span class="day-number">{{ d }}</span>
        <span v-if="getDayNumber(d)" class="trip-badge">Day {{ getDayNumber(d) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniCalendar',
  props: {
    date: { type: Date, default: () => new Date() },
    tripDays: { type: Array, default: () => [] },
    selectedStartDate: { type: String, default: null }, // ISO date string
    selectedEndDate: { type: String, default: null },   // ISO date string
    currentDayDate: { type: String, default: null }     // Current day's date (YYYY-MM-DD)
  },
  emits: ['date-range-change', 'date-select'],
  data() {
    return {
      currentDate: new Date(this.date),
      startDate: null, // Internal selection state (Date object)
      endDate: null    // Internal selection state (Date object)
    }
  },
  mounted() {
    // Initialize from props
    if (this.selectedStartDate) {
      this.startDate = new Date(this.selectedStartDate)
    }
    if (this.selectedEndDate) {
      this.endDate = new Date(this.selectedEndDate)
    }
  },
  watch: {
    date(newDate) {
      this.currentDate = new Date(newDate)
    },
    selectedStartDate(newVal) {
      if (newVal) {
        this.startDate = new Date(newVal)
      } else {
        this.startDate = null
      }
    },
    selectedEndDate(newVal) {
      if (newVal) {
        this.endDate = new Date(newVal)
      } else {
        this.endDate = null
      }
    }
  },
  computed: {
    year() { return this.currentDate.getFullYear() },
    month() { return this.currentDate.getMonth() },
    firstOfMonth() { return new Date(this.year, this.month, 1) },
    leading() { return (this.firstOfMonth.getDay() + 6) % 7 }, // Monday-first
    daysInMonth() { return new Date(this.year, this.month + 1, 0).getDate() },
    monthYear() {
      return this.currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    },
    dow() { return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }
  },
  methods: {
    prevMonth() {
      this.currentDate = new Date(this.year, this.month - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.year, this.month + 1, 1)
    },
    isToday(d) {
      const now = new Date()
      return d === now.getDate() && this.month === now.getMonth() && this.year === now.getFullYear()
    },
    dateTitle(d) {
      const dt = new Date(this.year, this.month, d)
      return dt.toDateString()
    },
    getDayNumber(day) {
      if (!this.tripDays || !Array.isArray(this.tripDays) || this.tripDays.length === 0) return null
      const dt = new Date(this.year, this.month, day)
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      const idx = this.tripDays.findIndex(td => {
        if (!td || !td.date) return false
        const tdDate = new Date(td.date)
        const tdStr = `${tdDate.getFullYear()}-${String(tdDate.getMonth() + 1).padStart(2, '0')}-${String(tdDate.getDate()).padStart(2, '0')}`
        return tdStr === dateStr
      })
      return idx >= 0 ? idx + 1 : null
    },
    isDayEmpty(day) {
      // Check if the day has any events across all layers
      const dt = new Date(this.year, this.month, day)
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      
      const dayData = this.tripDays.find(td => {
        if (!td || !td.date) return false
        const tdDate = new Date(td.date)
        const tdStr = `${tdDate.getFullYear()}-${String(tdDate.getMonth() + 1).padStart(2, '0')}-${String(tdDate.getDate()).padStart(2, '0')}`
        return tdStr === dateStr
      })
      
      if (!dayData) return false // Not a trip day
      
      // Check if day has any layers with events
      if (!dayData.layers || !Array.isArray(dayData.layers)) return true
      
      const hasEvents = dayData.layers.some(layer => {
        return layer.events && Array.isArray(layer.events) && layer.events.length > 0
      })
      
      return !hasEvents
    },
    isCurrentDay(day) {
      if (!this.currentDayDate) return false
      const dt = new Date(this.year, this.month, day)
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      
      // Normalize currentDayDate for comparison
      let currentDateStr
      if (typeof this.currentDayDate === 'string') {
        if (this.currentDayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          currentDateStr = this.currentDayDate
        } else {
          const parts = this.currentDayDate.split('T')[0].split('-')
          const currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
          currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
        }
      } else {
        const currentDate = new Date(this.currentDayDate)
        currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      }
      
      return dateStr === currentDateStr
    },
    getDayClasses(day) {
      const dt = new Date(this.year, this.month, day)
      const classes = {
        today: this.isToday(day),
        'trip-day': !!this.getDayNumber(day),
        'empty-day': this.isDayEmpty(day),
        'current-day': this.isCurrentDay(day)
      }
      
      // Add range selection classes
      if (this.startDate || this.endDate) {
        const dayTime = dt.getTime()
        const startTime = this.startDate ? this.startDate.getTime() : null
        const endTime = this.endDate ? this.endDate.getTime() : null
        const hasStart = startTime !== null
        const hasEnd = endTime !== null
        
        // Start date
        if (hasStart && dayTime === startTime) {
          classes['range-start'] = true
        }
        // End date
        if (hasEnd && dayTime === endTime) {
          classes['range-end'] = true
        }
        // Range middle (between start and end)
        if (hasStart && hasEnd && dayTime > startTime && dayTime < endTime) {
          classes['range-middle'] = true
        }
        // If only start is selected and this day is after it
        if (hasStart && !hasEnd && dayTime > startTime) {
          classes['range-preview'] = true
        }
      }
      
      return classes
    },
    handleDateClick(day, event) {
      const clickedDate = new Date(this.year, this.month, day)
      // Normalize to midnight for accurate date-only comparison
      clickedDate.setHours(0, 0, 0, 0)
      // Format date in local timezone (not UTC) to avoid day shifts
      const yyyy = clickedDate.getFullYear()
      const mm = String(clickedDate.getMonth() + 1).padStart(2, '0')
      const dd = String(clickedDate.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`
      const clickedTime = clickedDate.getTime()
      
      // Check if Shift key is pressed - if so, always start new range selection
      const isShiftPressed = event && event.shiftKey
      
      // If both start and end are already set
      if (this.startDate && this.endDate) {
        // Normalize start and end to midnight for comparison
        const startDateNorm = new Date(this.startDate)
        startDateNorm.setHours(0, 0, 0, 0)
        const endDateNorm = new Date(this.endDate)
        endDateNorm.setHours(0, 0, 0, 0)
        
        const startTime = startDateNorm.getTime()
        const endTime = endDateNorm.getTime()
        const minTime = Math.min(startTime, endTime)
        const maxTime = Math.max(startTime, endTime)
        const isWithinRange = clickedTime >= minTime && clickedTime <= maxTime
        
        // If clicked date is WITHIN the current range (including start/end), switch to that day
        // If clicked date is OUTSIDE the range OR Shift is pressed, start new range selection
        if (isWithinRange && !isShiftPressed) {
          // Switch to clicked day - always emit even if already selected
          console.log('[MiniCalendar] Emitting date-select for date within range:', dateStr)
          this.$emit('date-select', dateStr)
          return
        } else {
          // Start new range selection (clicked outside range or Shift pressed)
          this.startDate = clickedDate
          this.endDate = null
          this.emitRangeChange()
          return
        }
      }
      
      // Hotel booking style: first click sets start, second click sets end
      if (!this.startDate) {
        // First click: set start date (already normalized to midnight)
        this.startDate = clickedDate
        this.endDate = null
        this.emitRangeChange()
      } else if (this.startDate && !this.endDate) {
        // Second click: set end date
        // Normalize start date for comparison
        const startDateNorm = new Date(this.startDate)
        startDateNorm.setHours(0, 0, 0, 0)
        
        if (clickedDate < startDateNorm) {
          // If clicked date is before start, swap them
          this.endDate = startDateNorm
          this.startDate = clickedDate
        } else {
          this.endDate = clickedDate
        }
        this.emitRangeChange()
      }
      
      // Also emit single date selection for day switching
      this.$emit('date-select', dateStr)
    },
    emitRangeChange() {
      const formatDate = (date) => {
        if (!date) return null
        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      }
      const start = formatDate(this.startDate)
      const end = formatDate(this.endDate)
      this.$emit('date-range-change', { start, end })
    }
  }
}
</script>

<style scoped>
.mini-cal { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); padding: 8px; color: var(--text-primary); }
.cal-header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 6px; gap: 8px; }
.cal-month { font-weight: 600; font-size: 13px; flex: 1; text-align: center; }
.nav-btn { background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: 6px; color: var(--text-secondary); cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; padding: 0; transition: all var(--transition-normal); }
.nav-btn:hover { background: var(--bg-primary); color: var(--text-primary); border-color: var(--border-light); }
.nav-btn i { font-size: 10px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-dow { margin-bottom: 4px; }
.dow { text-align:center; font-size: 10px; color: var(--text-secondary); }
.day { height: 28px; border-radius: 6px; background: var(--bg-secondary); border: 1px solid var(--border-light); color: var(--text-primary); font-size: 12px; display:flex; align-items:center; justify-content:center; flex-direction: column; position: relative; padding: 2px; }
.day-number { line-height: 1; }
.day.today { outline: 2px solid var(--secondary-color); outline-offset: 0; }
.day.trip-day { background: var(--secondary-light, rgba(230, 240, 255, 0.5)); border-color: var(--secondary-color); }
.day.trip-day.today { outline-color: var(--secondary-color); }
.day.other { visibility: hidden; }
button.day { cursor: pointer; transition: all 0.2s; }
button.day:hover { background: var(--bg-primary); border-color: var(--secondary-color); }
.trip-badge { position: absolute; bottom: 1px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: 600; color: var(--secondary-color); line-height: 1; white-space: nowrap; }

/* Empty day styling (days with no events) */
.day.empty-day {
  background: rgba(220, 220, 220, 0.3);
  border-color: rgba(180, 180, 180, 0.5);
  opacity: 0.6;
}
.day.empty-day.trip-day {
  background: rgba(220, 220, 220, 0.4);
}

/* Current day styling (the day being edited) */
.day.current-day {
  background: var(--primary-color, #6366f1) !important;
  color: white !important;
  border-color: var(--primary-color, #6366f1) !important;
  font-weight: 700;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  z-index: 10;
  position: relative;
}
.day.current-day .day-number {
  color: white;
}
.day.current-day.trip-badge {
  color: white;
  background: rgba(255, 255, 255, 0.3);
  padding: 1px 4px;
  border-radius: 3px;
}

/* Range selection styles (hotel booking style) */
.day.range-start {
  background: var(--secondary-color, #3b82f6);
  color: white;
  border-color: var(--secondary-color);
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  font-weight: 600;
}
.day.range-end {
  background: var(--secondary-color, #3b82f6);
  color: white;
  border-color: var(--secondary-color);
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  font-weight: 600;
}
.day.range-middle {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  border-left: none;
  border-right: none;
  border-radius: 0;
}
.day.range-preview {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}
.day.range-start.range-end {
  border-radius: 6px;
}

/* Current day takes precedence over range styles */
.day.current-day.range-start,
.day.current-day.range-end,
.day.current-day.range-middle {
  background: var(--primary-color, #6366f1) !important;
  color: white !important;
  border-color: var(--primary-color, #6366f1) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}
</style>


