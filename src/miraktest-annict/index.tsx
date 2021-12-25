import { InitPlugin } from "../@types/plugin"
import { ANNICT_META, ANNICT_TRACK_WINDOW_ID } from "./constants"

/**
 * MirakTest Annict Plugin
 * 視聴中の番組をAnnictで記録するプラグイン
 * 参考: https://github.com/SlashNephy/TVTestAnnictRecorder
 * https://annict.com
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./AnnictRenderer").AnnictRenderer
      : undefined,
  main: ({ functions }) => {
    return {
      ...ANNICT_META,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: "Annictに記録する",
        click: () => {
          functions.openWindow({
            name: ANNICT_TRACK_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
      contextMenu: {
        label: "Annictに記録する",
        click: () => {
          functions.openWindow({
            name: ANNICT_TRACK_WINDOW_ID,
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
