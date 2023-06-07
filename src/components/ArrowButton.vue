<script setup lang="ts">
defineProps<{ rotation: number; onClick: () => void }>()
</script>
<template>
  <button @click="onClick" class="symbol-button">
    <div class="arrow" :style="{ rotate: `${rotation}deg` }"></div>
  </button>
</template>
