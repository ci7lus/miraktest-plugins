import Axios from "axios"
import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { atom, useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import YAML from "yaml"
import { InitPlugin } from "../@types/plugin"
import { SayaDefinition } from "../miraktest-saya/types"
import tailwind from "../tailwind.scss"
import { AnnictTrack } from "./components/AnnictTrack"
import {
  ANNICT_META,
  ANNICT_PLUGIN_PREFIX,
  ANNICT_TRACK_WINDOW_ID,
} from "./constants"
import { AnnictSetting, ARM } from "./types"

/**
 * MirakTest Annict Plugin
 * 視聴中の番組をAnnictで記録するプラグイン
 * 参考: https://github.com/SlashNephy/TVTestAnnictRecorder
 * https://annict.com
 */

export const AnnictRenderer: InitPlugin["renderer"] = ({
  appInfo,
  rpc,
  windowId,
  atoms,
  constants,
}) => {
  const settingRefine = $.object({
    accessToken: $.voidable($.string()),
  })
  const settingAtom = atom<AnnictSetting>({
    key: `${ANNICT_PLUGIN_PREFIX}.setting`,
    default: {},
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.sharedKey,
        refine: settingRefine,
      }),
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine: settingRefine,
      }),
    ],
  })
  const twitterAtom = atom<boolean>({
    key: `${ANNICT_PLUGIN_PREFIX}.twitter`,
    default: false,
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine: $.boolean(),
      }),
    ],
  })
  const facebookAtom = atom<boolean>({
    key: `${ANNICT_PLUGIN_PREFIX}.facebook`,
    default: false,
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine: $.boolean(),
      }),
    ],
  })
  const timeAtom = atom<number>({
    key: `${ANNICT_PLUGIN_PREFIX}.time`,
    default: 0,
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.sharedKey,
        refine: $.number(),
      }),
    ],
  })

  return {
    ...ANNICT_META,
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
      {
        type: "atom",
        atom: timeAtom,
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
        id: `${ANNICT_PLUGIN_PREFIX}.settings`,
        position: "onSetting",
        label: ANNICT_META.name,
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
      {
        id: `${ANNICT_PLUGIN_PREFIX}.time`,
        position: "onBackground",
        component: () => {
          const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )
          const setTime = useSetRecoilState(timeAtom)
          const activeId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          useThrottleFn(
            (time: number, activeId: number | null, isSeekable: boolean) => {
              if (windowId === activeId && isSeekable) {
                setTime(time)
              }
            },
            1000,
            [time, activeId, isSeekable]
          )
          return <></>
        },
      },
    ],
    destroy() {
      return
    },
    windows: {
      [ANNICT_TRACK_WINDOW_ID]: () => {
        const setting = useRecoilValue(settingAtom)
        const activeId = useRecoilValue(
          atoms.globalActiveContentPlayerIdSelector
        )
        const playingContent = useRecoilValue(
          atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
        )
        const time = useRecoilValue(timeAtom)
        const services = useRecoilValue(atoms.mirakurunServicesSelector)
        useEffect(() => {
          rpc.setWindowTitle(`Annict - ${appInfo.name}`)
        }, [])
        const [sayaDefinition, setSayaDefinition] =
          useState<SayaDefinition | null>(null)
        const [arm, setArm] = useState<ARM[] | null>(null)
        useEffect(() => {
          Axios.get<string>(
            "https://cdn.jsdelivr.net/gh/SlashNephy/saya@dev/docs/definitions.yml",
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
            "https://cdn.jsdelivr.net/gh/kawaiioverflow/arm@latest/arm.json"
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
                  time={time}
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
}
