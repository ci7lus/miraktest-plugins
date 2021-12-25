import { InitPlugin } from "../@types/plugin"
import { SAMPLE_META, SAMPLE_WINDOW_ID } from "./constants"

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./SampleRenderer").SampleRenderer
      : undefined,
  main: ({ appInfo, packages, functions }) => {
    return {
      ...SAMPLE_META,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: SAMPLE_META.name,
        submenu: [
          {
            label: "アプリバージョン",
            click: () => {
              packages.Electron.dialog.showMessageBox({
                message: `AppVersion: ${appInfo.version}`,
              })
            },
          },
          {
            label: "ウィンドウを開く",
            click: () => {
              functions.openWindow({
                name: SAMPLE_WINDOW_ID,
                isSingletone: true,
              })
            },
          },
        ],
      },
      contextMenu: {
        label: SAMPLE_META.name,
        submenu: [
          {
            label: "ウィンドウを開く",
            click: () => {
              functions.openWindow({
                name: SAMPLE_WINDOW_ID,
                isSingletone: true,
              })
            },
          },
        ],
      },
    }
  },
}

export default main
