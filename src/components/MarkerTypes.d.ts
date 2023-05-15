type MarkerElement = {
  tag: string
  attributes: { [key: string]: string }
  children: MarkerElement[]
  description: string
}

type MarkerAttributes = {
  [key: string]: string
}

type MarkerDocAttribute = {
  name: string
  description: string
}

type MarkerDocElement = {
  name: string
  description: string
  attributes: MarkerDocAttribute[]
}

type MarkerDocs = MarkerDocElement[]
