<script setup lang="ts">
import manifest from '../custom-elements.json'
import { createApp, type App, reactive, ref } from 'vue'
import ElementEditor from './ElementEditor.vue'
import ElementPreview from './SketchPreview.vue'

const byName = (a: {name: string}, b: {name: string}) => {
  if(a.name < b.name) return -1;
  if(a.name === b.name) return 0;
  return 1;
}

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
            })).sort(byName)
        }))
    ),
  []
).sort(byName);

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

const iframeRef = ref<HTMLIFrameElement | null>(null)
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
      class="root-element"
    ></ElementEditor>
  </section>
  <section id="preview">
    <iframe src="preview.html" @load="mountPreview" ref="iframeRef"></iframe>
    <button @click="refreshPreview">Reload</button>
  </section>
</template>
