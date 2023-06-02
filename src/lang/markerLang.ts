import { parser } from './parser'
import { LanguageSupport, LRLanguage } from '@codemirror/language'
import { styleTags, tags } from '@lezer/highlight'
import { completeFromList } from '@codemirror/autocomplete'

const markerScript = LRLanguage.define({ parser }).configure({
  props: [
    styleTags({
      Boolean: tags.bool,
      Number: tags.number,
      Property: tags.propertyName,
      Member: tags.propertyName,
      Not: tags.keyword,
      Until: tags.keyword,
      String: tags.string,
      ComparisonOperator: tags.compareOperator,
      LogicalOperator: tags.logicOperator
    })
  ]
})

export const markerScriptSupport = (attributes: string[]) =>
  new LanguageSupport(markerScript, [
    markerScript.data.of({
      autocomplete: completeFromList(
        attributes.map((attrName) => ({ label: attrName, type: 'Property' }))
      )
    })
  ])
