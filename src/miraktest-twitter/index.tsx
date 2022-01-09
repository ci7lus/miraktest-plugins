import { InitPlugin } from "../@types/plugin"
import { TWITTER_META, TWITTER_TWEET_WINDOW_ID } from "./constants"

/**
 * MirakTest Twitter Plugin
 * 視聴中の番組に関連するツイートを投稿するプラグイン
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./components/TwitterRenderer").TwitterRenderer
      : undefined,
  main: ({ functions }) => {
    return {
      ...TWITTER_META,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: "ツイート画面を開く",
        click: () => {
          functions.openWindow({
            name: TWITTER_TWEET_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
      contextMenu: {
        label: "ツイート画面を開く",
        click: () => {
          functions.openWindow({
            name: TWITTER_TWEET_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
    }
  },
}

export default main
