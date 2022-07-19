export type NicoSetting = {
  isLiveEnabled: boolean
  isTimeshiftEnabled: boolean
  mail?: string
  pass?: string
}

export type NicoLogComment = {
  thread: string
  no: string
  vpos: string
  date: string
  date_usec: string
  mail: string
  user_id: string
  anonymity: string
  content: string
}

export type NicoLiveChat = {
  thread: string
  no?: number
  vpos: number
  date: number
  date_usec: number
  mail: string
  user_id: string
  premium: number
  anonymity: number
  content: string
}

export type IdealChat = Omit<
  NicoLogComment,
  "no" | "vpos" | "date" | "date_usec"
> & {
  no: number
  vpos: number
  date: number
  date_usec: number
  time: number
}
