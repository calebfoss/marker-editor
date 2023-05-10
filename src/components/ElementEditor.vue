<script setup lang="ts">
import MarkerElements from './MarkerElements'
const { element, remove } = defineProps<{ element: MarkerElement; remove?: () => void }>()

const removable = typeof remove !== 'undefined'

function addChild(e: Event) {
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const tag = formData.get('select-tag') as string
  const child: MarkerElement = {
    tag,
    attributes: {},
    children: []
  }
  element.children.push(child)
}

function removeChild(index: number) {
  element.children = element.children.slice(0, index).concat(element.children.slice(index + 1))
}
</script>

<template>
  <section style="border: white solid 2px; padding: 20px; border-radius: 20px">
    <div style="display: grid; grid-auto-flow: column">
      <h2>{{ element.tag }}</h2>
      <button v-if="removable" @click="remove">x</button>
    </div>
    <div style="margin-left: 40px">
      <ElementEditor
        v-for="(child, index) in element.children"
        :element="child"
        :remove="() => removeChild(index)"
      ></ElementEditor>
      <form @submit.prevent="addChild">
        <select name="select-tag">
          <option v-for="tag in MarkerElements" :value="tag" v-text="tag"></option>
        </select>
        <input type="submit" value="+" />
      </form>
    </div>
  </section>
</template>
