<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import AttributeAdder from './AttributeAdder.vue'
import AttributeEditor from './AttributeEditor.vue'
import ChildAdder from './ChildAdder.vue'

const { element, refreshPreview, generateKey, inheritedAttributes, parentElement } = defineProps<{
  element: MarkerElement
  inheritedAttributes: string[]
  refreshPreview: () => void
  generateKey: () => string
  parentElement?: MarkerElement
  canvas?: MarkerElement
}>()

const baseElements = inject<MarkerDocs>('baseElements') as MarkerDocs
const customElements = inject<MarkerDocs>('customElements') as MarkerDocs
const docElement =
  baseElements.find((el) => el.name === element.tag) ||
  customElements.find((el) => el.name === element.tag)
const standardAttributes = ['custom'].concat(
  typeof docElement === 'undefined' ? [] : docElement.attributes.map(({ name }) => name)
)
const allAttributes = Array.from(new Set(inheritedAttributes.concat(standardAttributes)))

const folded = ref(false)

function toggleFolded() {
  folded.value = !folded.value
}

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

const headingName = computed(() => {
  const elementName = element.tag.slice(2)
  if ('name' in element.attributes === false) return elementName
  const nameStrippedOfSemicolons = element.attributes.name
    ?.match(/;?([^;]*);?/)
    ?.slice(1)
    .join()
  return `${elementName}: ${nameStrippedOfSemicolons}`
})
</script>

<template>
  <div class="element-editor" :tabindex="0">
    <header>
      <h2>
        {{ headingName }}
      </h2>
      <button :class="{ 'fold-toggle': true, folded: folded }" @click="toggleFolded"></button>
    </header>
    <div v-show="!folded">
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
          :element-attributes="element.attributes"
          :all-attributes="allAttributes"
          :remove="removeAttribute"
          :refresh-preview="refreshPreview"
          :key="name"
        >
        </AttributeEditor>
      </div>
      <AttributeAdder
        :element="element"
        :add-attribute="addAttribute"
        :standard-attributes="standardAttributes"
      ></AttributeAdder>
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
          :inherited-attributes="allAttributes"
          :refresh-preview="refreshPreview"
          :key="child.key"
          :generate-key="generateKey"
          :parent-element="element"
          :canvas="isCanvas ? element : canvas"
          @keydown.delete.stop="() => removeChild(index)"
          @keydown.up.stop.prevent="(e: KeyboardEvent) => e.shiftKey ? parentChildUp(index) : moveChildUp(index)"
          @keydown.down.stop.prevent="(e: KeyboardEvent) => e.shiftKey ? parentChildDown(index) : moveChildDown(index)"
          @keydown.left.stop.prevent="() => childToSibling(index)"
        >
        </ElementEditor>
      </div>
      <ChildAdder :add-child="addChild" :canvas="isCanvas ? element : canvas"></ChildAdder>
    </div>
  </div>
</template>
