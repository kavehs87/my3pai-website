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
        <MapPanel :layers="day.layers" />

        <div class="editor">
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
import Timeline from './components/Timeline.vue'
import LayerRow from './components/LayerRow.vue'
import AIHints from './components/AIHints.vue'

export default {
  name: 'Studio',
  components: { Header, MapPanel, Timeline, LayerRow, AIHints },
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
.editor { margin-top: var(--spacing-xl); }
.layers { display: flex; flex-direction: column; gap: 10px; }
</style>


