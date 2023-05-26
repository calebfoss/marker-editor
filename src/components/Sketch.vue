<script setup lang="ts">
import manifest from '../custom-elements.json'
import { createApp, type App, provide, reactive, ref } from 'vue'
import ElementEditor from './ElementEditor.vue'
import SketchPreview from './SketchPreview.vue'
import MenuBar from './MenuBar.vue'

const byName = (a: { name: string }, b: { name: string }) => {
  if (a.name < b.name) return -1
  if (a.name === b.name) return 0
  return 1
}

const keyGenerator = (function* () {
  let id = 0
  while (true) yield `element_${id++}`
})()
const generateKey = () => keyGenerator.next().value

const baseElements: MarkerDocs = manifest.modules
  .reduce(
    (elements: MarkerDocElement[], mod) =>
      elements.concat(
        Object.values(mod.exports)
          .filter((exp) => exp.kind === 'custom-element-definition')
          .map((elementExport) => {
            const { description, members } = Object.values(mod.declarations).find(
              (dec) => dec.name === elementExport.declaration.name
            )
            return {
              name: elementExport.name,
              description,
              attributes: members
                .filter(
                  (member: { privacy?: string; kind?: string }) =>
                    member.privacy !== 'private' && member.kind === 'field'
                )
                .map(({ name, description }: { name: string; description?: string }) => ({
                  name,
                  description
                }))
                .sort(byName)
            }
          })
      ),
    []
  )
  .sort(byName)
provide('baseElements', baseElements)

const rootElement: MarkerElement = reactive({
  tag: 'p-sketch',
  key: generateKey(),
  attributes: {},
  children: [
    {
      tag: 'p-canvas',
      key: generateKey(),
      attributes: { background: '220', width: '400', height: '400' },
      children: [],
      description: ''
    }
  ],
  description: ''
})

const iframeRef = ref<HTMLIFrameElement | null>(null)
const appRef = ref<App | null>(null)

const customElements: MarkerDocs = reactive([])
provide('customElements', customElements)

function mountPreview() {
  const iframe = iframeRef.value
  if (iframe === null) {
    console.error('Tried to mount preview window, but iframe ref was null')
    return
  }
  const iframeDoc = iframe.contentDocument
  if (iframeDoc === null) {
    console.error("Tried to mount preview window, but iframe's contentDocument was null")
    return
  }
  const iframeBody = iframeDoc.body
  const app = createApp(SketchPreview, { rootElement, iframeRef })
  app.provide('baseElements', baseElements)
  app.provide('customElements', customElements)
  appRef.value = app
  app.mount(iframeBody)
}

function refreshPreview() {
  if (appRef.value === null) return
  const oldApp = appRef.value
  oldApp.unmount()
  while (customElements.length) customElements.pop()
  appRef.value = null
  const iframe = iframeRef.value as HTMLIFrameElement
  const iframeWindow = iframe.contentWindow as Window
  iframeWindow.location.reload()
  mountPreview()
}

const editorRef = ref<HTMLElement | null>(null)

function startResizing() {
  window.addEventListener('mousemove', resizeEditor)
  window.addEventListener('mouseup', () => window.removeEventListener('mousemove', resizeEditor))
}
function resizeEditor(e: MouseEvent) {
  if (editorRef.value === null) return
  const editor = editorRef.value
  const x = e.clientX
  editor.style.width = `${x}px`
}
</script>

<template>
  <MenuBar
    :generate-key="generateKey"
    :root-element="rootElement"
    :refresh-preview="refreshPreview"
  ></MenuBar>
  <section id="sketch-editor" ref="editorRef">
    <ElementEditor
      :element="rootElement"
      :refresh-preview="refreshPreview"
      :generate-key="generateKey"
      class="root-element"
    ></ElementEditor>
  </section>
  <span class="resize-bar" @mousedown="startResizing"></span>
  <section id="preview">
    <iframe src="preview.html" @load="mountPreview" ref="iframeRef"></iframe>
    <button @click="refreshPreview">Reload</button>
  </section>
</template>
