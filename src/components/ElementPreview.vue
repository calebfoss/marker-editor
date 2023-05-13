<script setup lang="ts">
import { onMounted, ref } from 'vue';

const { element } = defineProps<{ element: MarkerElement; }>();
const elRef = ref<any | null>(null);
const isCanvas = element.tag === "canvas";

onMounted(async () => {
  if (elRef.value === null) return;
  const el = elRef.value;

  for (const [name, value] of Object.entries(element.attributes))
    el.setAttribute(name, value);

  if (element.tag === 'canvas')
    el.runCode();
});


</script>

<template>
  <component :is="isCanvas ? 'canvas' : `p-${element.tag}`" v-bind="isCanvas ? { is: 'p-canvas' } : null" ref="elRef">
    <ElementPreview v-for="child in element.children" :element="child"></ElementPreview>
  </component>
</template>
