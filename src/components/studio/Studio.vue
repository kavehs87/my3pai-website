<template>
  <div class="studio">
    <Header />
    <div class="studio-header">
      <div class="container">
        <div class="header-row">
          <div>
            <h1 class="title">Travel Plan Creator Studio</h1>
            <p class="subtitle">{{ day.city }} — {{ day.date }} ({{ day.hours.start }}–{{ day.hours.end }})</p>
          </div>
          <div class="actions">
            <button class="btn" @click="generateAI">AI Generate</button>
            <button class="btn secondary" @click="sharePlan">Share</button>
          </div>
        </div>
      </div>
    </div>

    <div class="studio-body">
      <div class="container">
        <div class="studio-grid">
          <Sidebar />
          <div class="main">
            <MapPanel :layers="day.layers" />
          </div>
        </div>

        <!-- Timeline/editor below, centered with max-width -->
        <div class="editor editor-max">
          <Timeline :hours="day.hours" />
          <div class="layers">
            <LayerRow v-for="layer in day.layers" :key="layer.id" :layer="layer" :hours="day.hours" @select="selectEvent" />
          </div>
          <AIHints :hints="aiHints" />
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import Header from '../Header.vue'
import data from '../../data/studioSample.json'
import MapPanel from './components/MapPanel.vue'
import Sidebar from './components/Sidebar.vue'
import Timeline from './components/Timeline.vue'
import LayerRow from './components/LayerRow.vue'
import AIHints from './components/AIHints.vue'

export default {
  name: 'Studio',
  components: { Header, MapPanel, Timeline, LayerRow, AIHints, Sidebar },
  data() {
    return {
      day: data.day,
      aiHints: data.aiHints,
      selected: null
    }
  },
  methods: {
    selectEvent(event) {
      this.selected = event
    },
    generateAI() {
      console.log('AI generate (mock)')
    },
    sharePlan() {
      console.log('Share plan (mock)')
    }
  }
}
</script>

<style scoped>
.studio { background: var(--bg-secondary); }
.studio-header { padding: var(--spacing-xl) 0; border-bottom: 1px solid var(--border-light); background: var(--bg-primary); }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: var(--font-size-2xl); color: var(--text-primary); }
.subtitle { margin: 6px 0 0; color: var(--text-secondary); }
.actions { display: flex; gap: var(--spacing-sm); }
.btn { padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-secondary); cursor: pointer; }
.btn.secondary { background: transparent; }

/* Make studio full-width like a desktop app */
.container { max-width: 100%; width: 100%; padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
.studio-body { padding: var(--spacing-lg) 0; }
.studio-grid { display: grid; grid-template-columns: 260px 1fr; gap: var(--spacing-lg); }
.main { display: flex; flex-direction: column; gap: var(--spacing-lg); }
.editor { margin-top: var(--spacing-xl); }
.editor-max { max-width: 1200px; margin: var(--spacing-xl) auto 0; padding: 0 var(--spacing-lg); }
.layers { display: flex; flex-direction: column; gap: 10px; }

@media (max-width: 1024px) {
  .studio-grid { grid-template-columns: 1fr; }
}
</style>


