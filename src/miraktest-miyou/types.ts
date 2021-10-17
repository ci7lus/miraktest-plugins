export type MiyouSetting = {
  isEnabled: boolean
  mail?: string
  pass?: string
}

export type MiyouComment = {
  channels: string[]
  email: string
  id: string
  name: string
  text: string
  time: number
  title: string
}
