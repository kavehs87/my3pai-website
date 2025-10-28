<template>
  <div class="event" :style="styleObject" draggable="true" @dragstart="onDragStart" @dragend="onDragEnd">
    <span class="title">{{ event.title }}</span>
    <span class="time">{{ event.start }}–{{ event.end }}</span>
  </div>
</template>

<script>
export default {
  name: 'EventBlock',
  props: { event: Object, hours: Object },
  computed: {
    styleObject() {
      const [sh, sm] = this.hours.start.split(':').map(Number)
      const [eh, em] = this.hours.end.split(':').map(Number)
      const total = (eh * 60 + em) - (sh * 60 + sm)
      const [stH, stM] = this.event.start.split(':').map(Number)
      const [enH, enM] = this.event.end.split(':').map(Number)
      const startMin = (stH * 60 + stM) - (sh * 60 + sm)
      const endMin = (enH * 60 + enM) - (sh * 60 + sm)
      const left = `${(startMin / total) * 100}%`
      const width = `${((endMin - startMin) / total) * 100}%`
      return { left, width }
    }
  },
  methods: {
    onDragStart() {},
    onDragEnd() {}
  }
}
</script>

<style scoped>
.event { position: absolute; top: 6px; height: 40px; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-sm); display:flex; align-items:center; gap:8px; padding: 0 10px; cursor: grab; }
.event .title { color: var(--text-primary); font-weight: 600; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event .time { color: var(--text-secondary); font-size: 11px; }
</style>


