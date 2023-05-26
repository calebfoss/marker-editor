<script lang="ts" setup>
import { inject, ref, type Ref, onMounted } from 'vue'
import ElementPreview from './ElementPreview.vue'
const { iframeRef, rootElement } = defineProps<{
  iframeRef: Ref<HTMLIFrameElement>
  rootElement: MarkerElement
}>()

const show = ref<boolean>(false)
const customElements = inject<MarkerDocs>('customElements') as MarkerDocs
const baseElements = inject<MarkerDocs>('baseElements') as MarkerDocs

onMounted(() => {
  function defineCustomElements(el: MarkerElement) {
    const nameStrippedOfSemicolons = el.attributes.name
      ?.match(/;?([^;]*);?/)
      ?.slice(1)
      .join()
    const customElementTag = `p-${nameStrippedOfSemicolons}`
    const iframeWindow = iframeRef.value.contentWindow as Window
    const iframeCustomElements = iframeWindow.customElements
    if (
      'name' in el.attributes &&
      typeof iframeCustomElements.get(customElementTag) === 'undefined'
    ) {
      const elementConstructor = iframeCustomElements.get(el.tag)

      if (typeof elementConstructor !== 'undefined') {
        const iframeDoc = iframeRef.value.contentDocument as Document
        const { renderFunctionName } = iframeDoc.createElement(el.tag) as HTMLElement & {
          renderFunctionName: string
        }
        class CustomElement extends elementConstructor {
          renderFunctionName = renderFunctionName
          constructor() {
            super()
          }
          setDefaults() {
            for (const [attrName, attrValue] of Object.entries(el.attributes)) {
              if (!this.hasAttribute(attrName)) this.setAttribute(attrName, attrValue)
            }
            function setupChildren(elementData: MarkerElement, domElement: HTMLElement) {
              for (const childData of elementData.children) {
                const childDOMElement = iframeDoc.createElement(childData.tag) as HTMLElement & {
                  setup: (pInst: any, canvas: any) => void
                }
                for (const [grandAttrName, grandAttrValue] of Object.entries(
                  childData.attributes
                )) {
                  childDOMElement.setAttribute(grandAttrName, grandAttrValue)
                }
                domElement.appendChild(childDOMElement)
                setupChildren(childData, childDOMElement)
              }
            }
            setupChildren(el, this)
          }
        }
        iframeCustomElements.define(customElementTag, CustomElement)
        customElements.push({
          name: customElementTag,
          description: '',
          attributes: baseElements.find((doc) => doc.name === el.tag)?.attributes || []
        })
      }
    }
    for (const child of el.children) {
      defineCustomElements(child)
    }
  }
  defineCustomElements(rootElement)
  show.value = true
})
</script>

<template><ElementPreview v-if="show" :element="rootElement"></ElementPreview></template>
