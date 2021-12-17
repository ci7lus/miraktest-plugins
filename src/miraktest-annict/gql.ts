/* eslint-disable */
import { GraphQLClient } from "./graphqlRequestLoader"
import * as Dom from "graphql-request/dist/types.dom"
import gql from "graphql-tag"
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  DateTime: any
}

export type Activity = Node & {
  __typename?: "Activity"
  annictId: Scalars["Int"]
  id: Scalars["ID"]
  user: User
}

export enum ActivityAction {
  CREATE = "CREATE",
}

export type ActivityConnection = {
  __typename?: "ActivityConnection"
  edges: Maybe<Array<Maybe<ActivityEdge>>>
  nodes: Maybe<Array<Maybe<Activity>>>
  pageInfo: PageInfo
}

export type ActivityEdge = {
  __typename?: "ActivityEdge"
  action: ActivityAction
  annictId: Scalars["Int"]
  cursor: Scalars["String"]
  node: Maybe<ActivityItem>
  user: User
}

export type ActivityItem = MultipleRecord | WatchRecord | Review | Status

export type ActivityOrder = {
  direction: OrderDirection
  field: ActivityOrderField
}

export enum ActivityOrderField {
  CREATED_AT = "CREATED_AT",
}

export type Cast = Node & {
  __typename?: "Cast"
  annictId: Scalars["Int"]
  character: Character
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  person: Person
  sortNumber: Scalars["Int"]
  work: Work
}

export type CastConnection = {
  __typename?: "CastConnection"
  edges: Maybe<Array<Maybe<CastEdge>>>
  nodes: Maybe<Array<Maybe<Cast>>>
  pageInfo: PageInfo
}

export type CastEdge = {
  __typename?: "CastEdge"
  cursor: Scalars["String"]
  node: Maybe<Cast>
}

export type CastOrder = {
  direction: OrderDirection
  field: CastOrderField
}

export enum CastOrderField {
  CREATED_AT = "CREATED_AT",
  SORT_NUMBER = "SORT_NUMBER",
}

export type Channel = Node & {
  __typename?: "Channel"
  annictId: Scalars["Int"]
  channelGroup: ChannelGroup
  id: Scalars["ID"]
  name: Scalars["String"]
  programs: Maybe<ProgramConnection>
  published: Scalars["Boolean"]
  scChid: Scalars["Int"]
}

export type ChannelprogramsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type ChannelConnection = {
  __typename?: "ChannelConnection"
  edges: Maybe<Array<Maybe<ChannelEdge>>>
  nodes: Maybe<Array<Maybe<Channel>>>
  pageInfo: PageInfo
}

export type ChannelEdge = {
  __typename?: "ChannelEdge"
  cursor: Scalars["String"]
  node: Maybe<Channel>
}

export type ChannelGroup = Node & {
  __typename?: "ChannelGroup"
  annictId: Scalars["Int"]
  channels: Maybe<ChannelConnection>
  id: Scalars["ID"]
  name: Scalars["String"]
  sortNumber: Scalars["Int"]
}

export type ChannelGroupchannelsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type Character = Node & {
  __typename?: "Character"
  age: Scalars["String"]
  ageEn: Scalars["String"]
  annictId: Scalars["Int"]
  birthday: Scalars["String"]
  birthdayEn: Scalars["String"]
  bloodType: Scalars["String"]
  bloodTypeEn: Scalars["String"]
  description: Scalars["String"]
  descriptionEn: Scalars["String"]
  descriptionSource: Scalars["String"]
  descriptionSourceEn: Scalars["String"]
  favoriteCharactersCount: Scalars["Int"]
  height: Scalars["String"]
  heightEn: Scalars["String"]
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  nameKana: Scalars["String"]
  nationality: Scalars["String"]
  nationalityEn: Scalars["String"]
  nickname: Scalars["String"]
  nicknameEn: Scalars["String"]
  occupation: Scalars["String"]
  occupationEn: Scalars["String"]
  series: Series
  weight: Scalars["String"]
  weightEn: Scalars["String"]
}

export type CharacterConnection = {
  __typename?: "CharacterConnection"
  edges: Maybe<Array<Maybe<CharacterEdge>>>
  nodes: Maybe<Array<Maybe<Character>>>
  pageInfo: PageInfo
}

export type CharacterEdge = {
  __typename?: "CharacterEdge"
  cursor: Scalars["String"]
  node: Maybe<Character>
}

export type CharacterOrder = {
  direction: OrderDirection
  field: CharacterOrderField
}

export enum CharacterOrderField {
  CREATED_AT = "CREATED_AT",
  FAVORITE_CHARACTERS_COUNT = "FAVORITE_CHARACTERS_COUNT",
}

export type CreateRecordInput = {
  clientMutationId: Maybe<Scalars["String"]>
  comment: Maybe<Scalars["String"]>
  episodeId: Scalars["ID"]
  ratingState: Maybe<RatingState>
  shareFacebook: Maybe<Scalars["Boolean"]>
  shareTwitter: Maybe<Scalars["Boolean"]>
}

export type CreateRecordPayload = {
  __typename?: "CreateRecordPayload"
  clientMutationId: Maybe<Scalars["String"]>
  record: Maybe<WatchRecord>
}

export type CreateReviewInput = {
  body: Scalars["String"]
  clientMutationId: Maybe<Scalars["String"]>
  ratingAnimationState: Maybe<RatingState>
  ratingCharacterState: Maybe<RatingState>
  ratingMusicState: Maybe<RatingState>
  ratingOverallState: Maybe<RatingState>
  ratingStoryState: Maybe<RatingState>
  shareFacebook: Maybe<Scalars["Boolean"]>
  shareTwitter: Maybe<Scalars["Boolean"]>
  title: Maybe<Scalars["String"]>
  workId: Scalars["ID"]
}

export type CreateReviewPayload = {
  __typename?: "CreateReviewPayload"
  clientMutationId: Maybe<Scalars["String"]>
  review: Maybe<Review>
}

export type DeleteRecordInput = {
  clientMutationId: Maybe<Scalars["String"]>
  recordId: Scalars["ID"]
}

export type DeleteRecordPayload = {
  __typename?: "DeleteRecordPayload"
  clientMutationId: Maybe<Scalars["String"]>
  episode: Maybe<Episode>
}

export type DeleteReviewInput = {
  clientMutationId: Maybe<Scalars["String"]>
  reviewId: Scalars["ID"]
}

export type DeleteReviewPayload = {
  __typename?: "DeleteReviewPayload"
  clientMutationId: Maybe<Scalars["String"]>
  work: Maybe<Work>
}

export type Episode = Node & {
  __typename?: "Episode"
  annictId: Scalars["Int"]
  id: Scalars["ID"]
  nextEpisode: Maybe<Episode>
  number: Maybe<Scalars["Int"]>
  numberText: Maybe<Scalars["String"]>
  prevEpisode: Maybe<Episode>
  recordCommentsCount: Scalars["Int"]
  records: Maybe<RecordConnection>
  recordsCount: Scalars["Int"]
  satisfactionRate: Maybe<Scalars["Float"]>
  sortNumber: Scalars["Int"]
  title: Maybe<Scalars["String"]>
  viewerDidTrack: Scalars["Boolean"]
  viewerRecordsCount: Scalars["Int"]
  work: Work
}

export type EpisoderecordsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  hasComment: Maybe<Scalars["Boolean"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<RecordOrder>
}

export type EpisodeConnection = {
  __typename?: "EpisodeConnection"
  edges: Maybe<Array<Maybe<EpisodeEdge>>>
  nodes: Maybe<Array<Maybe<Episode>>>
  pageInfo: PageInfo
}

export type EpisodeEdge = {
  __typename?: "EpisodeEdge"
  cursor: Scalars["String"]
  node: Maybe<Episode>
}

export type EpisodeOrder = {
  direction: OrderDirection
  field: EpisodeOrderField
}

export enum EpisodeOrderField {
  CREATED_AT = "CREATED_AT",
  SORT_NUMBER = "SORT_NUMBER",
}

export enum Media {
  MOVIE = "MOVIE",
  OTHER = "OTHER",
  OVA = "OVA",
  TV = "TV",
  WEB = "WEB",
}

export type MultipleRecord = Node & {
  __typename?: "MultipleRecord"
  annictId: Scalars["Int"]
  createdAt: Scalars["DateTime"]
  id: Scalars["ID"]
  records: Maybe<RecordConnection>
  user: User
  work: Work
}

export type MultipleRecordrecordsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type Mutation = {
  __typename?: "Mutation"
  createRecord: Maybe<CreateRecordPayload>
  createReview: Maybe<CreateReviewPayload>
  deleteRecord: Maybe<DeleteRecordPayload>
  deleteReview: Maybe<DeleteReviewPayload>
  updateRecord: Maybe<UpdateRecordPayload>
  updateReview: Maybe<UpdateReviewPayload>
  updateStatus: Maybe<UpdateStatusPayload>
}

export type MutationcreateRecordArgs = {
  input: CreateRecordInput
}

export type MutationcreateReviewArgs = {
  input: CreateReviewInput
}

export type MutationdeleteRecordArgs = {
  input: DeleteRecordInput
}

export type MutationdeleteReviewArgs = {
  input: DeleteReviewInput
}

export type MutationupdateRecordArgs = {
  input: UpdateRecordInput
}

export type MutationupdateReviewArgs = {
  input: UpdateReviewInput
}

export type MutationupdateStatusArgs = {
  input: UpdateStatusInput
}

export type Node = {
  id: Scalars["ID"]
}

export enum OrderDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export type Organization = Node & {
  __typename?: "Organization"
  annictId: Scalars["Int"]
  favoriteOrganizationsCount: Scalars["Int"]
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  nameKana: Scalars["String"]
  staffsCount: Scalars["Int"]
  twitterUsername: Scalars["String"]
  twitterUsernameEn: Scalars["String"]
  url: Scalars["String"]
  urlEn: Scalars["String"]
  wikipediaUrl: Scalars["String"]
  wikipediaUrlEn: Scalars["String"]
}

export type OrganizationConnection = {
  __typename?: "OrganizationConnection"
  edges: Maybe<Array<Maybe<OrganizationEdge>>>
  nodes: Maybe<Array<Maybe<Organization>>>
  pageInfo: PageInfo
}

export type OrganizationEdge = {
  __typename?: "OrganizationEdge"
  cursor: Scalars["String"]
  node: Maybe<Organization>
}

export type OrganizationOrder = {
  direction: OrderDirection
  field: OrganizationOrderField
}

export enum OrganizationOrderField {
  CREATED_AT = "CREATED_AT",
  FAVORITE_ORGANIZATIONS_COUNT = "FAVORITE_ORGANIZATIONS_COUNT",
}

export type PageInfo = {
  __typename?: "PageInfo"
  endCursor: Maybe<Scalars["String"]>
  hasNextPage: Scalars["Boolean"]
  hasPreviousPage: Scalars["Boolean"]
  startCursor: Maybe<Scalars["String"]>
}

export type Person = Node & {
  __typename?: "Person"
  annictId: Scalars["Int"]
  birthday: Scalars["String"]
  bloodType: Scalars["String"]
  castsCount: Scalars["Int"]
  favoritePeopleCount: Scalars["Int"]
  genderText: Scalars["String"]
  height: Scalars["String"]
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  nameKana: Scalars["String"]
  nickname: Scalars["String"]
  nicknameEn: Scalars["String"]
  prefecture: Prefecture
  staffsCount: Scalars["Int"]
  twitterUsername: Scalars["String"]
  twitterUsernameEn: Scalars["String"]
  url: Scalars["String"]
  urlEn: Scalars["String"]
  wikipediaUrl: Scalars["String"]
  wikipediaUrlEn: Scalars["String"]
}

export type PersonConnection = {
  __typename?: "PersonConnection"
  edges: Maybe<Array<Maybe<PersonEdge>>>
  nodes: Maybe<Array<Maybe<Person>>>
  pageInfo: PageInfo
}

export type PersonEdge = {
  __typename?: "PersonEdge"
  cursor: Scalars["String"]
  node: Maybe<Person>
}

export type PersonOrder = {
  direction: OrderDirection
  field: PersonOrderField
}

export enum PersonOrderField {
  CREATED_AT = "CREATED_AT",
  FAVORITE_PEOPLE_COUNT = "FAVORITE_PEOPLE_COUNT",
}

export type Prefecture = Node & {
  __typename?: "Prefecture"
  annictId: Scalars["Int"]
  id: Scalars["ID"]
  name: Scalars["String"]
}

export type Program = Node & {
  __typename?: "Program"
  annictId: Scalars["Int"]
  channel: Channel
  episode: Episode
  id: Scalars["ID"]
  rebroadcast: Scalars["Boolean"]
  scPid: Maybe<Scalars["Int"]>
  startedAt: Scalars["DateTime"]
  state: ProgramState
  work: Work
}

export type ProgramConnection = {
  __typename?: "ProgramConnection"
  edges: Maybe<Array<Maybe<ProgramEdge>>>
  nodes: Maybe<Array<Maybe<Program>>>
  pageInfo: PageInfo
}

export type ProgramEdge = {
  __typename?: "ProgramEdge"
  cursor: Scalars["String"]
  node: Maybe<Program>
}

export type ProgramOrder = {
  direction: OrderDirection
  field: ProgramOrderField
}

export enum ProgramOrderField {
  STARTED_AT = "STARTED_AT",
}

export enum ProgramState {
  HIDDEN = "HIDDEN",
  PUBLISHED = "PUBLISHED",
}

export type Query = {
  __typename?: "Query"
  node: Maybe<Node>
  nodes: Array<Maybe<Node>>
  searchCharacters: Maybe<CharacterConnection>
  searchEpisodes: Maybe<EpisodeConnection>
  searchOrganizations: Maybe<OrganizationConnection>
  searchPeople: Maybe<PersonConnection>
  searchWorks: Maybe<WorkConnection>
  user: Maybe<User>
  viewer: Maybe<User>
}

export type QuerynodeArgs = {
  id: Scalars["ID"]
}

export type QuerynodesArgs = {
  ids: Array<Scalars["ID"]>
}

export type QuerysearchCharactersArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  names: Maybe<Array<Scalars["String"]>>
  orderBy: Maybe<CharacterOrder>
}

export type QuerysearchEpisodesArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<EpisodeOrder>
}

export type QuerysearchOrganizationsArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  names: Maybe<Array<Scalars["String"]>>
  orderBy: Maybe<OrganizationOrder>
}

export type QuerysearchPeopleArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  names: Maybe<Array<Scalars["String"]>>
  orderBy: Maybe<PersonOrder>
}

export type QuerysearchWorksArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<WorkOrder>
  seasons: Maybe<Array<Scalars["String"]>>
  titles: Maybe<Array<Scalars["String"]>>
}

export type QueryuserArgs = {
  username: Scalars["String"]
}

export enum RatingState {
  AVERAGE = "AVERAGE",
  BAD = "BAD",
  GOOD = "GOOD",
  GREAT = "GREAT",
}

export type WatchRecord = Node & {
  __typename?: "Record"
  annictId: Scalars["Int"]
  comment: Maybe<Scalars["String"]>
  commentsCount: Scalars["Int"]
  createdAt: Scalars["DateTime"]
  episode: Episode
  facebookClickCount: Scalars["Int"]
  id: Scalars["ID"]
  likesCount: Scalars["Int"]
  modified: Scalars["Boolean"]
  rating: Maybe<Scalars["Float"]>
  ratingState: Maybe<RatingState>
  twitterClickCount: Scalars["Int"]
  updatedAt: Scalars["DateTime"]
  user: User
  work: Work
}

export type RecordConnection = {
  __typename?: "RecordConnection"
  edges: Maybe<Array<Maybe<RecordEdge>>>
  nodes: Maybe<Array<Maybe<WatchRecord>>>
  pageInfo: PageInfo
}

export type RecordEdge = {
  __typename?: "RecordEdge"
  cursor: Scalars["String"]
  node: Maybe<WatchRecord>
}

export type RecordOrder = {
  direction: OrderDirection
  field: RecordOrderField
}

export enum RecordOrderField {
  CREATED_AT = "CREATED_AT",
  LIKES_COUNT = "LIKES_COUNT",
}

export type Review = Node & {
  __typename?: "Review"
  annictId: Scalars["Int"]
  body: Scalars["String"]
  createdAt: Scalars["DateTime"]
  id: Scalars["ID"]
  impressionsCount: Scalars["Int"]
  likesCount: Scalars["Int"]
  modifiedAt: Maybe<Scalars["DateTime"]>
  ratingAnimationState: Maybe<RatingState>
  ratingCharacterState: Maybe<RatingState>
  ratingMusicState: Maybe<RatingState>
  ratingOverallState: Maybe<RatingState>
  ratingStoryState: Maybe<RatingState>
  title: Maybe<Scalars["String"]>
  updatedAt: Scalars["DateTime"]
  user: User
  work: Work
}

export type ReviewConnection = {
  __typename?: "ReviewConnection"
  edges: Maybe<Array<Maybe<ReviewEdge>>>
  nodes: Maybe<Array<Maybe<Review>>>
  pageInfo: PageInfo
}

export type ReviewEdge = {
  __typename?: "ReviewEdge"
  cursor: Scalars["String"]
  node: Maybe<Review>
}

export type ReviewOrder = {
  direction: OrderDirection
  field: ReviewOrderField
}

export enum ReviewOrderField {
  CREATED_AT = "CREATED_AT",
  LIKES_COUNT = "LIKES_COUNT",
}

export enum SeasonName {
  AUTUMN = "AUTUMN",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  WINTER = "WINTER",
}

export type Series = Node & {
  __typename?: "Series"
  annictId: Scalars["Int"]
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  nameRo: Scalars["String"]
  works: Maybe<SeriesWorkConnection>
}

export type SeriesworksArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<SeriesWorkOrder>
}

export type SeriesConnection = {
  __typename?: "SeriesConnection"
  edges: Maybe<Array<Maybe<SeriesEdge>>>
  nodes: Maybe<Array<Maybe<Series>>>
  pageInfo: PageInfo
}

export type SeriesEdge = {
  __typename?: "SeriesEdge"
  cursor: Scalars["String"]
  node: Maybe<Series>
}

export type SeriesWorkConnection = {
  __typename?: "SeriesWorkConnection"
  edges: Maybe<Array<Maybe<SeriesWorkEdge>>>
  nodes: Maybe<Array<Maybe<Work>>>
  pageInfo: PageInfo
}

export type SeriesWorkEdge = {
  __typename?: "SeriesWorkEdge"
  cursor: Scalars["String"]
  node: Work
  summary: Maybe<Scalars["String"]>
  summaryEn: Maybe<Scalars["String"]>
}

export type SeriesWorkOrder = {
  direction: OrderDirection
  field: SeriesWorkOrderField
}

export enum SeriesWorkOrderField {
  SEASON = "SEASON",
}

export type Staff = Node & {
  __typename?: "Staff"
  annictId: Scalars["Int"]
  id: Scalars["ID"]
  name: Scalars["String"]
  nameEn: Scalars["String"]
  resource: StaffResourceItem
  roleOther: Scalars["String"]
  roleOtherEn: Scalars["String"]
  roleText: Scalars["String"]
  sortNumber: Scalars["Int"]
  work: Work
}

export type StaffConnection = {
  __typename?: "StaffConnection"
  edges: Maybe<Array<Maybe<StaffEdge>>>
  nodes: Maybe<Array<Maybe<Staff>>>
  pageInfo: PageInfo
}

export type StaffEdge = {
  __typename?: "StaffEdge"
  cursor: Scalars["String"]
  node: Maybe<Staff>
}

export type StaffOrder = {
  direction: OrderDirection
  field: StaffOrderField
}

export enum StaffOrderField {
  CREATED_AT = "CREATED_AT",
  SORT_NUMBER = "SORT_NUMBER",
}

export type StaffResourceItem = Organization | Person

export type Status = Node & {
  __typename?: "Status"
  annictId: Scalars["Int"]
  createdAt: Scalars["DateTime"]
  id: Scalars["ID"]
  likesCount: Scalars["Int"]
  state: StatusState
  user: User
  work: Work
}

export enum StatusState {
  NO_STATE = "NO_STATE",
  ON_HOLD = "ON_HOLD",
  STOP_WATCHING = "STOP_WATCHING",
  WANNA_WATCH = "WANNA_WATCH",
  WATCHED = "WATCHED",
  WATCHING = "WATCHING",
}

export type UpdateRecordInput = {
  clientMutationId: Maybe<Scalars["String"]>
  comment: Maybe<Scalars["String"]>
  ratingState: Maybe<RatingState>
  recordId: Scalars["ID"]
  shareFacebook: Maybe<Scalars["Boolean"]>
  shareTwitter: Maybe<Scalars["Boolean"]>
}

export type UpdateRecordPayload = {
  __typename?: "UpdateRecordPayload"
  clientMutationId: Maybe<Scalars["String"]>
  record: Maybe<WatchRecord>
}

export type UpdateReviewInput = {
  body: Scalars["String"]
  clientMutationId: Maybe<Scalars["String"]>
  ratingAnimationState: RatingState
  ratingCharacterState: RatingState
  ratingMusicState: RatingState
  ratingOverallState: RatingState
  ratingStoryState: RatingState
  reviewId: Scalars["ID"]
  shareFacebook: Maybe<Scalars["Boolean"]>
  shareTwitter: Maybe<Scalars["Boolean"]>
  title: Maybe<Scalars["String"]>
}

export type UpdateReviewPayload = {
  __typename?: "UpdateReviewPayload"
  clientMutationId: Maybe<Scalars["String"]>
  review: Maybe<Review>
}

export type UpdateStatusInput = {
  clientMutationId: Maybe<Scalars["String"]>
  state: StatusState
  workId: Scalars["ID"]
}

export type UpdateStatusPayload = {
  __typename?: "UpdateStatusPayload"
  clientMutationId: Maybe<Scalars["String"]>
  work: Maybe<Work>
}

export type User = Node & {
  __typename?: "User"
  activities: Maybe<ActivityConnection>
  annictId: Scalars["Int"]
  avatarUrl: Maybe<Scalars["String"]>
  backgroundImageUrl: Maybe<Scalars["String"]>
  createdAt: Scalars["DateTime"]
  description: Scalars["String"]
  email: Maybe<Scalars["String"]>
  followers: Maybe<UserConnection>
  followersCount: Scalars["Int"]
  following: Maybe<UserConnection>
  followingActivities: Maybe<ActivityConnection>
  followingsCount: Scalars["Int"]
  id: Scalars["ID"]
  name: Scalars["String"]
  notificationsCount: Maybe<Scalars["Int"]>
  onHoldCount: Scalars["Int"]
  programs: Maybe<ProgramConnection>
  records: Maybe<RecordConnection>
  recordsCount: Scalars["Int"]
  stopWatchingCount: Scalars["Int"]
  url: Maybe<Scalars["String"]>
  username: Scalars["String"]
  viewerCanFollow: Scalars["Boolean"]
  viewerIsFollowing: Scalars["Boolean"]
  wannaWatchCount: Scalars["Int"]
  watchedCount: Scalars["Int"]
  watchingCount: Scalars["Int"]
  works: Maybe<WorkConnection>
}

export type UseractivitiesArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<ActivityOrder>
}

export type UserfollowersArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type UserfollowingArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type UserfollowingActivitiesArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<ActivityOrder>
}

export type UserprogramsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<ProgramOrder>
  unwatched: Maybe<Scalars["Boolean"]>
}

export type UserrecordsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  hasComment: Maybe<Scalars["Boolean"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<RecordOrder>
}

export type UserworksArgs = {
  after: Maybe<Scalars["String"]>
  annictIds: Maybe<Array<Scalars["Int"]>>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<WorkOrder>
  seasons: Maybe<Array<Scalars["String"]>>
  state: Maybe<StatusState>
  titles: Maybe<Array<Scalars["String"]>>
}

export type UserConnection = {
  __typename?: "UserConnection"
  edges: Maybe<Array<Maybe<UserEdge>>>
  nodes: Maybe<Array<Maybe<User>>>
  pageInfo: PageInfo
}

export type UserEdge = {
  __typename?: "UserEdge"
  cursor: Scalars["String"]
  node: Maybe<User>
}

export type Work = Node & {
  __typename?: "Work"
  annictId: Scalars["Int"]
  casts: Maybe<CastConnection>
  episodes: Maybe<EpisodeConnection>
  episodesCount: Scalars["Int"]
  id: Scalars["ID"]
  image: Maybe<WorkImage>
  malAnimeId: Maybe<Scalars["String"]>
  media: Media
  noEpisodes: Scalars["Boolean"]
  officialSiteUrl: Maybe<Scalars["String"]>
  officialSiteUrlEn: Maybe<Scalars["String"]>
  programs: Maybe<ProgramConnection>
  reviews: Maybe<ReviewConnection>
  reviewsCount: Scalars["Int"]
  satisfactionRate: Maybe<Scalars["Float"]>
  seasonName: Maybe<SeasonName>
  seasonYear: Maybe<Scalars["Int"]>
  seriesList: Maybe<SeriesConnection>
  staffs: Maybe<StaffConnection>
  syobocalTid: Maybe<Scalars["Int"]>
  title: Scalars["String"]
  titleEn: Maybe<Scalars["String"]>
  titleKana: Maybe<Scalars["String"]>
  titleRo: Maybe<Scalars["String"]>
  twitterHashtag: Maybe<Scalars["String"]>
  twitterUsername: Maybe<Scalars["String"]>
  viewerStatusState: Maybe<StatusState>
  watchersCount: Scalars["Int"]
  wikipediaUrl: Maybe<Scalars["String"]>
  wikipediaUrlEn: Maybe<Scalars["String"]>
}

export type WorkcastsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<CastOrder>
}

export type WorkepisodesArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<EpisodeOrder>
}

export type WorkprogramsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<ProgramOrder>
}

export type WorkreviewsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  hasBody: Maybe<Scalars["Boolean"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<ReviewOrder>
}

export type WorkseriesListArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
}

export type WorkstaffsArgs = {
  after: Maybe<Scalars["String"]>
  before: Maybe<Scalars["String"]>
  first: Maybe<Scalars["Int"]>
  last: Maybe<Scalars["Int"]>
  orderBy: Maybe<StaffOrder>
}

export type WorkConnection = {
  __typename?: "WorkConnection"
  edges: Maybe<Array<Maybe<WorkEdge>>>
  nodes: Maybe<Array<Maybe<Work>>>
  pageInfo: PageInfo
}

export type WorkEdge = {
  __typename?: "WorkEdge"
  cursor: Scalars["String"]
  node: Maybe<Work>
}

export type WorkImage = Node & {
  __typename?: "WorkImage"
  annictId: Maybe<Scalars["Int"]>
  copyright: Maybe<Scalars["String"]>
  facebookOgImageUrl: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  internalUrl: Maybe<Scalars["String"]>
  recommendedImageUrl: Maybe<Scalars["String"]>
  twitterAvatarUrl: Maybe<Scalars["String"]>
  twitterBiggerAvatarUrl: Maybe<Scalars["String"]>
  twitterMiniAvatarUrl: Maybe<Scalars["String"]>
  twitterNormalAvatarUrl: Maybe<Scalars["String"]>
  work: Maybe<Work>
}

export type WorkImageinternalUrlArgs = {
  size: Scalars["String"]
}

export type WorkOrder = {
  direction: OrderDirection
  field: WorkOrderField
}

export enum WorkOrderField {
  CREATED_AT = "CREATED_AT",
  SEASON = "SEASON",
  WATCHERS_COUNT = "WATCHERS_COUNT",
}

export type CharacterFragment = {
  __typename?: "Character"
  id: string
  annictId: number
  name: string
}

export type CastFragment = {
  __typename?: "Cast"
  annictId: number
  id: string
  name: string
  character: {
    __typename?: "Character"
    id: string
    annictId: number
    name: string
  }
  person: {
    __typename?: "Person"
    id: string
    annictId: number
    name: string
    nameEn: string
    nameKana: string
  }
}

export type EpisodeFragment = {
  __typename?: "Episode"
  id: string
  annictId: number
  number: number | null | undefined
  numberText: string | null | undefined
  title: string | null | undefined
  viewerDidTrack: boolean
  viewerRecordsCount: number
}

export type StaffFragment = {
  __typename?: "Staff"
  annictId: number
  name: string
  roleText: string
  roleOther: string
}

export type WorkFragment = {
  __typename?: "Work"
  id: string
  annictId: number
  title: string
  media: Media
  twitterUsername: string | null | undefined
  twitterHashtag: string | null | undefined
  officialSiteUrl: string | null | undefined
  seasonName: SeasonName | null | undefined
  seasonYear: number | null | undefined
  episodesCount: number
  noEpisodes: boolean
  titleKana: string | null | undefined
  viewerStatusState: StatusState | null | undefined
  image:
    | {
        __typename?: "WorkImage"
        recommendedImageUrl: string | null | undefined
      }
    | null
    | undefined
  casts:
    | {
        __typename?: "CastConnection"
        nodes:
          | Array<
              | {
                  __typename?: "Cast"
                  annictId: number
                  id: string
                  name: string
                  character: {
                    __typename?: "Character"
                    id: string
                    annictId: number
                    name: string
                  }
                  person: {
                    __typename?: "Person"
                    id: string
                    annictId: number
                    name: string
                    nameEn: string
                    nameKana: string
                  }
                }
              | null
              | undefined
            >
          | null
          | undefined
      }
    | null
    | undefined
  episodes:
    | {
        __typename?: "EpisodeConnection"
        nodes:
          | Array<
              | {
                  __typename?: "Episode"
                  id: string
                  annictId: number
                  number: number | null | undefined
                  numberText: string | null | undefined
                  title: string | null | undefined
                  viewerDidTrack: boolean
                  viewerRecordsCount: number
                }
              | null
              | undefined
            >
          | null
          | undefined
      }
    | null
    | undefined
  seriesList:
    | {
        __typename?: "SeriesConnection"
        nodes:
          | Array<{ __typename?: "Series"; name: string } | null | undefined>
          | null
          | undefined
      }
    | null
    | undefined
}

export type WorkQueryVariables = Exact<{
  annictId: Scalars["Int"]
}>

export type WorkQuery = {
  __typename?: "Query"
  searchWorks:
    | {
        __typename?: "WorkConnection"
        nodes:
          | Array<
              | {
                  __typename?: "Work"
                  id: string
                  annictId: number
                  title: string
                  media: Media
                  twitterUsername: string | null | undefined
                  twitterHashtag: string | null | undefined
                  officialSiteUrl: string | null | undefined
                  seasonName: SeasonName | null | undefined
                  seasonYear: number | null | undefined
                  episodesCount: number
                  noEpisodes: boolean
                  titleKana: string | null | undefined
                  viewerStatusState: StatusState | null | undefined
                  image:
                    | {
                        __typename?: "WorkImage"
                        recommendedImageUrl: string | null | undefined
                      }
                    | null
                    | undefined
                  casts:
                    | {
                        __typename?: "CastConnection"
                        nodes:
                          | Array<
                              | {
                                  __typename?: "Cast"
                                  annictId: number
                                  id: string
                                  name: string
                                  character: {
                                    __typename?: "Character"
                                    id: string
                                    annictId: number
                                    name: string
                                  }
                                  person: {
                                    __typename?: "Person"
                                    id: string
                                    annictId: number
                                    name: string
                                    nameEn: string
                                    nameKana: string
                                  }
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                  episodes:
                    | {
                        __typename?: "EpisodeConnection"
                        nodes:
                          | Array<
                              | {
                                  __typename?: "Episode"
                                  id: string
                                  annictId: number
                                  number: number | null | undefined
                                  numberText: string | null | undefined
                                  title: string | null | undefined
                                  viewerDidTrack: boolean
                                  viewerRecordsCount: number
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                  seriesList:
                    | {
                        __typename?: "SeriesConnection"
                        nodes:
                          | Array<
                              | { __typename?: "Series"; name: string }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                }
              | null
              | undefined
            >
          | null
          | undefined
      }
    | null
    | undefined
}

export type searchWorksByTermQueryVariables = Exact<{
  term: Scalars["String"]
  count: Maybe<Scalars["Int"]>
  since: Maybe<Scalars["String"]>
}>

export type searchWorksByTermQuery = {
  __typename?: "Query"
  searchWorks:
    | {
        __typename?: "WorkConnection"
        nodes:
          | Array<
              | {
                  __typename?: "Work"
                  id: string
                  annictId: number
                  title: string
                  media: Media
                  twitterUsername: string | null | undefined
                  twitterHashtag: string | null | undefined
                  officialSiteUrl: string | null | undefined
                  seasonName: SeasonName | null | undefined
                  seasonYear: number | null | undefined
                  episodesCount: number
                  noEpisodes: boolean
                  titleKana: string | null | undefined
                  viewerStatusState: StatusState | null | undefined
                  image:
                    | {
                        __typename?: "WorkImage"
                        recommendedImageUrl: string | null | undefined
                      }
                    | null
                    | undefined
                  casts:
                    | {
                        __typename?: "CastConnection"
                        nodes:
                          | Array<
                              | {
                                  __typename?: "Cast"
                                  annictId: number
                                  id: string
                                  name: string
                                  character: {
                                    __typename?: "Character"
                                    id: string
                                    annictId: number
                                    name: string
                                  }
                                  person: {
                                    __typename?: "Person"
                                    id: string
                                    annictId: number
                                    name: string
                                    nameEn: string
                                    nameKana: string
                                  }
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                  episodes:
                    | {
                        __typename?: "EpisodeConnection"
                        nodes:
                          | Array<
                              | {
                                  __typename?: "Episode"
                                  id: string
                                  annictId: number
                                  number: number | null | undefined
                                  numberText: string | null | undefined
                                  title: string | null | undefined
                                  viewerDidTrack: boolean
                                  viewerRecordsCount: number
                                }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                  seriesList:
                    | {
                        __typename?: "SeriesConnection"
                        nodes:
                          | Array<
                              | { __typename?: "Series"; name: string }
                              | null
                              | undefined
                            >
                          | null
                          | undefined
                      }
                    | null
                    | undefined
                }
              | null
              | undefined
            >
          | null
          | undefined
      }
    | null
    | undefined
}

export type updateWorkStatusMutationVariables = Exact<{
  workId: Scalars["ID"]
  state: StatusState
}>

export type updateWorkStatusMutation = {
  __typename?: "Mutation"
  updateStatus:
    | {
        __typename?: "UpdateStatusPayload"
        clientMutationId: string | null | undefined
      }
    | null
    | undefined
}

export type createRecordMutationVariables = Exact<{
  episodeId: Scalars["ID"]
  comment: Maybe<Scalars["String"]>
  ratingState: Maybe<RatingState>
  shareTwitter: Maybe<Scalars["Boolean"]>
  shareFacebook: Maybe<Scalars["Boolean"]>
}>

export type createRecordMutation = {
  __typename?: "Mutation"
  createRecord:
    | {
        __typename?: "CreateRecordPayload"
        clientMutationId: string | null | undefined
      }
    | null
    | undefined
}

export const StaffFragmentDoc = gql`
  fragment Staff on Staff {
    annictId
    name
    roleText
    roleOther
  }
`
export const CharacterFragmentDoc = gql`
  fragment Character on Character {
    id
    annictId
    name
  }
`
export const CastFragmentDoc = gql`
  fragment Cast on Cast {
    annictId
    id
    name
    character {
      ...Character
    }
    person {
      id
      annictId
      name
      nameEn
      nameKana
    }
  }
  ${CharacterFragmentDoc}
`
export const EpisodeFragmentDoc = gql`
  fragment Episode on Episode {
    id
    annictId
    number
    numberText
    title
    viewerDidTrack
    viewerRecordsCount
  }
`
export const WorkFragmentDoc = gql`
  fragment Work on Work {
    id
    annictId
    title
    media
    twitterUsername
    twitterHashtag
    officialSiteUrl
    seasonName
    seasonYear
    episodesCount
    noEpisodes
    titleKana
    image {
      recommendedImageUrl
    }
    viewerStatusState
    casts {
      nodes {
        ...Cast
      }
    }
    episodes(orderBy: { field: SORT_NUMBER, direction: ASC }, last: 50) {
      nodes {
        ...Episode
      }
    }
    seriesList {
      nodes {
        name
      }
    }
  }
  ${CastFragmentDoc}
  ${EpisodeFragmentDoc}
`
export const WorkDocument = gql`
  query Work($annictId: Int!) {
    searchWorks(annictIds: [$annictId], first: 1) {
      nodes {
        ...Work
      }
    }
  }
  ${WorkFragmentDoc}
`
export const searchWorksByTermDocument = gql`
  query searchWorksByTerm($term: String!, $count: Int, $since: String) {
    searchWorks(titles: [$term], after: $since, first: $count) {
      nodes {
        ...Work
      }
    }
  }
  ${WorkFragmentDoc}
`
export const updateWorkStatusDocument = gql`
  mutation updateWorkStatus($workId: ID!, $state: StatusState!) {
    updateStatus(
      input: { clientMutationId: "miraktest", workId: $workId, state: $state }
    ) {
      clientMutationId
    }
  }
`
export const createRecordDocument = gql`
  mutation createRecord(
    $episodeId: ID!
    $comment: String
    $ratingState: RatingState
    $shareTwitter: Boolean
    $shareFacebook: Boolean
  ) {
    createRecord(
      input: {
        episodeId: $episodeId
        comment: $comment
        ratingState: $ratingState
        shareTwitter: $shareTwitter
        shareFacebook: $shareFacebook
        clientMutationId: "miraktest"
      }
    ) {
      clientMutationId
    }
  }
`

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string
) => Promise<T>

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action()

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    Work(
      variables: WorkQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<WorkQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<WorkQuery>(WorkDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "Work"
      )
    },
    searchWorksByTerm(
      variables: searchWorksByTermQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<searchWorksByTermQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<searchWorksByTermQuery>(
            searchWorksByTermDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "searchWorksByTerm"
      )
    },
    updateWorkStatus(
      variables: updateWorkStatusMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<updateWorkStatusMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<updateWorkStatusMutation>(
            updateWorkStatusDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "updateWorkStatus"
      )
    },
    createRecord(
      variables: createRecordMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<createRecordMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<createRecordMutation>(
            createRecordDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "createRecord"
      )
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
