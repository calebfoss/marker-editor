<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { exclusively_3d_elements } from './Primitives3D'
const { addChild, canvas } = defineProps<{
  addChild: (tag: string) => void
  canvas?: MarkerElement
}>()

const adding = ref(false)
const baseElements = inject<MarkerDocs>('baseElements') as MarkerDocs
const customElements = inject<MarkerDocs>('customElements') as MarkerDocs

function toggleSelect() {
  adding.value = !adding.value
}

function onSubmit(e: Event) {
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const tag = formData.get('select-tag') as string
  addChild(tag)
  if (e.target instanceof HTMLElement) e.target.blur()
}

function optionClicked(e: Event) {
  const option = e.target as HTMLOptionElement
  addChild(option.value)
  toggleSelect()
}

const filteredOptions = computed(() =>
  baseElements.concat(...customElements).filter((docElement) => {
    if (typeof canvas === 'undefined') return true
    if (docElement.name.slice(2, 9) === `canvas`) return false
    const is3d =
      docElement.name.slice(-2) === `3d` ||
      exclusively_3d_elements.includes(docElement.name.slice(2))
    if (canvas.tag.slice(-2) === '3d') return is3d
    return !is3d
  })
)
</script>
<template>
  <div>
    <button v-show="!adding" @click="toggleSelect">Add child</button>
    <form v-show="adding" @submit.prevent="onSubmit">
      <select name="select-tag">
        <option
          v-for="docElement in filteredOptions"
          :value="docElement.name"
          @click.prevent="optionClicked"
        >
          {{ docElement.name.slice(2) }}
        </option>
      </select>
      <input type="submit" value="+" />
    </form>
  </div>
</template>
