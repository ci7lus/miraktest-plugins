import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { EPGStationAPI } from "./api"
import { Records } from "./components/Records"
import styles from "./index.scss"
import { EPGStationSetting } from "./types"

/**
 * MirakTest EPGStation Plugin
 * EPGStationの録画を再生するためのプラグイン
 * https://github.com/l3tnun/EPGStation
 */

const _id = "io.github.ci7lus.miraktest-plugins.epgs"
const prefix = "plugins.ci7lus.epgs"
const meta = {
  id: _id,
  name: "EPGStation",
  author: "ci7lus",
  version: "0.0.1",
  description: "EPGStationの録画を再生するためのプラグインです。",
}
const recordsWindowId = `${_id}.records`

const main: InitPlugin = {
  renderer: ({ appInfo, packages, functions, atoms }) => {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const settingAtom = atom<EPGStationSetting>({
      key: `${prefix}.setting`,
      default: {},
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
      ],
      storedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
      ],
      setup() {
        return
      },
      components: [
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [setting, setSetting] = useRecoilState(settingAtom)
            const [url, setUrl] = useState(setting.baseUrl)
            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      baseUrl: url || undefined,
                    })
                  }}
                >
                  <label className="mb-2 block">
                    <span>EPGStation の URL</span>
                    <input
                      type="text"
                      placeholder="http://192.168.0.10:8888"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={url || ""}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer"
                  >
                    保存
                  </button>
                </form>
              </>
            )
          },
        },
      ],
      destroy() {
        return
      },
      contextMenu: {
        label: "EPGStation 録画一覧",
        click: () => {
          functions.openWindow({
            name: recordsWindowId,
            isSingletone: true,
            args: {
              width: 800,
              height: 600,
            },
          })
        },
      },
      windows: {
        [recordsWindowId]: () => {
          const setting = useRecoilValue(settingAtom)
          const [api, setApi] = useState<EPGStationAPI | null>(null)
          useEffect(() => {
            if (!setting?.baseUrl) {
              return
            }
            setApi(new EPGStationAPI(setting.baseUrl))
          }, [setting])
          const activeId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          const setPlayingContent = useSetRecoilState(
            atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
          )
          const services = useRecoilValue(atoms.mirakurunServicesSelector)
          useEffect(() => {
            remoteWindow.setTitle(`EPGStation 録画一覧 - ${appInfo.name}`)
          }, [])

          return (
            <>
              <style>{tailwind}</style>
              <style>{styles}</style>
              <div className="w-full h-screen bg-gray-100 text-gray-900 flex leading-loose">
                {api && services ? (
                  <Records
                    api={api}
                    services={services}
                    setPlayingContent={setPlayingContent}
                    openContentPlayer={(
                      playingContent: ContentPlayerPlayingContent
                    ) => {
                      return functions.openContentPlayerWindow({
                        playingContent,
                      })
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-600 px-4 text-center">
                      <h1 className="text-lg">
                        EPGStation の設定が行われていません。
                      </h1>
                      <p>設定から URL を設定してください。</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )
        },
      },
    }
  },
  main: ({ functions }) => {
    return {
      ...meta,
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
            name: recordsWindowId,
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
