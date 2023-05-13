<script setup lang="ts">
import { ref } from 'vue'
const { addChild } = defineProps<{ addChild: (e: Event) => void; docs: MarkerDocs }>()

const adding = ref(false)

function toggle() {
  adding.value = !adding.value
}

function handleSubmit(e: Event) {
  addChild(e)
  toggle()
}
</script>
<template>
  <button v-show="!adding" @click="toggle">Add child</button>
  <form v-show="adding" @submit.prevent="handleSubmit">
    <select name="select-tag" @change="handleSubmit" @blur="toggle">
      <option v-for="docElement in docs" :value="docElement.name" v-text="docElement.name"></option>
    </select>
    <input type="submit" value="+" />
  </form>
</template>
