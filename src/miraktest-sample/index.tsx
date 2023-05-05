import fs from "fs"
import os from "os"
import path from "path"
import { SAMPLE_META, SAMPLE_WINDOW_ID } from "./constants"
import { InitPlugin } from "../@types/plugin"

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./SampleRenderer").SampleRenderer
      : undefined,
  main: ({ appInfo, packages, functions }) => {
    const homedir = os.homedir()
    console.info("homedir:", homedir)
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
          {
            label: "/tmp/mirakにファイルを書き込んでみる",
            click: () => {
              fs.promises.writeFile("/tmp/mirak", "Hello, world!")
            },
          },
          {
            label: "/tmp/.mirakにファイルを書き込んでみる",
            click: () => {
              fs.promises.writeFile("/tmp/.mirak", "Hello, world!")
            },
          },
          {
            label: "~/mirakにファイルを書き込んでみる",
            click: () => {
              fs.promises.writeFile(
                path.join(homedir, "mirak"),
                "Hello, world!"
              )
            },
          },
          {
            label: "~/.mirakにファイルを書き込んでみる",
            click: () => {
              fs.promises.writeFile(
                path.join(homedir, ".mirak"),
                "Hello, world!"
              )
            },
          },
          {
            label: "evalで/tmp/mirakevalにファイルを書き込んでみる",
            click() {
              eval(
                `require('fs').promises.writeFile('/tmp/mirakeval', 'Hello, world!')`
              )
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
