export type ChatInput = {
  thread: string
  no: string
  content: string
  vpos: number
  mail: string[]
  date: string
  dateUsec: number | null
  userId?: string
  anonymous: boolean
  commands: string[]
  score?: undefined
  fork?: undefined
  position?: "ue" | "naka" | "shita" | (string & {})
  size?: string
  colorName?: string
  colorCode?: string
  color?: string
  font?: string
  atNumber?: number
}

export const PECORE_ID = "io.github.ci7lus.miraktest-plugins.pecore.comment"
