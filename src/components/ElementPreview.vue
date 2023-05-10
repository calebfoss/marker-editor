<script setup lang="ts">
const { element } = defineProps<{ element: MarkerElement }>()
const tag = element.tag === 'canvas' ? 'canvas' : `p-${element.tag}`
</script>

<template>
  <component :is="tag" v-bind="element.attributes">
    <ElementPreview v-for="child in element.children" :element="child"></ElementPreview>
  </component>
</template>
