export type DPlayerCommentPayload = {
  sourceUrl?: string | null
  source: string
  no: number
  time: number
  timeMs: number
  author: string
  text: string
  color: string
  type: string
  commands?: string[]
}
