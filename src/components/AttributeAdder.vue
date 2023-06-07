<script setup lang="ts">
import { computed, inject, onMounted, ref, nextTick } from 'vue'
import { EditorState, type ChangeSpec } from '@codemirror/state'
import { EditorView, ViewUpdate } from '@codemirror/view'
import { autocompletion, CompletionContext, type CompletionResult } from '@codemirror/autocomplete'

const { element, addAttribute, parentAttributes, standardAttributes } = defineProps<{
  element: MarkerElement
  addAttribute: (s: string) => void
  standardAttributes: string[]
  parentAttributes: string[]
}>()
const options = computed(() =>
  standardAttributes
    .concat(parentAttributes.map((attrName) => `parent.${attrName}`))
    .filter((a) => a in element.attributes === false)
    .map((label) => ({ label }))
)
const autocomplete = autocompletion({
  override: [
    (context: CompletionContext): CompletionResult => ({
      from: 0,
      options: options.value
    })
  ]
})
const state = EditorState.create({
  extensions: [
    EditorView.updateListener.of((update: ViewUpdate) =>
      updateAttributeName(update.state.doc.toString())
    ),
    autocomplete
  ]
})

const adding = ref(false)
const viewRef = ref<null | EditorView>(null)

async function toggle() {
  adding.value = !adding.value
  if (!adding.value) {
    const change: ChangeSpec = { from: 0, to: viewRef.value?.state.doc.length, insert: '' }
    viewRef.value?.dispatch({ changes: [change] })
  } else {
    await nextTick()
    viewRef.value?.focus()
  }
}

const attributeName = ref('')
const updateAttributeName = (s: string) => (attributeName.value = s)

function handleSubmit(e: Event) {
  addAttribute(attributeName.value)
  toggle()
}

const generateKey = inject('generateKey') as () => string
const cmId = generateKey()
const cmParentRef = ref<null | HTMLDivElement>(null)

onMounted(() => {
  const cmParent = cmParentRef.value as HTMLDivElement

  const view = new EditorView({ parent: cmParent, state })
  view.contentDOM.id = cmId
  viewRef.value = view
  view.contentDOM.addEventListener('blur', () => (adding.value = false))
})
</script>

<template>
  <button v-show="!adding" @click="toggle">Add attribute</button>
  <form
    v-show="adding"
    class="attribute-adder"
    @submit.prevent="handleSubmit"
    @keydown.enter.ctrl="handleSubmit"
    @blur="toggle"
  >
    <label for="cmId">Attribute name</label>
    <div ref="cmParentRef" class="attribute-name" @keydown.delete.stop></div>
    <input type="submit" value="+" />
  </form>
</template>
