<script setup lang="ts">
import { computed, ref } from 'vue'
import AttributeAdder from './AttributeAdder.vue'
import AttributeEditor from './AttributeEditor.vue'
import ChildAdder from './ChildAdder.vue'

const { element, remove, refreshPreview, generateKey, parentElement } = defineProps<{
  element: MarkerElement
  remove?: () => void
  moveUp?: (e: KeyboardEvent) => void
  moveDown?: (e: KeyboardEvent) => void
  docs: MarkerDocs
  refreshPreview: () => void
  generateKey: () => string
  parentElement?: MarkerElement
  canvas?: MarkerElement
}>()

function addChild(tag: string) {
  const child: MarkerElement = {
    tag,
    key: generateKey(),
    attributes: {},
    children: [],
    description: ''
  }
  element.children.push(child)
  refreshPreview()
}

function childToSibling(index: number) {
  if (typeof parentElement === 'undefined') return
  const child = element.children[index]
  removeChild(index)
  parentElement.children.push(child)
}

function removeChild(index: number) {
  element.children = element.children.slice(0, index).concat(element.children.slice(index + 1))
  refreshPreview()
}

function moveChildUp(index: number) {
  if (index <= 0) return
  const child = element.children[index]
  element.children = element.children
    .slice(0, index - 1)
    .concat(child)
    .concat(element.children.slice(index - 1, index))
    .concat(element.children.slice(index + 1))
  refreshPreview()
}

function moveChildDown(index: number) {
  if (index === -1 || index > element.children.length) return
  const child = element.children[index]
  element.children = element.children
    .slice(0, index)
    .concat(element.children.slice(index + 1, index + 2))
    .concat(child)
    .concat(element.children.slice(index + 2))
  refreshPreview()
}

function parentChildUp(index: number) {
  if (index <= 0) return
  const child = element.children[index]
  removeChild(index)
  element.children[index - 1].children.push(child)
}

function parentChildDown(index: number) {
  if (index === -1 || index === element.children.length - 1) return
  const child = element.children[index]
  removeChild(index)
  element.children[index].children.push(child)
}

function addAttribute(e: Event) {
  const el = e.target as HTMLInputElement | HTMLFormElement
  const form = el instanceof HTMLFormElement ? el : el.form
  if (form === null) return
  const formData = new FormData(form)
  const name = formData.get('attribute-name')?.toString()
  if (typeof name === 'undefined' || name.length === 0) return
  const key = name === 'custom' ? formData.get('attribute-custom')?.toString() : name
  if (typeof key === 'undefined') return
  element.attributes[key] = ''
  form.reset()
}

function removeAttribute(name: string) {
  delete element.attributes[name]
  refreshPreview()
}
const isCanvas3D = ref(element.tag === 'p-canvas-3d')
const isCanvas = computed(() => isCanvas3D.value || element.tag === 'p-canvas')

function updateCanvasTag() {
  const is3D = isCanvas3D.value
  element.tag = is3D ? 'p-canvas-3d' : 'p-canvas'
  refreshPreview()
}
</script>

<template>
  <div
    class="element-editor"
    :tabindex="0"
    @keydown.delete.stop="remove"
    @keydown.up.stop.prevent="moveUp"
    @keydown.down.stop.prevent="moveDown"
  >
    <h2>{{ element.tag.slice(-2) === `3d` ? element.tag.slice(2, -3) : element.tag.slice(2) }}</h2>
    <div v-if="isCanvas">
      <input
        style="margin-right: 10px"
        type="checkbox"
        v-model="isCanvas3D"
        @change="updateCanvasTag"
      /><label>3D</label>
    </div>
    <div class="attributes-editor">
      <AttributeEditor
        v-for="(_, name) in element.attributes"
        :name="name.toString()"
        :all-attributes="element.attributes"
        :remove="removeAttribute"
        :refresh-preview="refreshPreview"
      >
      </AttributeEditor>
    </div>
    <AttributeAdder :element="element" :add-attribute="addAttribute" :docs="docs"></AttributeAdder>
    <div class="description">
      <label>Description</label>
      <textarea
        v-model="element.description"
        @blur="refreshPreview"
        @keydown.enter.stop.prevent="refreshPreview"
        @keydown.backspace.stop
      ></textarea>
    </div>
    <div class="children">
      <ElementEditor
        v-for="(child, index) in element.children"
        :element="child"
        :remove="() => removeChild(index)"
        :move-up="(e: KeyboardEvent) => e.shiftKey ? parentChildUp(index) : moveChildUp(index)"
        :move-down="(e: KeyboardEvent) => e.shiftKey ? parentChildDown(index) : moveChildDown(index)"
        :docs="docs"
        :refresh-preview="refreshPreview"
        :key="child.key"
        :generate-key="generateKey"
        :parent-element="element"
        :canvas="isCanvas ? element : canvas"
        @keydown.left.stop.prevent="() => childToSibling(index)"
      >
      </ElementEditor>
    </div>
    <ChildAdder
      :add-child="addChild"
      :docs="docs"
      :canvas="isCanvas ? element : canvas"
    ></ChildAdder>
  </div>
</template>
