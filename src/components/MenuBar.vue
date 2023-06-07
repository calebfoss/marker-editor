<script lang="ts" setup>
import { ref } from 'vue'
import Menu from './Menu.vue'

defineProps<{
  generateKey: () => string
  rootElement: MarkerElement
  refreshPreview: () => void
  showHelp: () => void
  resetSketch: () => void
}>()

const hamburgerOpen = ref(false)
const toggleHamburger = () => (hamburgerOpen.value = !hamburgerOpen.value)

const checkMobileDimension = () => window.matchMedia('(max-width: calc(70ch + 400px))').matches
const mobileDimension = ref(checkMobileDimension())
window.addEventListener('resize', () => (mobileDimension.value = checkMobileDimension()))
</script>

<template>
  <header id="menu-bar">
    <div style="display: flex; width: 100%">
      <img style="height: 100%" src="../assets/logo.svg" />
      <h1>p5 Marker Editor</h1>
    </div>
    <button v-if="mobileDimension" style="background: none; height: 100%" @click="toggleHamburger">
      <img v-if="hamburgerOpen" src="../assets/x.svg" width="30" height="30" />
      <img v-else src="../assets/hamburger.svg" width="30" height="30" />
    </button>
    <Menu
      v-else
      :generateKey="generateKey"
      :rootElement="rootElement"
      :refreshPreview="refreshPreview"
      :toggleHamburger="toggleHamburger"
      :hamburgerOpen="hamburgerOpen"
      :showHelp="showHelp"
      :reset-sketch="resetSketch"
    ></Menu>
  </header>
  <Menu
    v-if="mobileDimension"
    :style="{ translate: `0% ${hamburgerOpen ? 0 : -100}%` }"
    :generateKey="generateKey"
    :rootElement="rootElement"
    :refreshPreview="refreshPreview"
    :toggleHamburger="toggleHamburger"
    :showHelp="showHelp"
    :reset-sketch="resetSketch"
  ></Menu>
</template>
