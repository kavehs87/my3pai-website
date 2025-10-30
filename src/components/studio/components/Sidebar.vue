<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="section-block">
        <div class="section-title"><i class="fas fa-bed"></i><span>Accommodation</span></div>
        <div class="items">
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'accommodation', title: 'Hotel Astoria', coords: [48.8738, 2.2950], type: 'accommodation', durationMin: 90 })">
            <i class="fas fa-hotel"></i><span>Hotel Astoria</span>
          </div>
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'accommodation', title: 'Le Grand Hotel', coords: [48.8698, 2.3070], type: 'accommodation', durationMin: 90 })">
            <i class="fas fa-hotel"></i><span>Le Grand Hotel</span>
          </div>
        </div>
      </div>
      <div class="section-block">
        <div class="section-title"><i class="fas fa-border-all"></i><span>Activities</span></div>
        <div class="items">
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'activities', title: 'Eiffel Tower', coords: [48.8584, 2.2945], type: 'activity', durationMin: 120 })">
            <i class="fas fa-landmark"></i><span>Eiffel Tower</span>
          </div>
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'activities', title: 'Seine Cruise', coords: [48.8566, 2.3522], type: 'activity', durationMin: 60 })">
            <i class="fas fa-ship"></i><span>Seine Cruise</span>
          </div>
        </div>
      </div>
      <div class="section-block">
        <div class="section-title"><i class="fas fa-utensils"></i><span>Food & Drink</span></div>
        <div class="items">
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'food', title: 'Cafe de Flore', coords: [48.8546, 2.3339], type: 'meal', durationMin: 60 })">
            <i class="fas fa-mug-hot"></i><span>Cafe de Flore</span>
          </div>
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'food', title: 'Bistrot Dinner', coords: [48.8625, 2.3358], type: 'meal', durationMin: 75 })">
            <i class="fas fa-utensils"></i><span>Bistrot Dinner</span>
          </div>
        </div>
      </div>
      <div class="section-block">
        <div class="section-title"><i class="fas fa-plane"></i><span>Transportation</span></div>
        <div class="items">
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'transport', title: 'Metro Ride', coords: [48.8586, 2.3477], type: 'transport', durationMin: 30 })">
            <i class="fas fa-subway"></i><span>Metro Ride</span>
          </div>
          <div class="draggable-item" draggable="true" @dragstart="onDragStart($event, { layerId: 'transport', title: 'Taxi Transfer', coords: [48.8566, 2.3522], type: 'transport', durationMin: 45 })">
            <i class="fas fa-taxi"></i><span>Taxi Transfer</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'StudioSidebar',
  methods: {
    onDragStart(e, payload) {
      try { e.dataTransfer.setData('application/json', JSON.stringify(payload)) } catch (err) {}
      e.dataTransfer.effectAllowed = 'copy'
    }
  }
}
</script>

<style scoped>
.sidebar { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px; box-shadow: var(--shadow-light); height: fit-content; }
.sidebar-section { display: flex; flex-direction: column; gap: 14px; }
.section-block { display: flex; flex-direction: column; gap: 8px; }
.section-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--text-primary); }
.section-title i { color: var(--text-secondary); width: 16px; text-align: center; }
.items { display: flex; flex-direction: column; gap: 6px; }
.draggable-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: var(--bg-secondary); border: 1px dashed var(--border-light); border-radius: var(--radius-sm); cursor: grab; color: var(--text-primary); }
.draggable-item i { width: 16px; text-align: center; color: var(--text-secondary); }
.draggable-item:active { cursor: grabbing; }

/* Tablet & Mobile: compact layout */
@media (max-width: 1024px) {
  .sidebar { padding: 8px; }
  .section-title { font-size: 12px; }
  .draggable-item { padding: 6px 8px; }
}
</style>


