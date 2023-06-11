<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import AttributeAdder from './AttributeAdder.vue'
import AttributeEditor from './AttributeEditor.vue'
import ChildAdder from './ChildAdder.vue'
import { exclusively_3d_elements } from './Primitives3D'
import ArrowButton from './ArrowButton.vue'

const { element, refreshPreview, generateKey, inheritedAttributes, parentElement } = defineProps<{
  element: MarkerElement
  inheritedAttributes: string[]
  refreshPreview: () => void
  generateKey: () => string
  parentElement?: MarkerElement
  canvas?: MarkerElement
  unparent?: () => void
  moveUp?: () => void
  parentUp?: () => void
  moveDown?: () => void
  parentDown?: () => void
  deleteSelf?: () => void
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
const parentAttributes = computed(() =>
  typeof parentElement !== 'undefined' ? Object.keys(parentElement.attributes) : []
)

const hideEditor = ref(false)
const toggleEditor = () => (hideEditor.value = !hideEditor.value)
const hideChildren = ref(false)
const toggleChildren = () => (hideChildren.value = !hideChildren.value)

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

function addAttribute(name: string) {
  if (typeof name === 'undefined' || name.length === 0) return
  element.attributes[name] = ''
}

function removeAttribute(name: string) {
  delete element.attributes[name]
  refreshPreview()
}
const isCanvas3D = ref(element.tag === 'p-canvas-3d')
const isCanvas = computed(() => isCanvas3D.value || element.tag === 'p-canvas')

const convertTo3D = (parEl: MarkerElement | null, el: MarkerElement) => {
  const el3D = baseElements.find((docEl) => docEl.name === el.tag + '-3d')
  if (typeof el3D !== 'undefined') el.tag = el3D.name
  else if (!exclusively_3d_elements.includes(el.tag.slice(2))) {
    parEl?.children.slice(parEl.children.indexOf(el), 1)
    return
  }
  for (const child of el.children) {
    convertTo3D(el, child)
  }
}
const convertTo2D = (parEl: MarkerElement | null, el: MarkerElement) => {
  if (exclusively_3d_elements.includes(el.tag.slice(2))) {
    parEl?.children.splice(parEl.children.indexOf(el), 1)
    return
  }
  if (el.tag.slice(-3) === '-3d') {
    const el3D = baseElements.find((docEl) => docEl.name === el.tag.slice(0, -3))
    if (typeof el3D === 'undefined') {
      parEl?.children.splice(parEl.children.indexOf(el), 1)
      return
    }
    el.tag = el3D.name
  }
  for (const child of el.children) {
    convertTo2D(el, child)
  }
}

function updateCanvasTag() {
  const is3D = isCanvas3D.value
  if (is3D) {
    if (element.children.length) {
      const convert = confirm(
        'Switching to a 3D canvas requires the children of the canvas to be 3D elements. ' +
          'Clicking okay will attempt to convert all elements to 3D and remove any elements that cannot be converted.'
      )
      if (!convert) return
      convertTo3D(null, element)
    }
  } else {
    if (element.children.length) {
      const convert = confirm(
        'Switching to a 2D canvas requires the children of the canvas to be 2D elements. ' +
          'Clicking okay will attempt to convert all elements to 2D and remove any elements that cannot be converted.'
      )
      if (!convert) return
      convertTo2D(null, element)
    }
  }
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
  <div
    class="element-editor"
    :tabindex="0"
    @keydown.delete.stop="deleteSelf"
    @keydown.up.stop.prevent="(e: KeyboardEvent) => e.shiftKey ? parentUp?.() : moveUp?.()"
    @keydown.down.stop.prevent="(e: KeyboardEvent) => e.shiftKey ? parentDown?.() : moveDown?.()"
    @keydown.left.stop.prevent="unparent"
  >
    <header>
      <h2>
        {{ headingName }}
      </h2>
      <div style="display: flex; justify-content: space-between; gap: 10px">
        <ArrowButton v-if="unparent" :onClick="unparent" :rotation="180" />
        <ArrowButton v-if="moveUp" :on-click="moveUp" :rotation="270" />
        <ArrowButton v-if="parentUp" :on-click="parentUp" :rotation="315" />
        <ArrowButton v-if="parentDown" :on-click="parentDown" :rotation="45" />
        <ArrowButton v-if="moveDown" :on-click="moveDown" :rotation="90" />
        <button class="symbol-button" v-if="deleteSelf" @click="deleteSelf">X</button>
      </div>
    </header>
    <button :onClick="toggleEditor">{{ hideEditor ? 'Edit' : 'Minimize' }}</button>
    <div v-show="!hideEditor">
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
        :parent-attributes="parentAttributes"
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
    </div>
    <button v-show="element.children.length" @click="toggleChildren">
      {{ hideChildren ? 'Show children' : 'Hide children' }}
    </button>
    <div v-show="!hideChildren" class="children">
      <ElementEditor
        v-for="(child, index) in element.children"
        :element="child"
        :inherited-attributes="allAttributes"
        :refresh-preview="refreshPreview"
        :key="child.key"
        :generate-key="generateKey"
        :parent-element="element"
        :canvas="isCanvas ? element : canvas"
        :delete-self="() => removeChild(index)"
        :move-up="index > 0 ? () => moveChildUp(index) : undefined"
        :parent-up="index > 0 ? () => parentChildUp(index) : undefined"
        :move-down="index < element.children.length - 1 ? () => moveChildDown(index) : undefined"
        :parent-down="
          index < element.children.length - 1 ? () => parentChildDown(index) : undefined
        "
        :unparent="parentElement ? () => childToSibling(index) : undefined"
      >
      </ElementEditor>
    </div>
    <ChildAdder
      v-show="!hideEditor"
      :add-child="addChild"
      :canvas="isCanvas ? element : canvas"
    ></ChildAdder>
  </div>
</template>
