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
                @dragstart="onDragStart($event, toPayload(sec.id, item), sec.id)"
                @dragend="onDragEnd"
                :title="item.title"
              >
                <i :class="item.icon"></i>
                <div class="item-content">
                  <div class="item-title-row">
                    <span class="ellipsis item-title">{{ item.title }}</span>
                    <span v-if="item.budget" class="budget-tag" :class="'budget-' + item.budget">{{ item.budget }}</span>
                  </div>
                  <div class="item-meta">
                    <div v-if="item.rating" class="rating">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'filled': n <= item.rating, 'empty': n > item.rating }"></i>
                      <span class="rating-value">{{ item.rating }}</span>
                    </div>
                    <div v-if="item.note" class="item-note" :title="item.note">
                      <i class="fas fa-info-circle"></i><span>{{ item.note }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { setDragLayerId, clearDragLayerId } from './dragState.js'

const ITEM_HEIGHT = 56
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
      { key: 'hotel-lutetia', title: 'Hotel Lutetia', icon: 'fas fa-hotel', coords: [48.8516, 2.3254], rating: 4.5, budget: 'high', note: 'Pet friendly' },
      { key: 'le-bristol', title: 'Le Bristol Paris', icon: 'fas fa-hotel', coords: [48.8718, 2.3132], rating: 5, budget: 'high' },
      { key: 'ritz-paris', title: 'Ritz Paris', icon: 'fas fa-hotel', coords: [48.8686, 2.3285], rating: 5, budget: 'high', note: 'Dress code required' },
      { key: 'regina-louvre', title: 'Hotel Regina Louvre', icon: 'fas fa-hotel', coords: [48.8635, 2.3319], rating: 4.3, budget: 'medium' },
      { key: 'pullman-eiffel', title: 'Pullman Paris Tour Eiffel', icon: 'fas fa-hotel', coords: [48.8553, 2.2933], rating: 4.2, budget: 'medium', note: 'Not pet friendly' },
      { key: 'le-six', title: 'Hotel Le Six', icon: 'fas fa-hotel', coords: [48.8437, 2.3231], rating: 4.0, budget: 'medium' },
      { key: 'citizenm-ce', title: 'citizenM Champs-Élysées', icon: 'fas fa-hotel', coords: [48.8693, 2.3047], rating: 4.4, budget: 'medium' },
      { key: 'crillon', title: 'Hôtel de Crillon', icon: 'fas fa-hotel', coords: [48.8680, 2.3212], rating: 5, budget: 'high', note: 'Dress code required' },
      { key: 'pont-neuf', title: 'Maison Albar Le Pont-Neuf', icon: 'fas fa-hotel', coords: [48.8601, 2.3452], rating: 4.6, budget: 'medium' },
      { key: 'dorsay-hotel', title: "Hôtel d'Orsay", icon: 'fas fa-hotel', coords: [48.8593, 2.3255], rating: 4.1, budget: 'low' }
    ]
    const act = [
      { key: 'eiffel', title: 'Eiffel Tower', icon: 'fas fa-landmark', coords: [48.8584, 2.2945], durationMin: 120, rating: 4.8, budget: 'medium', note: 'Advance booking recommended' },
      { key: 'louvre', title: 'Louvre Museum', icon: 'fas fa-landmark', coords: [48.8606, 2.3376], durationMin: 150, rating: 4.9, budget: 'medium', note: 'Free entry first Sunday of month' },
      { key: 'notre-dame', title: 'Notre-Dame Cathedral', icon: 'fas fa-church', coords: [48.8530, 2.3499], durationMin: 60, rating: 4.7, budget: 'low' },
      { key: 'sacre-coeur', title: 'Sacré-Cœur & Montmartre', icon: 'fas fa-church', coords: [48.8867, 2.3431], durationMin: 90, rating: 4.6, budget: 'low', note: 'Modest dress required' },
      { key: 'seine-cruise', title: 'Seine River Cruise', icon: 'fas fa-ship', coords: [48.8589, 2.3123], durationMin: 60, rating: 4.5, budget: 'medium' },
      { key: 'orsay', title: "Musée d'Orsay", icon: 'fas fa-landmark', coords: [48.8600, 2.3266], durationMin: 120, rating: 4.7, budget: 'medium' },
      { key: 'lux-gardens', title: 'Luxembourg Gardens', icon: 'fas fa-tree', coords: [48.8462, 2.3371], durationMin: 60, rating: 4.6, budget: 'low', note: 'Pet friendly' },
      { key: 'arc', title: 'Arc de Triomphe', icon: 'fas fa-archway', coords: [48.8738, 2.2950], durationMin: 45, rating: 4.4, budget: 'low' },
      { key: 'sainte-chapelle', title: 'Sainte-Chapelle', icon: 'fas fa-church', coords: [48.8554, 2.3450], durationMin: 45, rating: 4.8, budget: 'medium', note: 'Stained glass viewing time limited' },
      { key: 'versailles', title: 'Versailles Day Trip', icon: 'fas fa-crown', coords: [48.8049, 2.1204], durationMin: 240, rating: 4.9, budget: 'high', note: 'Full day required' }
    ]
    const food = [
      { key: 'cafe-de-flore', title: 'Café de Flore', icon: 'fas fa-mug-hot', coords: [48.8546, 2.3339], durationMin: 60, rating: 4.3, budget: 'medium', note: 'Reservations recommended' },
      { key: 'les-deux-magots', title: 'Les Deux Magots', icon: 'fas fa-mug-hot', coords: [48.8553, 2.3330], durationMin: 60, rating: 4.2, budget: 'medium' },
      { key: 'breizh-cafe', title: 'Breizh Café', icon: 'fas fa-utensils', coords: [48.8577, 2.3601], durationMin: 60, rating: 4.6, budget: 'low', note: 'Pet friendly' },
      { key: 'las-du-fallafel', title: "L'As du Fallafel", icon: 'fas fa-utensils', coords: [48.8570, 2.3619], durationMin: 45, rating: 4.4, budget: 'low' },
      { key: 'le-comptoir', title: 'Le Comptoir du Relais', icon: 'fas fa-utensils', coords: [48.8529, 2.3375], durationMin: 75, rating: 4.7, budget: 'medium', note: 'Dress code: smart casual' },
      { key: 'paul-bert', title: 'Bistrot Paul Bert', icon: 'fas fa-utensils', coords: [48.8537, 2.3841], durationMin: 90, rating: 4.8, budget: 'medium' },
      { key: 'angelina', title: 'Angelina (Hot Chocolate)', icon: 'fas fa-ice-cream', coords: [48.8661, 2.3266], durationMin: 45, rating: 4.5, budget: 'medium' },
      { key: 'pierre-herme', title: 'Pierre Hermé (Macarons)', icon: 'fas fa-cookie-bite', coords: [48.8519, 2.3327], durationMin: 30, rating: 4.9, budget: 'low' },
      { key: 'septime', title: 'Septime', icon: 'fas fa-utensils', coords: [48.8530, 2.3807], durationMin: 120, rating: 4.8, budget: 'high', note: 'Reservation required months ahead' },
      { key: 'frenchie', title: 'Frenchie', icon: 'fas fa-utensils', coords: [48.8688, 2.3473], durationMin: 120, rating: 4.9, budget: 'high', note: 'Tasting menu only' }
    ]
    const transport = [
      { key: 'metro-l1', title: 'Metro Line 1 Ride', icon: 'fas fa-subway', coords: [48.8656, 2.3211], durationMin: 25, rating: 4.2, budget: 'low' },
      { key: 'rer-a', title: 'RER A to Disneyland', icon: 'fas fa-train', coords: [48.8763, 2.3574], durationMin: 45, rating: 4.0, budget: 'low', note: '40 min travel time' },
      { key: 'taxi-left-bank', title: 'Taxi Transfer (Left Bank)', icon: 'fas fa-taxi', coords: [48.8530, 2.3499], durationMin: 35, rating: 4.3, budget: 'medium' },
      { key: 'bus-42', title: 'Bus 42 Ride', icon: 'fas fa-bus', coords: [48.8738, 2.2950], durationMin: 30, rating: 4.1, budget: 'low' },
      { key: 'uber-montmartre', title: 'Uber to Montmartre', icon: 'fas fa-car-side', coords: [48.8867, 2.3431], durationMin: 25, rating: 4.5, budget: 'medium' },
      { key: 'velib', title: 'Vélib Bike Ride', icon: 'fas fa-bicycle', coords: [48.8566, 2.3522], durationMin: 20, rating: 4.4, budget: 'low', note: 'Requires app registration' },
      { key: 'rer-c-versailles', title: 'RER C to Versailles', icon: 'fas fa-train', coords: [48.8566, 2.3270], durationMin: 40, rating: 4.2, budget: 'low', note: '30 min travel time' },
      { key: 'metro-l4', title: 'Metro Line 4 Ride', icon: 'fas fa-subway', coords: [48.8440, 2.3290], durationMin: 20, rating: 4.1, budget: 'low' },
      { key: 'tgv-lyon', title: 'TGV from Gare de Lyon', icon: 'fas fa-train', coords: [48.8443, 2.3730], durationMin: 15, rating: 4.6, budget: 'high', note: 'Fast train - book ahead' },
      { key: 'cdg-transfer', title: 'Airport Transfer (CDG)', icon: 'fas fa-plane-departure', coords: [49.0097, 2.5479], durationMin: 45, rating: 4.4, budget: 'high', note: '45 min to airport' }
    ]
    this.sections = [
      { id: 'accommodation', title: 'Accommodation', icon: 'fas fa-bed', items: acc },
      { id: 'activities', title: 'Activities', icon: 'fas fa-border-all', items: act },
      { id: 'food', title: 'Food & Drink', icon: 'fas fa-utensils', items: food },
      { id: 'transport', title: 'Transportation', icon: 'fas fa-plane', items: transport }
    ]
  },
  watch: {
    search(newVal) {
      if (!newVal || !newVal.trim()) {
        // Clear search: close all categories
        Object.keys(this.expanded).forEach(k => { this.expanded[k] = false })
      } else {
        // Search active: auto-expand categories with matching items
        const q = newVal.toLowerCase().trim()
        this.sections.forEach(sec => {
          const hasMatches = sec.items.some(it => it.title.toLowerCase().includes(q))
          this.expanded[sec.id] = hasMatches
          // Close others if accordion behavior is desired; otherwise keep all matching open
          // For now, keep all matching categories open
        })
      }
    }
  },
  methods: {
    toPayload(layerId, item) {
      const coords = item.coords || (layerId === 'accommodation' ? [48.8738, 2.295] : layerId === 'activities' ? [48.8584, 2.2945] : layerId === 'food' ? [48.8546, 2.3339] : [48.8586, 2.3477])
      const type = layerId === 'food' ? 'meal' : (layerId === 'transport' ? 'transport' : (layerId === 'accommodation' ? 'accommodation' : 'activity'))
      const durationMin = item.durationMin || (type === 'transport' ? 30 : (type === 'meal' ? 60 : 90))
      return { layerId, title: item.title, coords, type, durationMin }
    },
    onDragStart(e, payload, layerId) {
      try { e.dataTransfer.setData('application/json', JSON.stringify(payload)) } catch (err) {}
      e.dataTransfer.effectAllowed = 'copy'
      setDragLayerId(layerId)
    },
    onDragEnd() {
      clearDragLayerId()
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
.draggable-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); cursor: grab; color: var(--text-primary); min-height: 36px; box-sizing: border-box; }
.draggable-item i:first-child { width: 16px; text-align: center; color: var(--text-secondary); margin-top: 2px; flex-shrink: 0; }
.draggable-item:active { cursor: grabbing; }
.item-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.item-title-row { display: flex; align-items: center; gap: 6px; }
.item-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
.budget-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; flex-shrink: 0; }
.budget-low { background: rgba(16,185,129,0.15); color: #10b981; }
.budget-medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
.budget-high { background: rgba(239,68,68,0.15); color: #ef4444; }
.item-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11px; }
.rating { display: flex; align-items: center; gap: 3px; }
.rating .fa-star { font-size: 10px; }
.rating .fa-star.filled { color: #fbbf24; }
.rating .fa-star.empty { color: var(--border-light); }
.rating-value { color: var(--text-secondary); font-size: 10px; margin-left: 2px; }
.item-note { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); }
.item-note i { font-size: 10px; color: #3b82f6; }
.item-note span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Tablet & Mobile: compact layout */
@media (max-width: 1024px) {
  .sidebar { padding: 8px; }
  .section-title { font-size: 12px; }
  .draggable-item { padding: 6px 8px; min-height: 48px; }
  .virt-wrap { max-height: 180px; }
  .item-meta { font-size: 10px; }
  .budget-tag { font-size: 9px; padding: 1px 4px; }
}
</style>


