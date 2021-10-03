import { RatingState, SeasonName, StatusState } from "./gql"

export const STATUS_LABEL = {
  [StatusState.NO_STATE]: "未選択",
  [StatusState.WANNA_WATCH]: "見たい",
  [StatusState.WATCHING]: "見てる",
  [StatusState.WATCHED]: "見た",
  [StatusState.ON_HOLD]: "一時中断",
  [StatusState.STOP_WATCHING]: "視聴中止",
}

export const RATING_LABEL = {
  [RatingState.BAD]: "良くない",
  [RatingState.AVERAGE]: "普通",
  [RatingState.GOOD]: "良い",
  [RatingState.GREAT]: "とても良い",
}

export const RATING_COLOR = {
  [RatingState.BAD]: "bg-gray-600",
  [RatingState.AVERAGE]: "bg-pink-400",
  [RatingState.GOOD]: "bg-green-400",
  [RatingState.GREAT]: "bg-blue-400",
}

export const SEASON_LABEL = {
  [SeasonName.SPRING]: "春",
  [SeasonName.SUMMER]: "夏",
  [SeasonName.AUTUMN]: "秋",
  [SeasonName.WINTER]: "冬",
}
