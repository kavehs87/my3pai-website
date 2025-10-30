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
    // Meaningful mock catalogs (~10 each)
    const acc = [
      { key: 'hotel-lutetia', title: 'Hotel Lutetia', icon: 'fas fa-hotel', coords: [48.8516, 2.3254] },
      { key: 'le-bristol', title: 'Le Bristol Paris', icon: 'fas fa-hotel', coords: [48.8718, 2.3132] },
      { key: 'ritz-paris', title: 'Ritz Paris', icon: 'fas fa-hotel', coords: [48.8686, 2.3285] },
      { key: 'regina-louvre', title: 'Hotel Regina Louvre', icon: 'fas fa-hotel', coords: [48.8635, 2.3319] },
      { key: 'pullman-eiffel', title: 'Pullman Paris Tour Eiffel', icon: 'fas fa-hotel', coords: [48.8553, 2.2933] },
      { key: 'le-six', title: 'Hotel Le Six', icon: 'fas fa-hotel', coords: [48.8437, 2.3231] },
      { key: 'citizenm-ce', title: 'citizenM Champs-Élysées', icon: 'fas fa-hotel', coords: [48.8693, 2.3047] },
      { key: 'crillon', title: 'Hôtel de Crillon', icon: 'fas fa-hotel', coords: [48.8680, 2.3212] },
      { key: 'pont-neuf', title: 'Maison Albar Le Pont-Neuf', icon: 'fas fa-hotel', coords: [48.8601, 2.3452] },
      { key: 'dorsay-hotel', title: "Hôtel d'Orsay", icon: 'fas fa-hotel', coords: [48.8593, 2.3255] }
    ]
    const act = [
      { key: 'eiffel', title: 'Eiffel Tower', icon: 'fas fa-landmark', coords: [48.8584, 2.2945], durationMin: 120 },
      { key: 'louvre', title: 'Louvre Museum', icon: 'fas fa-landmark', coords: [48.8606, 2.3376], durationMin: 150 },
      { key: 'notre-dame', title: 'Notre-Dame Cathedral', icon: 'fas fa-church', coords: [48.8530, 2.3499], durationMin: 60 },
      { key: 'sacre-coeur', title: 'Sacré-Cœur & Montmartre', icon: 'fas fa-church', coords: [48.8867, 2.3431], durationMin: 90 },
      { key: 'seine-cruise', title: 'Seine River Cruise', icon: 'fas fa-ship', coords: [48.8589, 2.3123], durationMin: 60 },
      { key: 'orsay', title: 'Musée d’Orsay', icon: 'fas fa-landmark', coords: [48.8600, 2.3266], durationMin: 120 },
      { key: 'lux-gardens', title: 'Luxembourg Gardens', icon: 'fas fa-tree', coords: [48.8462, 2.3371], durationMin: 60 },
      { key: 'arc', title: 'Arc de Triomphe', icon: 'fas fa-archway', coords: [48.8738, 2.2950], durationMin: 45 },
      { key: 'sainte-chapelle', title: 'Sainte-Chapelle', icon: 'fas fa-church', coords: [48.8554, 2.3450], durationMin: 45 },
      { key: 'versailles', title: 'Versailles Day Trip', icon: 'fas fa-crown', coords: [48.8049, 2.1204], durationMin: 240 }
    ]
    const food = [
      { key: 'cafe-de-flore', title: 'Café de Flore', icon: 'fas fa-mug-hot', coords: [48.8546, 2.3339], durationMin: 60 },
      { key: 'les-deux-magots', title: 'Les Deux Magots', icon: 'fas fa-mug-hot', coords: [48.8553, 2.3330], durationMin: 60 },
      { key: 'breizh-cafe', title: 'Breizh Café', icon: 'fas fa-utensils', coords: [48.8577, 2.3601], durationMin: 60 },
      { key: 'las-du-fallafel', title: "L'As du Fallafel", icon: 'fas fa-utensils', coords: [48.8570, 2.3619], durationMin: 45 },
      { key: 'le-comptoir', title: 'Le Comptoir du Relais', icon: 'fas fa-utensils', coords: [48.8529, 2.3375], durationMin: 75 },
      { key: 'paul-bert', title: 'Bistrot Paul Bert', icon: 'fas fa-utensils', coords: [48.8537, 2.3841], durationMin: 90 },
      { key: 'angelina', title: 'Angelina (Hot Chocolate)', icon: 'fas fa-ice-cream', coords: [48.8661, 2.3266], durationMin: 45 },
      { key: 'pierre-herme', title: 'Pierre Hermé (Macarons)', icon: 'fas fa-cookie-bite', coords: [48.8519, 2.3327], durationMin: 30 },
      { key: 'septime', title: 'Septime', icon: 'fas fa-utensils', coords: [48.8530, 2.3807], durationMin: 120 },
      { key: 'frenchie', title: 'Frenchie', icon: 'fas fa-utensils', coords: [48.8688, 2.3473], durationMin: 120 }
    ]
    const transport = [
      { key: 'metro-l1', title: 'Metro Line 1 Ride', icon: 'fas fa-subway', coords: [48.8656, 2.3211], durationMin: 25 },
      { key: 'rer-a', title: 'RER A to Disneyland', icon: 'fas fa-train', coords: [48.8763, 2.3574], durationMin: 45 },
      { key: 'taxi-left-bank', title: 'Taxi Transfer (Left Bank)', icon: 'fas fa-taxi', coords: [48.8530, 2.3499], durationMin: 35 },
      { key: 'bus-42', title: 'Bus 42 Ride', icon: 'fas fa-bus', coords: [48.8738, 2.2950], durationMin: 30 },
      { key: 'uber-montmartre', title: 'Uber to Montmartre', icon: 'fas fa-car-side', coords: [48.8867, 2.3431], durationMin: 25 },
      { key: 'velib', title: 'Vélib Bike Ride', icon: 'fas fa-bicycle', coords: [48.8566, 2.3522], durationMin: 20 },
      { key: 'rer-c-versailles', title: 'RER C to Versailles', icon: 'fas fa-train', coords: [48.8566, 2.3270], durationMin: 40 },
      { key: 'metro-l4', title: 'Metro Line 4 Ride', icon: 'fas fa-subway', coords: [48.8440, 2.3290], durationMin: 20 },
      { key: 'tgv-lyon', title: 'TGV from Gare de Lyon', icon: 'fas fa-train', coords: [48.8443, 2.3730], durationMin: 15 },
      { key: 'cdg-transfer', title: 'Airport Transfer (CDG)', icon: 'fas fa-plane-departure', coords: [49.0097, 2.5479], durationMin: 45 }
    ]
    this.sections = [
      { id: 'accommodation', title: 'Accommodation', icon: 'fas fa-bed', items: acc },
      { id: 'activities', title: 'Activities', icon: 'fas fa-border-all', items: act },
      { id: 'food', title: 'Food & Drink', icon: 'fas fa-utensils', items: food },
      { id: 'transport', title: 'Transportation', icon: 'fas fa-plane', items: transport }
    ]
  },
  methods: {
    toPayload(layerId, item) {
      const coords = item.coords || (layerId === 'accommodation' ? [48.8738, 2.295] : layerId === 'activities' ? [48.8584, 2.2945] : layerId === 'food' ? [48.8546, 2.3339] : [48.8586, 2.3477])
      const type = layerId === 'food' ? 'meal' : (layerId === 'transport' ? 'transport' : (layerId === 'accommodation' ? 'accommodation' : 'activity'))
      const durationMin = item.durationMin || (type === 'transport' ? 30 : (type === 'meal' ? 60 : 90))
      return { layerId, title: item.title, coords, type, durationMin }
    },
    onDragStart(e, payload) {
      try { e.dataTransfer.setData('application/json', JSON.stringify(payload)) } catch (err) {}
      e.dataTransfer.effectAllowed = 'copy'
    },
    toggle(id) {
      const wasOpen = this.expanded[id]
      // Close all sections
      Object.keys(this.expanded).forEach(k => { this.expanded[k] = false })
      // If the clicked one was closed, open it now
      if (!wasOpen) this.expanded[id] = true
    },
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


