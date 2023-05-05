import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useEffect } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { SAMPLE_PREFIX, SAMPLE_META, SAMPLE_WINDOW_ID } from "./constants"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"

export const SampleRenderer: InitPlugin["renderer"] = ({
  atoms,
  windowId,
  constants,
}) => {
  const currentTime = atom<string | null>({
    key: `${SAMPLE_PREFIX}.currentTime`,
    default: null,
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.sharedKey,
        refine: $.nullable($.string()),
      }),
    ],
  })

  return {
    ...SAMPLE_META,
    exposedAtoms: [],
    sharedAtoms: [{ type: "atom", atom: currentTime }],
    storedAtoms: [],
    setup() {
      console.info("setup")
    },
    components: [
      {
        id: `${SAMPLE_PREFIX}.onPlayerTimeDisplay`,
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
                <p className={clsx("bg-gray-900", "text-gray-100")}>
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
        id: `${SAMPLE_PREFIX}.settings`,
        position: "onSetting",
        label: "Sample",
        component: () => {
          const [time, setTime] = useRecoilState(currentTime)
          return (
            <>
              <style>{tailwind}</style>
              <div>
                <p className={clsx("bg-gray-900", "text-gray-100")}>
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
      [SAMPLE_WINDOW_ID]: () => {
        const time = useRecoilValue(currentTime)
        return (
          <>
            <style>{tailwind}</style>
            <div
              className={clsx(
                "w-full",
                "h-screen",
                "bg-gray-100",
                "text-gray-900"
              )}
            >
              同期された感じ: {time}
            </div>
          </>
        )
      },
    },
  }
}
