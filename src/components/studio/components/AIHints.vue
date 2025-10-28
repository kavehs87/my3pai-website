<template>
  <div class="hints" v-if="hints?.length">
    <h3>AI Suggestions</h3>
    <ul>
      <li v-for="(h, i) in hints" :key="i">
        <i class="far fa-lightbulb"></i>
        <span>{{ h }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AIHints',
  props: { hints: Array }
}
</script>

<style scoped>
.hints { margin-top: var(--spacing-xl); border-top: 1px solid var(--border-light); padding-top: var(--spacing-md); }
.h3 { color: var(--text-primary); }
ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
li { display: flex; align-items: center; gap: 8px; color: var(--text-primary); }
li i { color: var(--secondary-color); }
</style>


