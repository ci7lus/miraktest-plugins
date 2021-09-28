export type SayaSetting = {
  baseUrl?: string
  replaces: [string, string][]
}

export type SayaCommentPayload = {
  sourceUrl: string | null
  source: string
  no: number
  time: number
  timeMs: number
  author: string
  text: string
  color: string
  type: "right"
  commands: []
}
