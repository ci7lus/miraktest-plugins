import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"
import { atom, useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { EPGStationAPI } from "./api"
import { Records } from "./components/Records"
import { EPGS_PREFIX, EPGS_META, EPGS_RECORDS_WINDOW_ID } from "./constants"
import styles from "./index.scss"
import { EPGSChannel, EPGStationSetting } from "./types"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import { DEFAULT_SERVICES } from "../shared/services"
import tailwind from "../tailwind.scss"

export const EpgsRenderer: InitPlugin["renderer"] = ({
  appInfo,
  functions,
  atoms,
  rpc,
  constants,
}) => {
  const settingRefine = $.object({ baseUrl: $.voidable($.string()) })
  const settingAtom = atom<EPGStationSetting>({
    key: `${EPGS_PREFIX}.setting`,
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
  const epgsUrlHistoryAtom = atom<string[]>({
    key: `${EPGS_PREFIX}.epgsUrlHistory`,
    default: [],
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine: $.array($.string()),
      }),
    ],
  })

  return {
    ...EPGS_META,
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
      {
        type: "atom",
        atom: epgsUrlHistoryAtom,
      },
    ],
    setup() {
      return
    },
    components: [
      {
        id: `${EPGS_PREFIX}.settings`,
        position: "onSetting",
        label: EPGS_META.name,
        component: () => {
          const [setting, setSetting] = useRecoilState(settingAtom)
          const [url, setUrl] = useState(setting.baseUrl)
          const [urlHistory, setUrlHistory] = useRecoilState(epgsUrlHistoryAtom)
          return (
            <>
              <style>{tailwind}</style>
              <form
                className="m-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (url) {
                    setUrlHistory((prev) =>
                      prev.find((_url) => _url === url)
                        ? prev
                        : [
                            url,
                            ...(10 < prev.length
                              ? [...prev].slice(0, 10)
                              : prev),
                          ]
                    )
                  }
                  setSetting({
                    baseUrl: url || undefined,
                  })
                }}
              >
                <label className={clsx("mb-2", "block")}>
                  <span>EPGStation の URL</span>
                  <datalist id="epgsUrlHistory">
                    {urlHistory.map((url) => (
                      <option key={url} value={url} />
                    ))}
                  </datalist>
                  <input
                    type="text"
                    placeholder="http://192.168.0.10:8888"
                    className={clsx(
                      "block",
                      "mt-2",
                      "form-input",
                      "rounded-md",
                      "w-full",
                      "text-gray-900"
                    )}
                    value={url || ""}
                    onChange={(e) => setUrl(e.target.value)}
                    list="epgsUrlHistory"
                  />
                </label>
                <button
                  type="submit"
                  className={clsx(
                    "bg-gray-100",
                    "text-gray-800",
                    "p-2",
                    "px-2",
                    "my-4",
                    "rounded-md",

                    "cursor-pointer"
                  )}
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
    windows: {
      [EPGS_RECORDS_WINDOW_ID]: () => {
        const setting = useRecoilValue(settingAtom)
        const [api, setApi] = useState<EPGStationAPI | null>(null)
        useEffect(() => {
          if (!setting?.baseUrl) {
            return
          }
          const api = new EPGStationAPI(setting.baseUrl)
          setApi(api)
          api
            .getChannels()
            .then((channels) => {
              setChannels(channels)
            })
            .catch(console.error)
        }, [setting])
        const activeId = useRecoilValue(
          atoms.globalActiveContentPlayerIdSelector
        )
        const setPlayingContent = useSetRecoilState(
          atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
        )
        const [channels, setChannels] = useState<EPGSChannel[] | null>(null)
        useEffect(() => {
          rpc.setWindowTitle(`EPGStation 録画一覧 - ${appInfo.name}`)
        }, [])
        const services = useRecoilValue(atoms.mirakurunServicesSelector)
        const filledServices = useMemo(
          () => services || DEFAULT_SERVICES,
          [services]
        )

        return (
          <>
            <style>{tailwind}</style>
            <style>{styles}</style>
            <div
              className={clsx(
                "w-full",
                "h-screen",
                "bg-gray-100",
                "text-gray-900",
                "flex",
                "leading-loose"
              )}
            >
              {api && channels !== null ? (
                <Records
                  api={api}
                  channels={channels}
                  setPlayingContent={setPlayingContent}
                  openContentPlayer={(
                    playingContent: ContentPlayerPlayingContent
                  ) => {
                    return functions.openContentPlayerWindow({
                      playingContent,
                    })
                  }}
                  services={filledServices}
                />
              ) : (
                <div
                  className={clsx(
                    "w-full",
                    "h-full",
                    "flex",
                    "items-center",
                    "justify-center"
                  )}
                >
                  <div className={clsx("text-gray-600", "px-4", "text-center")}>
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
}
