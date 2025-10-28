<template>
  <div class="timeline">
    <div v-for="(tick, i) in ticks" :key="i" class="tick" :style="{ left: tick.left }">
      <span>{{ tick.label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: { hours: Object },
  computed: {
    ticks() {
      const out = []
      const [sh, sm] = this.hours.start.split(':').map(Number)
      const [eh, em] = this.hours.end.split(':').map(Number)
      const total = (eh * 60 + em) - (sh * 60 + sm)
      for (let m = 0; m <= total; m += 60) {
        const h = sh + Math.floor(m / 60)
        const label = `${h.toString().padStart(2, '0')}:00`
        const left = `${(m / total) * 100}%`
        out.push({ label, left })
      }
      return out
    }
  }
}
</script>

<style scoped>
.timeline { position: relative; height: 32px; background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: 8px; box-shadow: var(--shadow-light); }
.tick { position: absolute; top: 0; transform: translateX(-50%); color: var(--text-secondary); font-size: 12px; }
.tick span { position: relative; top: 6px; }
</style>


