<script setup lang="ts">
import { ref } from 'vue'
import manifest from '../custom-elements.json'

const { element, docs, addAttribute } = defineProps<{
  element: MarkerElement
  addAttribute: (e: Event) => void
  docs: MarkerDocs
}>()

const docElement = docs.find((el) => el.name === element.tag)
const options =
  typeof docElement === 'undefined'
    ? ['custom']
    : ['custom'].concat(
        docElement.attributes
          .map(({ name }) => name)
          .filter((a) => a in element.attributes === false)
      )

const selected = ref(options[0])

function handleSelectionChange(e: Event) {
  if (selected.value !== 'custom') {
    addAttribute(e)
    toggle()
  }
}

const adding = ref(false)

function toggle() {
  adding.value = !adding.value
}

function handleSubmit(e: Event) {
  addAttribute(e)
  toggle()
}
</script>

<template>
  <button v-show="!adding" @click="toggle">Add attribute</button>
  <form
    v-show="adding"
    class="attribute-adder"
    @submit.prevent="handleSubmit"
    @change="handleSelectionChange"
  >
    <select name="attribute-name" v-model="selected">
      <option v-for="prop in options" :value="prop">{{ prop }}</option>
    </select>
    <input
      name="attribute-custom"
      v-show="selected === 'custom'"
      @keydown.delete.stop
      autocomplete="false"
    />
    <input type="submit" value="+" />
  </form>
</template>
