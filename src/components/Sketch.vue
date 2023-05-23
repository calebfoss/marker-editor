<script setup lang="ts">
import manifest from '../custom-elements.json'
import { createApp, type App, reactive, ref } from 'vue'
import ElementEditor from './ElementEditor.vue'
import ElementPreview from './ElementPreview.vue'

const byName = (a: { name: string }, b: { name: string }) => {
  if (a.name < b.name) return -1
  if (a.name === b.name) return 0
  return 1
}

const toKebab = (str: string) =>
  str.replace(/(?<=[a-z])[A-Z]|3/g, (char) => `-${char.toLowerCase()}`).toLowerCase()

const keyGenerator = (function* () {
  let id = 0
  while (true) yield `element_${id++}`
})()
const generateKey = () => keyGenerator.next().value

const docs: MarkerDocs = manifest.modules
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
  const element = rootElement
  const app = createApp(ElementPreview, { element })
  appRef.value = app
  app.mount(iframeBody)
}

function refreshPreview() {
  if (appRef.value === null) return
  const oldApp = appRef.value
  oldApp.unmount()
  appRef.value = null
  mountPreview()
}
</script>

<template>
  <section id="sketch-editor">
    <ElementEditor
      :element="rootElement"
      :docs="docs"
      :refresh-preview="refreshPreview"
      :generate-key="generateKey"
      class="root-element"
    ></ElementEditor>
  </section>
  <section id="preview">
    <iframe src="preview.html" @load="mountPreview" ref="iframeRef"></iframe>
    <button @click="refreshPreview">Reload</button>
  </section>
</template>
