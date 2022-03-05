/* eslint-disable */

export type EmbeddedData = {
  akashic: Akashic
  site: Site2
  user: User
  program: Program
  socialGroup: SocialGroup
  player: Player2
  ad: Ad2
  billboard: Substitute
  assets: Assets
  nicoEnquete: NicoEnquete
  channel: Channel2
  channelFollower: ChannelFollower
  channelMember: ChannelFollower
  userProgramWatch: UserProgramWatch
  userProgramReservation: UserProgramReservation
  programWatch: ProgramWatch
  programTimeshift: ProgramTimeshift
  programTimeshiftWatch: ProgramTimeshiftWatch
  premiumAppealBanner: PremiumAppealBanner
  stream: Stream3
  programBroadcaster: ProgramBroadcaster
  programSuperichiba: ProgramSuperichiba
  userCommentBehavior: UserCommentBehavior
  broadcasterBroadcastRequest: BroadcasterBroadcastRequest
  restriction: Restriction
}

interface Restriction {
  developmentFeatures: any[]
}

interface BroadcasterBroadcastRequest {
  recievedUserId?: any
  thanksMessageText: string
  readList: ReadList
  unreadList: UnreadList
}

interface UnreadList {
  items: any[]
  requestTotal?: any
}

interface ReadList {
  items: any[]
}

interface UserCommentBehavior {
  isImproper: boolean
}

interface ProgramSuperichiba {
  programIsPermittedToRequestSpecificNeta: boolean
}

interface ProgramBroadcaster {
  konomiTags: any[]
}

interface Stream3 {
  fmp4: Fmp4
}

interface Fmp4 {
  enabled: boolean
  userTest: UserTest
}

interface UserTest {
  condition: Condition3
}

interface Condition3 {
  isWithinUserTestTime: boolean
}

interface PremiumAppealBanner {
  premiumRegistrationUrl: string
}

interface ProgramTimeshiftWatch {
  condition: Condition2
}

interface Condition2 {
  needReservation: boolean
}

interface ProgramTimeshift {
  watchLimit: string
  publication: Publication
  reservation: Reservation
  validDuration?: any
}

interface Reservation {
  expireTime: number
}

interface Publication {
  status: string
  expireTime: number
}

interface ProgramWatch {
  condition: Condition
}

interface Condition {
  needLogin: boolean
}

interface UserProgramReservation {
  isReserved: boolean
}

interface UserProgramWatch {
  rejectedReasons: any[]
  expireTime?: any
  canAutoRefresh: boolean
}

interface ChannelFollower {
  records: any[]
}

interface Channel2 {
  id: string
  programHistoryPageUrl: string
  registerPageUrl: string
}

interface NicoEnquete {
  isEnabled: boolean
}

interface Assets {
  scripts: Scripts
  stylesheets: Stylesheets
}

interface Stylesheets {
  "pc-watch": string
  "operator-tools": string
  "broadcaster-tool": string
}

interface Scripts {
  "pc-watch": string
  "operator-tools": string
  "broadcaster-tool": string
  "comment-renderer": string
  vendor: string
  nicolib: string
  polyfill: string
  domain: string
  usecase: string
  infra: string
  gateway: string
}

interface Ad2 {
  isBillboardEnabled: boolean
  isSiteHeaderBannerEnabled: boolean
  isProgramInformationEnabled: boolean
  isFooterEnabled: boolean
  isPlayerEnabled: boolean
  adsJsUrl: string
}

interface Player2 {
  name: string
  audienceToken: string
  isJumpDisabled: boolean
  disablePlayVideoAd: boolean
  isRestrictedCommentPost: boolean
  streamAllocationType: string
}

interface SocialGroup {
  type: string
  id: string
  broadcastHistoryPageUrl: string
  description: string
  name: string
  socialGroupPageUrl: string
  thumbnailImageUrl: string
  thumbnailSmallImageUrl: string
  companyName: string
  isPayChannel: boolean
  isFollowed: boolean
  isJoined: boolean
}

interface Program {
  allegation: Allegation
  nicoliveProgramId: string
  reliveProgramId: string
  providerType: string
  visualProviderType: string
  title: string
  thumbnail: Thumbnail
  supplier: Supplier
  openTime: number
  beginTime: number
  vposBaseTime: number
  endTime: number
  scheduledEndTime: number
  status: string
  description: string
  substitute: Substitute
  tag: Tag2
  links: Links
  player: Player
  watchPageUrl: string
  gatePageUrl: string
  mediaServerType: string
  isPrivate: boolean
  isTest: boolean
  audienceCommentCommand: AudienceCommentCommand
  report: Report
  isFollowerOnly: boolean
  cueSheet: CueSheet
  cueSheetSnapshot: CueSheetSnapshot
  nicoad: Nicoad2
  isGiftEnabled: boolean
  stream: Stream2
  superichiba: Superichiba3
  isChasePlayEnabled: boolean
  isTimeshiftDownloadEnabled: boolean
  statistics: Statistics
  isPremiumAppealBannerEnabled: boolean
  isRecommendEnabled: boolean
  isEmotionEnabled: boolean
}

interface Statistics {
  watchCount: number
  commentCount: number
}

interface Superichiba3 {
  allowAudienceToAddNeta: boolean
  canSupplierUse: boolean
}

interface Stream2 {
  maxQuality: string
}

interface Nicoad2 {
  totalPoint: number
  ranking: any[]
}

interface CueSheetSnapshot {
  commentLocked: boolean
  audienceCommentLayout: string
}

interface CueSheet {
  eventsApiUrl: string
}

interface Report {
  imageApiUrl: string
}

interface AudienceCommentCommand {
  isColorCodeEnabled: boolean
}

interface Player {
  embedUrl: string
  banner: Banner
}

interface Banner {
  apiUrl: string
}

interface Links {
  feedbackPageUrl: string
  contentsTreePageUrl: string
  programReportPageUrl: string
}

interface Tag2 {
  updateApiUrl: string
  lockApiUrl: string
  reportApiUrl: string
  list: List[]
  isLocked: boolean
}

interface List {
  text: string
  existsNicopediaArticle: boolean
  nicopediaArticlePageUrl: string
  type: string
  isLocked: boolean
  isDeletable: boolean
}

interface Substitute {}

interface Supplier {
  name: string
}

interface Thumbnail {
  small: string
  large: string
}

interface Allegation {
  commentAllegationApiUrl: string
}

interface User {
  isExplicitlyLoginable: boolean
  isMobileMailAddressRegistered: boolean
  isMailRegistered: boolean
  isProfileRegistered: boolean
  isLoggedIn: boolean
  accountType: string
  isOperator: boolean
  isBroadcaster: boolean
  premiumOrigin: string
  permissions: string[]
  nicosid: string
  superichiba: Superichiba2
}

interface Superichiba2 {
  deletable: boolean
  hasBroadcasterRole: boolean
}

interface Site2 {
  locale: string
  serverTime: number
  frontendVersion: string
  apiBaseUrl: string
  pollingApiBaseUrl: string
  staticResourceBaseUrl: string
  topPageUrl: string
  programCreatePageUrl: string
  programEditPageUrl: string
  programWatchPageUrl: string
  recentPageUrl: string
  programArchivePageUrl: string
  myPageUrl: string
  rankingPageUrl: string
  searchPageUrl: string
  focusPageUrl: string
  timetablePageUrl: string
  followedProgramsPageUrl: string
  frontendId: number
  familyService: FamilyService
  environments: Environments
  relive: Relive
  information: Information
  rule: Rule
  spec: Spec
  ad: Ad
  tag: Tag
  coe: Coe
  timeshift: Timeshift
  broadcast: Broadcast
  enquete: Enquete
  trialWatch: Enquete
  autoExtend: Enquete
  nicobus: Nicobus
  dmc: Dmc
  frontendPublicApiUrl: string
  party1staticBaseUrl: string
  party1binBaseUrl: string
  party2binBaseUrl: string
  gift: Gift
  creatorPromotionProgram: CreatorPromotionProgram
  stream: Stream
  performance: Performance
  nico: Nico
  akashic: Akashic3
  device: Device
  nicoCommonHeaderResourceBaseUrl: string
  authony: Nicoex
  follo: Nicobus
  payment: Payment
  externalWatch: Emotion
  channelRegistration: ChannelRegistration
  broadcastRequest: Nicoex
}

interface ChannelRegistration {
  multiSubscriptionWithPremiumBenefitHelpPageUrl: string
}

interface Payment {
  eventPageBaseUrl: string
  productPageBaseUrl: string
}

interface Device {
  watchOnPlayStation4HelpPageUrl: string
  safariCantWatchHelpPageUrl: string
}

interface Akashic3 {
  switchRenderHelpPageUrl: string
}

interface Nico {
  webPushNotificationReceiveSettingHelpPageUrl: string
}

interface Performance {
  commentRender: CommentRender
}

interface CommentRender {
  liteModeHelpPageUrl: string
}

interface Stream {
  lowLatencyHelpPageUrl: string
}

interface CreatorPromotionProgram {
  registrationHelpPageUrl: string
}

interface Gift {
  cantOpenPageCausedAdBlockHelpPageUrl: string
}

interface Dmc {
  webRtc: WebRtc
}

interface WebRtc {
  stunServerUrls: any[]
}

interface Nicobus {
  publicApiBaseUrl: string
}

interface Enquete {
  usageHelpPageUrl: string
}

interface Broadcast {
  usageHelpPageUrl: string
  stableBroadcastHelpPageUrl: string
  nair: Nair
  broadcasterStreamHelpPageUrl: string
}

interface Nair {
  downloadPageUrl: string
}

interface Timeshift {
  reservationDetailListApiUrl: string
}

interface Coe {
  coeContentBaseUrl: string
}

interface Tag {
  revisionCheckIntervalMs: number
  registerHelpPageUrl: string
  userRegistrableMax: number
  textMaxLength: number
}

interface Ad {
  adsApiBaseUrl: string
}

interface Spec {
  watchUsageAndDevicePageUrl: string
  broadcastUsageDevicePageUrl: string
  cruisePageUrl: string
}

interface Rule {
  agreementPageUrl: string
  guidelinePageUrl: string
}

interface Information {
  maintenanceInformationPageUrl: string
}

interface Relive {
  apiBaseUrl: string
  webSocketUrl: string
  csrfToken: string
  audienceToken: string
}

interface Environments {
  runningMode: string
}

interface FamilyService {
  account: Account
  app: App
  channel: Channel
  commons: App
  community: App
  dic: App
  help: Help
  ichiba: App
  news: App
  nicoad: Nicoad
  nicokoken: Nicokoken
  niconico: Niconico
  point: Point
  seiga: Seiga
  site: Site
  solid: App
  video: Video
  faq: Faq
  bugreport: Faq
  rightsControlProgram: Faq
  licenseSearch: Faq
  info: Info
  search: Search
  nicoex: Nicoex
  akashic: Akashic2
  superichiba: Superichiba
  nAir: App
  emotion: Emotion
}

interface Emotion {
  baseUrl: string
}

interface Superichiba {
  apiBaseUrl: string
  launchApiBaseUrl: string
  oroshiuriIchibaBaseUrl: string
}

interface Akashic2 {
  untrustedFrameUrl: string
}

interface Nicoex {
  apiBaseUrl: string
}

interface Search {
  suggestionApiUrl: string
}

interface Info {
  warnForPhishingPageUrl: string
  nintendoGuidelinePageUrl: string
}

interface Faq {
  pageUrl: string
}

interface Video {
  topPageUrl: string
  myPageUrl: string
  watchPageBaseUrl: string
  liveWatchHistoryPageUrl: string
  uploadedVideoListPageUrl: string
  ownedTicketsPageUrl: string
  purchasedSerialsPageUrl: string
  timeshiftReservationsPageUrl: string
}

interface Site {
  salesAdvertisingPageUrl: string
  liveAppDownloadPageUrl: string
  videoPremiereIntroductionPageUrl: string
  premiumContentsPageUrl: string
  creatorMonetizationInformationPageUrl: string
}

interface Seiga {
  topPageUrl: string
  seigaPageBaseUrl: string
  comicPageBaseUrl: string
}

interface Point {
  topPageUrl: string
  purchasePageUrl: string
}

interface Niconico {
  topPageUrl: string
  userPageBaseUrl: string
}

interface Nicokoken {
  topPageUrl: string
  helpPageUrl: string
}

interface Nicoad {
  topPageUrl: string
  apiBaseUrl: string
}

interface Help {
  liveHelpPageUrl: string
  systemRequirementsPageUrl: string
}

interface Channel {
  topPageUrl: string
  forOrganizationAndCompanyPageUrl: string
}

interface App {
  topPageUrl: string
}

interface Account {
  accountRegistrationPageUrl: string
  loginPageUrl: string
  logoutPageUrl: string
  premiumMemberRegistrationPageUrl: string
  trackingParams: TrackingParams
  profileRegistrationPageUrl: string
  contactsPageUrl: string
  verifyEmailsPageUrl: string
  accountSettingPageUrl: string
  currentPageUrl: string
  premiumMeritPageUrl: string
  accountSystemBapiBaseUrl: string
}

interface TrackingParams {
  siteId: string
  pageId: string
  mode: string
  programStatus: string
}

interface Akashic {
  trustedChildOrigin: string
}
