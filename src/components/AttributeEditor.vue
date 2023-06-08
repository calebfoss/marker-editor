<script setup lang="ts">
import { inject, nextTick, onMounted, ref } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { autocompletion } from '@codemirror/autocomplete'
import { markerScriptSupport } from '@/lang/markerLang'
import { markerSyntaxHighlighting } from '@/lang/syntaxHighlighting'

const { allAttributes, name, elementAttributes, refreshPreview } = defineProps<{
  name: string
  elementAttributes: MarkerAttributes
  allAttributes: string[]
  remove: (name: string) => void
  refreshPreview: () => void
}>()

const generateKey = inject('generateKey') as () => string
const id = generateKey()

const state = EditorState.create({
  doc: elementAttributes[name],
  extensions: [
    EditorView.updateListener.of(
      (update: ViewUpdate) => (elementAttributes[name] = update.state.doc.toString())
    ),
    markerScriptSupport(allAttributes),
    markerSyntaxHighlighting,
    autocompletion({})
  ]
})

function focusNewAttribute(e: any) {
  e.el.children[1].focus()
}

const codeRef = ref<HTMLDivElement | null>(null)
const viewRef = ref<EditorView | null>(null)

onMounted(async () => {
  if (codeRef.value === null) return
  const view = new EditorView({
    parent: codeRef.value,
    state
  })
  viewRef.value = view
  view.contentDOM.addEventListener('blur', refreshPreview)
  await nextTick()
  view.contentDOM.focus()
})

//  Currently unused - focused on code with cursor at the end
function goToCode() {
  const view = viewRef.value as EditorView
  view.focus()
  view.dispatch({ selection: { anchor: view.state.doc.length, head: view.state.doc.length } })
}
</script>

<template>
  <div
    class="attribute-editor"
    :tabindex="0"
    @keydown.delete.stop="(e) => remove(name)"
    @vue:mounted="focusNewAttribute"
  >
    <div class="attribute-label-container">
      <label :for="id">{{ name }}</label>
      <button style="height: fit-content" @click="(e) => remove(name)">X</button>
    </div>
    <div
      :id="id"
      class="attribute-expression"
      @keydown.delete.stop
      @keydown.left.stop
      @keydown.up.stop
      @keydown.down.stop
      @keydown.enter.ctrl.prevent="refreshPreview"
      @blur="refreshPreview"
      ref="codeRef"
    ></div>
  </div>
</template>
