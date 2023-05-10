<script setup lang="ts">
import { createApp, defineComponent, onMounted, reactive, ref } from 'vue'
import ElementEditor from './ElementEditor.vue'
import ElementPreview from './ElementPreview.vue'
const rootElement: MarkerElement = reactive({
  tag: '_',
  attributes: {},
  children: [{ tag: 'canvas', attributes: { is: 'p-canvas' }, children: [] }]
})

const iframe = document.querySelector('#preview') as HTMLIFrameElement
const iframeHead = iframe.contentDocument?.head as HTMLElement
const iframeBody = iframe.contentDocument?.body as HTMLElement
const p5script = document.createElement('script')
p5script.src = '../../node_modules/p5/lib/p5.js'
iframeHead.appendChild(p5script)
const markerScript = document.createElement('script')
markerScript.defer = true
markerScript.src = '../../lib/p5.marker.js'
//iframeHead.appendChild(markerScript)
createApp(ElementPreview, { element: rootElement }).mount(iframeBody)
</script>

<template>
  <ElementEditor :element="rootElement"></ElementEditor>
</template>
