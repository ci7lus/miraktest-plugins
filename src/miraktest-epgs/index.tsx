import { EPGS_META, EPGS_RECORDS_WINDOW_ID } from "./constants"
import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest EPGStation Plugin
 * EPGStationの録画を再生するためのプラグイン
 * https://github.com/l3tnun/EPGStation
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./EpgsRenderer").EpgsRenderer
      : undefined,
  main: ({ functions }) => {
    return {
      ...EPGS_META,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: "EPGStation 録画一覧",
        click: () => {
          functions.openWindow({
            name: EPGS_RECORDS_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 800,
              height: 600,
            },
          })
        },
      },
      contextMenu: {
        label: "EPGStation 録画一覧",
        click: () => {
          functions.openWindow({
            name: EPGS_RECORDS_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 800,
              height: 600,
            },
          })
        },
      },
    }
  },
}

export default main
