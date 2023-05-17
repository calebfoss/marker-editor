<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const { element } = defineProps<{ element: MarkerElement }>()
const elRef = ref<(HTMLElement & { runCode: () => void; pInst: any }) | null>(null)
const isCanvas3D = element.tag === 'canvas-3d'
const isCanvas = isCanvas3D || element.tag === 'canvas'

onMounted(() => {
  if (elRef.value === null) return
  const el = elRef.value

  for (const [name, value] of Object.entries(element.attributes)) el.setAttribute(name, value)

  if (isCanvas) el.runCode()
})

onBeforeUnmount(() => {
  if (elRef.value !== null && isCanvas) elRef.value.pInst.remove()
})
</script>

<template>
  <component
    :is="isCanvas ? 'canvas' : `p-${element.tag}`"
    v-bind="isCanvas ? { is: isCanvas3D ? 'p-canvas-3d' : 'p-canvas' } : null"
    ref="elRef"
  >
    {{ element.description }}
    <ElementPreview v-for="child in element.children" :element="child"></ElementPreview>
  </component>
</template>
