<template>
  <aside class="sidebar">
    <div class="sidebar-search">
      <i class="fas fa-search"></i>
      <input class="search-input" type="text" v-model="search" placeholder="Quick search..." />
    </div>
    <div class="sidebar-section">
      <div v-for="sec in sections" :key="sec.id" class="section-block">
        <button class="section-title" type="button" @click="toggle(sec.id)">
          <i :class="sec.icon"></i><span>{{ sec.title }}</span>
          <i class="fas" :class="expanded[sec.id] ? 'fa-chevron-up' : 'fa-chevron-down'" style="margin-left:auto;color:var(--text-tertiary);"></i>
        </button>
        <div v-show="expanded[sec.id]" class="virt-wrap" @scroll="onScroll(sec.id, $event)" ref="virtWraps">
          <div class="spacer" :style="{ height: totalHeightPx(sec) + 'px' }">
            <div class="virt-inner" :style="{ transform: `translateY(${translateTopPx(sec)}px)` }">
              <div
                v-for="item in visibleSlice(sec)"
                :key="item.key"
                class="draggable-item"
                draggable="true"
                @dragstart="onDragStart($event, toPayload(sec.id, item))"
                :title="item.title"
              >
                <i :class="item.icon"></i><span class="ellipsis">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
const ITEM_HEIGHT = 36
const VIEW_ITEMS = 12
const BUFFER = 6

export default {
  name: 'StudioSidebar',
  data() {
    return {
      search: '',
      expanded: { accommodation: false, activities: false, food: false, transport: false },
      scrollTopBySection: {},
      sections: []
    }
  },
  created() {
    // Generate mock catalogs (could be fetched later)
    const make = (n, prefix, icon) => Array.from({ length: n }, (_, i) => ({ key: `${prefix}-${i+1}`, title: `${prefix} ${i+1}`, icon }))
    this.sections = [
      { id: 'accommodation', title: 'Accommodation', icon: 'fas fa-bed', items: make(400, 'Hotel', 'fas fa-hotel') },
      { id: 'activities', title: 'Activities', icon: 'fas fa-border-all', items: make(250, 'Activity', 'fas fa-person-hiking') },
      { id: 'food', title: 'Food & Drink', icon: 'fas fa-utensils', items: make(200, 'Place', 'fas fa-mug-hot') },
      { id: 'transport', title: 'Transportation', icon: 'fas fa-plane', items: make(150, 'Transfer', 'fas fa-taxi') }
    ]
  },
  methods: {
    toPayload(layerId, item) {
      // Default coords mock; in real app these come from the item
      const coords = layerId === 'accommodation' ? [48.8738, 2.295] : layerId === 'activities' ? [48.8584, 2.2945] : layerId === 'food' ? [48.8546, 2.3339] : [48.8586, 2.3477]
      const type = layerId === 'food' ? 'meal' : (layerId === 'transport' ? 'transport' : (layerId === 'accommodation' ? 'accommodation' : 'activity'))
      return { layerId, title: item.title, coords, type, durationMin: type === 'transport' ? 30 : (type === 'meal' ? 60 : 90) }
    },
    onDragStart(e, payload) {
      try { e.dataTransfer.setData('application/json', JSON.stringify(payload)) } catch (err) {}
      e.dataTransfer.effectAllowed = 'copy'
    },
    toggle(id) { this.expanded[id] = !this.expanded[id] },
    onScroll(id, evt) { this.$set(this.scrollTopBySection, id, evt.target.scrollTop) },
    filtered(sec) {
      if (!this.search) return sec.items
      const q = this.search.toLowerCase()
      return sec.items.filter(it => it.title.toLowerCase().includes(q))
    },
    totalHeightPx(sec) { return this.filtered(sec).length * ITEM_HEIGHT },
    startIndex(sec) {
      const top = this.scrollTopBySection[sec.id] || 0
      return Math.max(0, Math.floor(top / ITEM_HEIGHT) - BUFFER)
    },
    endIndex(sec) {
      const top = this.scrollTopBySection[sec.id] || 0
      const container = this.$refs.virtWraps && this.$refs.virtWraps[0] ? this.$refs.virtWraps[0] : null
      const vh = container ? container.clientHeight : VIEW_ITEMS * ITEM_HEIGHT
      return Math.min(this.filtered(sec).length, Math.ceil((top + vh) / ITEM_HEIGHT) + BUFFER)
    },
    translateTopPx(sec) { return this.startIndex(sec) * ITEM_HEIGHT },
    visibleSlice(sec) {
      const all = this.filtered(sec)
      return all.slice(this.startIndex(sec), this.endIndex(sec))
    }
  }
}
</script>

<style scoped>
.sidebar { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-light); height: fit-content; }
.sidebar-search { display:flex; align-items:center; gap:8px; padding: 6px 8px; border:1px solid var(--border-light); border-radius: 8px; background: var(--bg-secondary); margin-bottom: 10px; }
.sidebar-search i { color: var(--text-secondary); width: 14px; text-align:center; }
.search-input { flex:1; border:none; outline:none; background:transparent; color: var(--text-primary); }

.sidebar-section { display: flex; flex-direction: column; gap: 14px; }
.section-block { display: flex; flex-direction: column; gap: 8px; }
.section-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-primary); background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px 10px; cursor: pointer; }
.section-title i { color: var(--text-secondary); width: 16px; text-align: center; }

.virt-wrap { max-height: 220px; overflow: auto; border: 1px dashed var(--border-light); border-radius: 8px; background: var(--bg-primary); }
.spacer { position: relative; width: 100%; }
.virt-inner { position: absolute; left: 0; right: 0; top: 0; }

.items { display: flex; flex-direction: column; gap: 6px; }
.draggable-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); cursor: grab; color: var(--text-primary); height: 36px; box-sizing: border-box; }
.draggable-item i { width: 16px; text-align: center; color: var(--text-secondary); }
.draggable-item:active { cursor: grabbing; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Tablet & Mobile: compact layout */
@media (max-width: 1024px) {
  .sidebar { padding: 8px; }
  .section-title { font-size: 12px; }
  .draggable-item { padding: 6px 8px; height: 32px; }
  .virt-wrap { max-height: 180px; }
}
</style>


