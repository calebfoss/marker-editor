<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const { element } = defineProps<{ element: MarkerElement }>()
const elRef = ref<(HTMLElement & { runCode: () => void; pInst: any }) | null>(null)
const isCanvas = element.tag === 'p-canvas-3d' || element.tag === 'p-canvas'

onMounted(() => {
  if (elRef.value === null) return
  const el = elRef.value

  for (const [name, value] of Object.entries(element.attributes)) el.setAttribute(name, value)

  if (isCanvas) el.runCode?.()
})

onBeforeUnmount(() => {
  if (elRef.value !== null && isCanvas) elRef.value.pInst?.remove()
})
</script>

<template>
  <component
    :is="isCanvas ? 'canvas' : element.tag"
    v-bind="isCanvas ? { is: element.tag } : null"
    ref="elRef"
  >
    {{ element.description }}
    <ElementPreview
      v-for="child in element.children"
      :element="child"
      :key="child.key"
    ></ElementPreview>
  </component>
</template>
