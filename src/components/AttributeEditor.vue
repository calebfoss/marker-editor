<script setup lang="ts">
import { computed } from 'vue'
const { name, allAttributes } = defineProps<{
  name: string
  allAttributes: MarkerAttributes
  remove: (name: string) => void
  refreshPreview: () => void
}>()

const expression = computed({
  get() {
    return allAttributes[name]
  },
  set(val) {
    allAttributes[name] = val
  }
})

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  expression.value = target.value
}
</script>

<template>
  <div class="attribute-editor" :tabindex="0" @keydown.delete.stop="(e) => remove(name)">
    <label>{{ name }}</label>
    <input
      :value="expression"
      @change="handleChange"
      @keydown.delete.stop
      @keydown.enter="refreshPreview"
      @blur="refreshPreview"
    />
  </div>
</template>
