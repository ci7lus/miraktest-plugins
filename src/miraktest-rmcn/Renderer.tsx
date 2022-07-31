import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { InitPlugin } from "../@types/plugin"
import { useRefFromState } from "../shared/utils"
import tailwind from "../tailwind.scss"
import {
  RMCN_GET_PORT,
  RMCN_META,
  RMCN_ON_SET_STATE,
  RMCN_PREFIX,
  RMCN_SET_CP_STATE,
  RMCN_SET_SERVICES,
} from "./constants"

const refine = $.withDefault($.object({ idealPort: $.number() }), {
  idealPort: 10170,
})

export const Renderer: InitPlugin["renderer"] = ({
  atoms,
  windowId,
  rpc,
  constants,
}) => {
  const settingAtom = atom({
    key: `${RMCN_PREFIX}.setting`,
    default: { idealPort: 10171 },
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.sharedKey,
        refine,
      }),
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine,
      }),
    ],
  })

  return {
    ...RMCN_META,
    exposedAtoms: [],
    sharedAtoms: [
      {
        type: "atom",
        atom: settingAtom,
        key: settingAtom.key,
      },
    ],
    storedAtoms: [
      {
        type: "atom",
        atom: settingAtom,
        key: settingAtom.key,
      },
    ],
    setup: () => {
      return
    },
    components: [
      {
        id: `${RMCN_PREFIX}.splash`,
        position: "onSplash",
        label: RMCN_META.name,
        component: () => {
          const activeWindowId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          const playingContent = useRecoilValue(
            atoms.contentPlayerPlayingContentAtom
          )
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )
          const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
          const [timePer, setTimePer] = useState(time)
          useEffect(() => {
            setTimePer(Math.floor(time / 10_000))
          }, [time])
          const [isPlaying, setIsPlaying] = useRecoilState(
            atoms.contentPlayerIsPlayingAtom
          )
          const [volume, setVolume] = useRecoilState(
            atoms.contentPlayerVolumeAtom
          )

          useEffect(() => {
            rpc.invoke(RMCN_SET_CP_STATE, {
              windowId,
              isPlaying,
              isSeekable,
              time: timePer,
              playingContent,
              activeWindowId,
              volume,
            })
          }, [
            isPlaying,
            isSeekable,
            timePer,
            playingContent,
            activeWindowId,
            volume,
          ])

          const services = useRecoilValue(atoms.mirakurunServicesSelector)
          const servicesRef = useRefFromState(services)
          useEffect(() => {
            if (!services) {
              return
            }
            rpc.invoke(RMCN_SET_SERVICES, services)
          }, [services])
          const setService = useSetRecoilState(
            atoms.globalContentPlayerSelectedServiceFamily(windowId)
          )
          const position = useRecoilValue(
            atoms.contentPlayerPlayingPositionSelector
          )
          const positionRef = useRefFromState(position)
          const playingContentRef = useRefFromState(playingContent)
          const isSeekableRef = useRefFromState(isSeekable)
          const setPosition = useSetRecoilState(
            atoms.contentPlayerPositionUpdateTriggerAtom
          )
          const setScreenshotTrigger = useSetRecoilState(
            atoms.contentPlayerScreenshotTriggerAtom
          )
          useEffect(() => {
            const off = rpc.onCustomIpcListener(RMCN_ON_SET_STATE, (data) => {
              const { key, value } = data as { key: string; value: unknown }
              switch (key) {
                case "play": {
                  setIsPlaying(true)
                  break
                }
                case "pause": {
                  setIsPlaying(false)
                  break
                }
                case "setService": {
                  const service = servicesRef.current?.find(
                    (service) => service.id === value
                  )
                  if (!service) {
                    break
                  }
                  setService(service)
                  break
                }
                case "setVolume": {
                  const volume = parseInt(value as string)
                  if (Number.isNaN(volume)) {
                    break
                  }
                  setVolume(volume)
                  break
                }
                case "setRelatieMove": {
                  const relativeMoveSizeInMs = parseInt(value as string)
                  const duration = playingContentRef.current?.program?.duration
                  if (
                    Number.isNaN(relativeMoveSizeInMs) ||
                    !duration ||
                    !isSeekableRef.current
                  ) {
                    break
                  }
                  setPosition(
                    (positionRef.current * duration + relativeMoveSizeInMs) /
                      duration
                  )
                  break
                }
                case "takeScreenshot": {
                  setScreenshotTrigger(performance.now())
                  break
                }
                default: {
                  break
                }
              }
            })
            return () => off()
          }, [])
          return <></>
        },
      },
      {
        id: `${RMCN_PREFIX}.settings`,
        position: "onSetting",
        label: "リモコン",
        component: () => {
          const [setting, setSetting] = useRecoilState(settingAtom)
          const [idealPort, setIdealPort] = useState(setting.idealPort)
          const [addr, setAddr] = useState("")
          useEffect(() => {
            rpc.invoke(RMCN_GET_PORT).then((port) => setAddr(port as never))
          }, [])
          return (
            <>
              <style>{tailwind}</style>
              <div className="p-4">
                <p className="text-lg">リモコン</p>
                {addr && (
                  <>
                    <h3 className={clsx("text-base", "mt-4")}>
                      リモコンソケットのアドレス
                    </h3>
                    <input
                      type="text"
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      disabled={true}
                      value={addr}
                      onClick={(e) => {
                        e.currentTarget.select()
                      }}
                    />
                  </>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({ idealPort })
                  }}
                >
                  <label className={clsx("block", "mt-4")}>
                    <span>指定ポート</span>
                    <input
                      type="number"
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={idealPort}
                      onChange={(e) => setIdealPort(parseInt(e.target.value))}
                      disabled={true} // TODO
                    />
                  </label>
                  <span
                    className={clsx(
                      "block",
                      "text-sm",
                      "text-gray-300",
                      "mt-2"
                    )}
                  >
                    指定したポートが使用できない場合は他のポートにフォールバックされます
                  </span>
                  <button
                    type="submit"
                    className={clsx(
                      "bg-gray-100",
                      "text-gray-800",
                      "p-2",
                      "px-2",
                      "my-4",
                      "rounded-md",

                      "cursor-pointer",
                      "active:bg-gray-200"
                    )}
                  >
                    更新
                  </button>
                </form>
              </div>
            </>
          )
        },
      },
    ],
    destroy: () => {
      return
    },
    windows: {},
  }
}
