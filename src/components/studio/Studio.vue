<template>
  <div class="studio">
    <Header />
    <div class="studio-header">
      <div class="container">
        <InlinePromptBar @submit="handlePrompt" @pick-image="handlePickImage" @mic="handleMic" />
      </div>
    </div>

    <div class="studio-body">
      <div class="container">
        <div class="studio-grid" style="min-height: 0;">
          <Sidebar />
          <div class="main">
            <MapPanel :layers="day.layers" />
          </div>
        </div>

        <!-- Timeline/editor below, full width under grid -->
        <div class="editor editor-max">
          <div class="timeline-row">
            <div></div>
            <Timeline :hours="day.hours" />
          </div>
          <div class="layers">
            <LayerRow v-for="layer in day.layers" :key="layer.id" :layer="layer" :hours="day.hours" @select="selectEvent" />
          </div>
          <!-- AIHints hidden per request -->
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
import InlinePromptBar from './components/InlinePromptBar.vue'
import Timeline from './components/Timeline.vue'
import LayerRow from './components/LayerRow.vue'
// import AIHints from './components/AIHints.vue'

export default {
  name: 'Studio',
  components: { Header, MapPanel, Timeline, LayerRow, Sidebar, InlinePromptBar },
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
    },
    handlePrompt(q) {
      if (!q) return
      console.log('Studio prompt submit:', q)
    },
    handlePickImage() { console.log('Studio pick image') },
    handleMic() { console.log('Studio mic') }
  }
}
</script>

<style scoped>
.studio { background: var(--bg-secondary); min-height: 100vh; display: flex; flex-direction: column; }
.studio-header { padding: var(--spacing-xl) 0; border-bottom: 1px solid var(--border-light); background: var(--bg-primary); }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: var(--font-size-2xl); color: var(--text-primary); }
.subtitle { margin: 6px 0 0; color: var(--text-secondary); }
.actions { display: flex; gap: var(--spacing-sm); }
.btn { padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-secondary); cursor: pointer; }
.btn.secondary { background: transparent; }

/* Make studio full-width like a desktop app */
.container { max-width: 100%; width: 100%; padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
.studio-body { padding: var(--spacing-lg) 0; flex: 1; display: flex; min-height: 0; }
.studio-grid { display: grid; grid-template-columns: 260px 1fr; gap: var(--spacing-lg); min-height: 0; height: 100%; align-items: stretch; margin-bottom: var(--spacing-lg); }
.studio-grid .sidebar { align-self: start; }
.main { display: flex; flex-direction: column; gap: var(--spacing-lg); flex: 1; }
.editor { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); box-shadow: var(--shadow-light); }
.editor-max { width: 100%; max-width: none; margin-top: auto; padding: var(--spacing-lg); }
.layers { display: flex; flex-direction: column; gap: 10px; }

/* Ensure container stretches and allows editor to push to bottom */
.studio-body > .container { display: flex; flex-direction: column; flex: 1; }

/* Align timeline hours with event tracks (label column + track column) */
.timeline-row { display: grid; grid-template-columns: 180px 1fr; align-items: center; margin-bottom: 6px; }
.timeline-row > div:first-child { color: transparent; }

@media (max-width: 1024px) {
  .studio-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .studio-grid { grid-template-columns: 1fr; gap: var(--spacing-sm); }
  .studio-grid .sidebar { order: 2; margin-top: var(--spacing-sm); }
  .studio-grid .main { order: 1; }
}
</style>


