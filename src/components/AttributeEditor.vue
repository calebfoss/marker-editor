<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { markerLanguageSupport } from '@/lang/markerLang'
import { markerSyntaxHighlighting } from '@/lang/syntaxHighlighting'

const { name, allAttributes } = defineProps<{
  name: string
  allAttributes: MarkerAttributes
  remove: (name: string) => void
  refreshPreview: () => void
}>()

const state = EditorState.create({
  doc: allAttributes[name],
  extensions: [
    EditorView.updateListener.of(
      (update: ViewUpdate) => (allAttributes[name] = update.state.doc.toString())
    ),
    markerLanguageSupport,
    markerSyntaxHighlighting
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
      @keydown.enter.prevent="refreshPreview"
      @blur="refreshPreview"
      ref="codeRef"
    ></div>
  </div>
</template>
