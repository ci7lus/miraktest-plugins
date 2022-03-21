export type LiveProgram = {
  id: string
  title: string
  description: string
  thumbnailUrl: ThumbnailUrl
  beginAt: string
  endAt: string
  showTime: ShowTime
  onAirTime: ShowTime
  liveCycle: string
  providerType: string
  providerId: string
  socialGroupId: string
  isMemberOnly: boolean
  isPayProgram: boolean
  isChannelRelatedOfficial: boolean
  viewCount: number
  commentCount: number
  timeshiftReservedCount: number
  tags: Tag[]
  deviceFilter: DeviceFilter
  liveScreenshotThumbnailUrls: LiveScreenshotThumbnailUrls
  isPortrait: boolean
  timeshift: Timeshift
  contentOwner: ContentOwner
}

interface ContentOwner {
  type: string
  id: string
  name: string
  icon: string
  level: number
}

interface Timeshift {
  enabled: boolean
  status: string
}

interface LiveScreenshotThumbnailUrls {
  large: string
  middle: string
  small: string
  micro: string
}

interface DeviceFilter {
  isPlayable: boolean
  isListing: boolean
  isArchivePlayable: boolean
  isChasePlayable: boolean
}

interface Tag {
  text: string
}

interface ShowTime {
  beginAt: string
  endAt: string
}

interface ThumbnailUrl {
  normal: string
}

export type PartialLiveProgram = Partial<LiveProgram> & { id: string }
