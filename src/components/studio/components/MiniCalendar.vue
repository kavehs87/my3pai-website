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
        :class="{ today: isToday(d), 'trip-day': getDayNumber(d) }"
        :title="dateTitle(d)"
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
    tripDays: { type: Array, default: () => [] }
  },
  data() {
    return {
      currentDate: new Date(this.date)
    }
  },
  watch: {
    date(newDate) {
      this.currentDate = new Date(newDate)
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
button.day { cursor: default; }
.trip-badge { position: absolute; bottom: 1px; left: 50%; transform: translateX(-50%); font-size: 8px; font-weight: 600; color: var(--secondary-color); line-height: 1; white-space: nowrap; }
</style>


