<script setup lang="ts">
import AttributeAdder from './AttributeAdder.vue'
import AttributeEditor from './AttributeEditor.vue'
import ChildAdder from './ChildAdder.vue'

const { element, remove, refreshPreview } = defineProps<{
  element: MarkerElement
  remove?: () => void
  docs: MarkerDocs
  refreshPreview: () => void
}>()

function addChild(e: Event) {
  const el = e.target as HTMLInputElement | HTMLFormElement
  const form = el instanceof HTMLFormElement ? el : el.form
  if (form === null) return
  const formData = new FormData(form)
  const tag = formData.get('select-tag') as string
  const child: MarkerElement = {
    tag,
    attributes: {},
    children: [],
    description: ''
  }
  element.children.push(child)
  refreshPreview()
}

function removeChild(index: number) {
  element.children = element.children.slice(0, index).concat(element.children.slice(index + 1))
  refreshPreview()
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
</script>

<template>
  <div class="element-editor" :tabindex="0" @keydown.delete.stop="remove">
    <header>
      <h2>{{ element.tag }}</h2>
    </header>
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
        :docs="docs"
        :refresh-preview="refreshPreview"
      >
      </ElementEditor>
    </div>
    <ChildAdder :add-child="addChild" :docs="docs"></ChildAdder>
  </div>
</template>
