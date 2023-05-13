<script setup lang="ts">
import { getCurrentInstance, reactive } from "vue";
import ElementPreview from './ElementPreview.vue';
const rootElement = reactive(getCurrentInstance()?.appContext.config.globalProperties.$element);
</script>
<template>
    <ElementPreview :element="rootElement"></ElementPreview>
</template>