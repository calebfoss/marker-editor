<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
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

onMounted(() => {
  if (codeRef.value === null) return
  const view = new EditorView({
    parent: codeRef.value,
    state
  })
  view.contentDOM.addEventListener('blur', refreshPreview)
})
</script>

<template>
  <div
    class="attribute-editor"
    :tabindex="0"
    @keydown.delete.stop="(e) => remove(name)"
    @vue:mounted="focusNewAttribute"
  >
    <label>{{ name }}</label>
    <div
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
