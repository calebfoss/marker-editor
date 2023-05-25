<script setup lang="ts">
const { name, allAttributes } = defineProps<{
  name: string
  allAttributes: MarkerAttributes
  remove: (name: string) => void
  refreshPreview: () => void
}>()

function focusNewAttribute(e: any) {
  e.el.children[1].focus()
}
</script>

<template>
  <div
    class="attribute-editor"
    :tabindex="0"
    @keydown.delete.stop="(e) => remove(name)"
    @vue:mounted="focusNewAttribute"
  >
    <label>{{ name }}</label>
    <input
      v-model="allAttributes[name]"
      @keydown.delete.stop
      @keydown.left.stop
      @keydown.enter="refreshPreview"
      @blur="refreshPreview"
    />
  </div>
</template>
