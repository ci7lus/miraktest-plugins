export type NicoCommentChat = {
  thread?: number
  no?: number
  vpos?: number
  date: number
  date_usec?: number
  premium?: number
  anonymity?: number
  user_id?: string
  mail: string
  content: string
}

export type NicoCommentList = {
  chat: NicoCommentChat
}[]
