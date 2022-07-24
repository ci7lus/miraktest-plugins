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

export const ANNICT_PLUGIN_ID = "io.github.ci7lus.miraktest-plugins.annict"
export const ANNICT_PLUGIN_PREFIX = "plugins.ci7lus.annict"
export const ANNICT_META = {
  id: ANNICT_PLUGIN_ID,
  name: "Annict",
  author: "ci7lus",
  version: "0.3.4",
  description: "視聴中の番組をAnnictで記録する",
  authorUrl: "https://github.com/ci7lus",
  url: "https://github.com/ci7lus/miraktest-plugins/tree/master/src/miraktest-annict",
}
export const ANNICT_TRACK_WINDOW_ID = `${ANNICT_PLUGIN_ID}.track`
