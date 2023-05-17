<script setup lang="ts">
import { ref } from 'vue'
const { addChild } = defineProps<{ addChild: (tag: string) => void; docs: MarkerDocs }>()

const adding = ref(false)

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
</script>
<template>
  <button v-show="!adding" @click="toggleSelect">Add child</button>
  <form v-show="adding" @submit.prevent="onSubmit">
    <select name="select-tag">
      <option
        v-for="docElement in docs"
        :value="docElement.name"
        v-text="docElement.name"
        @click.prevent="optionClicked"
      ></option>
    </select>
    <input type="submit" value="+" />
  </form>
</template>
