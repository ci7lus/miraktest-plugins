export type SayaSetting = {
  baseUrl?: string
  replaces: [string, string][]
  isEnabled: boolean
  isTimeshiftEnabled: boolean
  isTwitterDisabled: boolean
  is5chDisabled: boolean
  isNicojkDisabled: boolean
}

export type SayaDefinitionBoard = {
  id: string
  name: string
  server: string
  board: string
}

export type SayaDefinitionChannel = {
  annictId?: number
  boardIds: string[]
  flag: number
  hasOfficialNicolive: boolean
  miyoutvId?: string
  name: string
  networkId: number
  nicojkId?: number
  nicoliveCommunityIds?: string[]
  nicoliveTags?: string[]
  serviceIds: number[]
  syobocalId?: number
  twitterKeywords: string[]
  type: "GR" | "BS" | "CS"
}

export type SayaDefinition = {
  boards: SayaDefinitionBoard[]
  channels: SayaDefinitionChannel[]
}
