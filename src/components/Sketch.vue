<script setup lang="ts">
import manifest from '../custom-elements.json'
import { createApp, type App, reactive, ref } from 'vue'
import ElementEditor from './ElementEditor.vue'
import ElementPreview from './SketchPreview.vue'

const docs: MarkerDocs = manifest.modules.reduce(
  (elements: MarkerDocElement[], mod) =>
    elements.concat(
      Object.values(mod.declarations)
        .filter((dec) => dec.customElement)
        .map(({ name, description, members }) => ({
          name: name.toLowerCase(),
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
        }))
    ),
  []
)

const rootElement: MarkerElement = reactive({
  tag: 'sketch',
  attributes: {},
  children: [
    {
      tag: 'canvas',
      attributes: { background: '220', width: '400', height: '400' },
      children: []
    }
  ]
})

const freezeRoot = (): MarkerElement => JSON.parse(JSON.stringify(rootElement))

const iframeRef = ref<HTMLIFrameElement>()
const appRef = ref<App | null>(null)

function mountPreview() {
  const iframe = iframeRef.value as HTMLIFrameElement
  const iframeDoc = iframe.contentDocument as Document
  const iframeBody = iframeDoc.body as HTMLBodyElement
  const app = createApp(ElementPreview, { element: freezeRoot() })
  appRef.value = app
  app.mount(iframeBody)
}

function refreshPreview() {
  if (appRef.value === null) return
  const oldApp = appRef.value
  oldApp.unmount()
  mountPreview()
}
</script>

<template>
  <section id="sketch-editor">
    <ElementEditor
      :element="rootElement"
      :docs="docs"
      :refresh-preview="refreshPreview"
    ></ElementEditor>
  </section>
  <section id="preview">
    <iframe src="../../preview.html" @load="mountPreview" ref="iframeRef"></iframe>
    <button @click="refreshPreview">Reload</button>
  </section>
</template>
