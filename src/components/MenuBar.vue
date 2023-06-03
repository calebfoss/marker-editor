<script lang="ts" setup>
const { generateKey, rootElement, refreshPreview } = defineProps<{
  generateKey: () => string
  rootElement: MarkerElement
  refreshPreview: () => void
}>()

function downloadSketch(e: Event) {
  const downloadLink = document.createElement('a')
  const docString = JSON.stringify(rootElement)
  const blob = new Blob([docString], { type: 'application/json' })
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = 'MarkerSketch.json'
  downloadLink.click()
}

function regenerateKeys(element: MarkerElement) {
  element.key = generateKey()
  for (const child of element.children) {
    regenerateKeys(child)
  }
}

async function loadSketch(e: Event) {
  const inputElement = e.target as HTMLInputElement
  const { files } = inputElement
  if (files === null) return
  const file = files.item(0)
  if (file === null) return
  const fileString = await file.text()
  const fileObj = JSON.parse(fileString)
  regenerateKeys(fileObj)
  Object.assign(rootElement, fileObj)
  refreshPreview()
  inputElement.value = ''
}

function openPreview() {
  const url = new URL(window.location.href)
  url.searchParams.set('preview', 'true')
  const link = document.createElement('a')
  link.href = url.href
  link.target = '_'
  link.click()
}
</script>

<template>
  <header id="menu-bar">
    <h1>p5 Marker Editor</h1>
    <button @click="downloadSketch">Download</button>
    <button type="button"><label for="file-select" style="cursor: pointer">Load</label></button
    ><input id="file-select" type="file" accept=".json" v-show="false" @change="loadSketch" />
    <button @click="openPreview">Preview in New Window</button>
  </header>
</template>
