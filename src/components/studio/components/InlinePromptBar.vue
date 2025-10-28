<template>
  <div class="inline-prompt">
    <i class="far fa-lightbulb hint"></i>
    <input
      v-model="query"
      class="prompt-input"
      type="text"
      :placeholder="placeholder"
      @keydown.enter.prevent="emitSubmit"
    />
    <button class="icon-btn" type="button" @click="emitImage">
      <i class="fas fa-image"></i>
    </button>
    <button class="icon-btn" type="button" @click="emitMic">
      <i class="fas fa-microphone"></i>
    </button>
    <button class="send-btn" type="button" @click="emitSubmit">
      <i class="fas fa-paper-plane"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'InlinePromptBar',
  props: { placeholder: { type: String, default: "Share your dream trip. I'll map the way." } },
  data() { return { query: '' } },
  methods: {
    emitSubmit() { this.$emit('submit', this.query.trim()) },
    emitImage() { this.$emit('pick-image') },
    emitMic() { this.$emit('mic') },
  }
}
</script>

<style scoped>
.inline-prompt { display:flex; align-items:center; gap:8px; width:100%; background: var(--bg-primary); border:1px solid var(--border-light); border-radius: var(--radius-lg); padding: 10px 12px; box-shadow: var(--shadow-light); }
.hint { color: var(--secondary-color); opacity: .9; }
.prompt-input { flex:1; border:none; outline:none; background: transparent; color: var(--text-primary); font-size: var(--font-size-base); }
.prompt-input::placeholder { color: var(--text-secondary); }
.icon-btn { display:flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius: var(--radius-sm); border:1px solid var(--border-light); background: var(--bg-secondary); color: var(--text-secondary); transition: var(--transition-normal); }
.icon-btn:hover { color: var(--text-primary); background: var(--bg-primary); }
.send-btn { display:flex; align-items:center; justify-content:center; height:34px; padding: 0 12px; border-radius: var(--radius-sm); border:1px solid var(--border-light); background: var(--secondary-color); color: #fff; transition: var(--transition-normal); }
.send-btn:hover { filter: brightness(0.95); }
</style>


