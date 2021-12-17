import React, { useEffect } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"

const _id = "io.github.ci7lus.miraktest-plugins.sample"
const prefix = "plugins.ci7lus.sample"
const meta = {
  id: _id,
  name: "SamplePlugin",
  author: "ci7lus",
  version: "0.1.0",
  description: " 読み込み確認用プラグイン",
}
const sampleWindowId = `${_id}.sampleWindow`

const main: InitPlugin = {
  renderer: ({ atoms, windowId }) => {
    const currentTime = atom<string | null>({
      key: `${prefix}.currentTime`,
      default: null,
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [{ type: "atom", atom: currentTime }],
      storedAtoms: [],
      setup() {
        console.info("setup")
      },
      components: [
        {
          id: `${prefix}.onPlayerTimeDisplay`,
          position: "onPlayer",
          component: () => {
            useEffect(() => {
              console.warn("onPlayerTimeDisplayの描画")
            }, [])
            const time = useRecoilValue(currentTime)
            const activeContentPlayerId = useRecoilValue(
              atoms.globalActiveContentPlayerIdSelector
            )
            const playingContent = useRecoilValue(
              atoms.contentPlayerPlayingContentAtom
            )
            useEffect(() => {
              console.info("time updated:", time, "on", windowId)
            }, [time])
            useEffect(() => {
              console.info(
                activeContentPlayerId === windowId
                  ? "このウィンドウはアクティブです:"
                  : "このウィンドウはアクティブではありません:",
                windowId,
                activeContentPlayerId
              )
            }, [activeContentPlayerId])
            useEffect(() => {
              console.info("再生中のコンテンツ:", playingContent)
            }, [playingContent])
            return (
              <>
                <style>{tailwind}</style>
                {time ? (
                  <p className="bg-gray-900 text-gray-100">
                    同期された感じ: {time}
                  </p>
                ) : (
                  <></>
                )}
              </>
            )
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: "Sample",
          component: () => {
            const [time, setTime] = useRecoilState(currentTime)
            return (
              <>
                <style>{tailwind}</style>
                <div>
                  <p className="bg-gray-900 text-gray-100">
                    同期された感じ: {time}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTime(new Date().toISOString())
                    }}
                  >
                    更新する
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTime(null)
                    }}
                  >
                    リセット
                  </button>
                </div>
              </>
            )
          },
        },
      ],
      destroy() {
        console.info("destroy")
      },
      windows: {
        [sampleWindowId]: () => {
          const time = useRecoilValue(currentTime)
          return (
            <>
              <style>{tailwind}</style>
              <div className="w-full h-screen bg-gray-100 text-gray-900">
                同期された感じ: {time}
              </div>
            </>
          )
        },
      },
    }
  },
  main: ({ appInfo, packages, functions }) => {
    return {
      ...meta,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      appMenu: {
        label: meta.name,
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
                name: sampleWindowId,
                isSingletone: true,
              })
            },
          },
        ],
      },
      contextMenu: {
        label: meta.name,
        submenu: [
          {
            label: "ウィンドウを開く",
            click: () => {
              functions.openWindow({
                name: sampleWindowId,
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
