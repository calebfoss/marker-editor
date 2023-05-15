<script setup lang="ts">
import { computed } from 'vue'
const { name, allAttributes } = defineProps<{
  name: string
  allAttributes: MarkerAttributes
  remove: (name: string) => void
  refreshPreview: () => void
}>()
</script>

<template>
  <div class="attribute-editor" :tabindex="0" @keydown.delete.stop="(e) => remove(name)">
    <label>{{ name }}</label>
    <input
      v-model="allAttributes[name]"
      @keydown.delete.stop
      @keydown.enter="refreshPreview"
      @blur="refreshPreview"
    />
  </div>
</template>
