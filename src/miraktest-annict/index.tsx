import Axios from "axios"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import YAML from "yaml"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { AnnictTrack } from "./components/AnnictTrack"
import { AnnictSetting, ARM, SayaDefinition } from "./types"

/**
 * MirakTest Annict Plugin
 * 視聴中の番組をAnnictで記録するプラグイン
 * 参考: https://github.com/SlashNephy/TVTestAnnictRecorder
 * https://annict.com
 */

const _id = "io.github.ci7lus.miraktest-plugins.annict"
const prefix = "plugins.ci7lus.annict"
const meta = {
  id: _id,
  name: "Annict",
  author: "ci7lus",
  version: "0.1.8",
  description: "視聴中の番組をAnnictで記録する",
}
const trackWindowId = `${_id}.track`

const main: InitPlugin = {
  renderer: ({ appInfo, packages, functions, atoms }) => {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const settingAtom = atom<AnnictSetting>({
      key: `${prefix}.setting`,
      default: {},
    })
    const twitterAtom = atom<boolean>({
      key: `${prefix}.twitter`,
      default: false,
    })
    const facebookAtom = atom<boolean>({
      key: `${prefix}.facebook`,
      default: false,
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
        {
          type: "atom",
          atom: twitterAtom,
        },
        {
          type: "atom",
          atom: facebookAtom,
        },
      ],
      storedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
        {
          type: "atom",
          atom: twitterAtom,
        },
        {
          type: "atom",
          atom: facebookAtom,
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
            const [accessToken, setAccessToken] = useState(setting.accessToken)
            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      accessToken: accessToken || undefined,
                    })
                  }}
                >
                  <label className="mb-2 block">
                    <span>Annict のアクセストークン</span>
                    <input
                      type="text"
                      placeholder=""
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={accessToken || ""}
                      onChange={(e) => setAccessToken(e.target.value)}
                    />
                    <a
                      className="text-sm text-blue-400"
                      href="https://annict.com/settings/apps"
                      target="_blank"
                    >
                      アクセストークンを取得する
                    </a>
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
        label: "Annict",
        click: () => {
          functions.openWindow({
            name: trackWindowId,
            isSingletone: true,
            args: {
              width: 600,
              height: 400,
            },
          })
        },
      },
      windows: {
        [trackWindowId]: () => {
          const setting = useRecoilValue(settingAtom)
          const activeId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          const playingContent = useRecoilValue(
            atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
          )
          const services = useRecoilValue(atoms.mirakurunServicesSelector)
          useEffect(() => {
            remoteWindow.setTitle(`Annict - ${appInfo.name}`)
          }, [])
          const [sayaDefinition, setSayaDefinition] =
            useState<SayaDefinition | null>(null)
          const [arm, setArm] = useState<ARM[] | null>(null)
          useEffect(() => {
            Axios.get<string>(
              "https://raw.githack.com/SlashNephy/saya/dev/docs/definitions.yml",
              {
                responseType: "text",
              }
            )
              .then((r) => {
                const parsed: SayaDefinition = YAML.parse(r.data)
                setSayaDefinition(parsed)
              })
              .catch(console.error)
            // https://arm.kawaiioverflow.com/api/ids?service=syobocal&id= が死んでる気がするので
            Axios.get(
              "https://raw.githack.com/kawaiioverflow/arm/master/arm.json"
            )
              .then((r) => setArm(r.data))
              .catch(console.error)
          }, [])

          return (
            <>
              <style>{tailwind}</style>
              <div className="w-full h-screen bg-gray-900 text-gray-100 flex leading-loose">
                {setting.accessToken && services && sayaDefinition && arm ? (
                  <AnnictTrack
                    accessToken={setting.accessToken}
                    playingContent={playingContent}
                    sayaDefinition={sayaDefinition}
                    arm={arm}
                    twitterAtom={twitterAtom}
                    facebookAtom={facebookAtom}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="px-4 text-center">
                      {setting.accessToken ? (
                        <h1 className="text-lg">読込中です…</h1>
                      ) : (
                        <>
                          <h1 className="text-lg">
                            Annict の設定が行われていません。
                          </h1>
                          <p>
                            設定からアクセストークンを設定してください。
                            <br />
                            <a
                              className="text-blue-400"
                              href="https://annict.com/settings/apps"
                              target="_blank"
                            >
                              アクセストークンを取得する
                            </a>
                          </p>
                        </>
                      )}
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
        label: "Annict",
        click: () => {
          functions.openWindow({
            name: trackWindowId,
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
