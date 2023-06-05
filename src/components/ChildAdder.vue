<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
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

const primitives3d = ['plane', 'box', 'sphere', 'cylinder', 'cone', 'ellipsoid', 'torus', 'model']
const filteredOptions = computed(() =>
  baseElements.concat(...customElements).filter((docElement) => {
    if (typeof canvas === 'undefined') return true
    if (docElement.name.slice(2, 9) === `canvas`) return false
    const is3d =
      docElement.name.slice(-2) === `3d` || primitives3d.includes(docElement.name.slice(2))
    if (canvas.tag.slice(-2) === '3d') return is3d
    return !is3d
  })
)
</script>
<template>
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
</template>
