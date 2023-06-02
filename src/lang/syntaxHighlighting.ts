import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const sat = 100
const light = 80

export const markerSyntaxHighlighting = syntaxHighlighting(
  HighlightStyle.define(
    [
      tags.bool,
      tags.number,
      tags.propertyName,
      tags.keyword,
      tags.string,
      tags.compareOperator,
      tags.logicOperator
    ].map((tag, i, arr) => ({
      tag,
      color: `hsl(${(i / arr.length) * 360}deg ${sat}% ${light}%)`
    }))
  )
)
