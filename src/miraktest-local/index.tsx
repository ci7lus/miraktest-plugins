import { LOCAL_META, Local_RECORDS_WINDOW_ID } from "./constants"
import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest Local
 * ローカルファイルの再生を行うプラグイン
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./LocalRenderer").LocalRenderer
      : undefined,
  main: ({ functions }) => {
    return {
      ...LOCAL_META,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: "ローカルファイル再生",
        click: () => {
          functions.openWindow({
            name: Local_RECORDS_WINDOW_ID,
            isSingletone: true,
            args: {
              width: 800,
              height: 600,
            },
          })
        },
      },
      contextMenu: {
        label: "ローカルファイル再生",
        click: () => {
          functions.openWindow({
            name: Local_RECORDS_WINDOW_ID,
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
