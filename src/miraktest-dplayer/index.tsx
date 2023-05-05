import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"
import { useDebounce } from "react-use"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { DPlayerWrapper } from "./components/DPlayerWrapper"
import { DPLAYER_META, DPLAYER_PREFIX } from "./constants"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"

/**
 * MirakTest DPlayer Plugin
 * DPlayerのコメントプレイヤーをMirakTestで表示するためのプラグインです
 * https://github.com/neneka/DPlayer
 * DPlayer Danmakuを出力するコメントソースのプラグインが別途必要です
 */

const main: InitPlugin = {
  renderer: async ({ atoms, constants }) => {
    const opacityAtom = atom<number>({
      key: `${DPLAYER_PREFIX}.opacity`,
      default: 1,
      effects: [
        syncEffect({
          storeKey: constants?.recoil?.sharedKey,
          refine: $.number(),
        }),
        syncEffect({
          storeKey: constants?.recoil?.storedKey,
          refine: $.number(),
        }),
      ],
    })
    const zoomAtom = atom<number>({
      key: `${DPLAYER_PREFIX}.zoom`,
      default: 1,
      effects: [
        syncEffect({
          storeKey: constants?.recoil?.sharedKey,
          refine: $.number(),
        }),
        syncEffect({
          storeKey: constants?.recoil?.storedKey,
          refine: $.number(),
        }),
      ],
    })
    const ngAtom = atom<string[]>({
      key: `${DPLAYER_PREFIX}.ng`,
      default: [],
      effects: [
        syncEffect({
          storeKey: constants?.recoil?.sharedKey,
          refine: $.array($.string()),
        }),
        syncEffect({
          storeKey: constants?.recoil?.storedKey,
          refine: $.array($.string()),
        }),
      ],
    })

    return {
      ...DPLAYER_META,
      exposedAtoms: [],
      sharedAtoms: [
        { type: "atom", atom: opacityAtom },
        { type: "atom", atom: zoomAtom },
        { type: "atom", atom: ngAtom },
      ],
      storedAtoms: [
        { type: "atom", atom: opacityAtom },
        { type: "atom", atom: zoomAtom },
        { type: "atom", atom: ngAtom },
      ],
      setup() {
        return
      },
      components: [
        {
          id: `${DPLAYER_PREFIX}.dplayerCommentPlayer`,
          position: "onPlayer",
          component: () => {
            const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
            const isSeekable = useRecoilValue(
              atoms.contentPlayerIsSeekableSelector
            )
            const opacity = useRecoilValue(opacityAtom)
            const zoom = useRecoilValue(zoomAtom)
            const ng = useRecoilValue(ngAtom)
            const ngRegex = useMemo(() => ng.map((ng) => new RegExp(ng)), [ng])
            return (
              <DPlayerWrapper
                isPlaying={isPlaying}
                isSeekable={isSeekable}
                opacity={opacity}
                zoom={zoom}
                ng={ngRegex}
              />
            )
          },
        },
        {
          id: `${DPLAYER_PREFIX}.onController`,
          position: "OnControllerPopup",
          component: () => {
            const [opacity, setOpacity] = useRecoilState(opacityAtom)
            const [rangeOpacity, setRangeOpacity] = useState(opacity * 10)
            useDebounce(
              () => {
                setOpacity(rangeOpacity / 10)
              },
              100,
              [rangeOpacity]
            )
            useEffect(() => {
              setRangeOpacity(opacity * 10)
            }, [opacity])
            return (
              <>
                <style>{tailwind}</style>
                <label>
                  <span
                    className={clsx(
                      "block",
                      "mb-1",
                      "text-sm",
                      "text-gray-300"
                    )}
                  >
                    コメント濃度
                  </span>
                  <input
                    type="range"
                    className={clsx(
                      "block",
                      "mt-2",
                      "rounded-md",
                      "w-full",
                      "app-region-no-drag"
                    )}
                    min={0}
                    max={10}
                    value={rangeOpacity}
                    onChange={(e) => {
                      const p = parseInt(e.target.value)
                      if (Number.isNaN(p)) return
                      setRangeOpacity(p)
                    }}
                  />
                </label>
              </>
            )
          },
        },
        {
          id: `${DPLAYER_PREFIX}.settings`,
          position: "onSetting",
          label: DPLAYER_META.name,
          component: () => {
            const [opacity, setOpacity] = useRecoilState(opacityAtom)
            const [zoom, setZoom] = useRecoilState(zoomAtom)
            const [ng, setNg] = useRecoilState(ngAtom)
            const [addNg, setAddNg] = useState("")
            const [rangeOpacity, setRangeOpacity] = useState(opacity * 10)
            const [rangeZoom, setRangeZoom] = useState(zoom * 10)
            useDebounce(
              () => {
                setOpacity(rangeOpacity / 10)
                setZoom(rangeZoom / 10)
              },
              100,
              [rangeOpacity, rangeZoom]
            )
            useEffect(() => {
              setRangeOpacity(opacity * 10)
            }, [opacity])
            return (
              <>
                <style>{tailwind}</style>
                <div className="p-4">
                  <p className="text-lg">DPlayer 設定</p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <label className={clsx("block", "mt-4")}>
                      <span>コメント濃度</span>
                      <input
                        type="range"
                        className={clsx(
                          "block",
                          "mt-2",
                          "rounded-md",
                          "w-full"
                        )}
                        min={0}
                        max={10}
                        value={rangeOpacity}
                        onChange={(e) => {
                          const p = parseInt(e.target.value)
                          if (Number.isNaN(p)) return
                          setRangeOpacity(p)
                        }}
                      />
                      <span>{rangeOpacity / 10}</span>
                    </label>
                    <label className={clsx("block", "mt-4")}>
                      <span>表示倍率</span>
                      <input
                        type="range"
                        className={clsx(
                          "block",
                          "mt-2",
                          "rounded-md",
                          "w-full"
                        )}
                        min={10}
                        max={30}
                        value={rangeZoom}
                        onChange={(e) => {
                          const p = parseInt(e.target.value)
                          if (Number.isNaN(p)) return
                          setRangeZoom(p)
                        }}
                      />
                      <span>{rangeZoom / 10}</span>
                    </label>
                  </form>
                  <label className={clsx("mt-4", "block")}>
                    <span>NG設定（正規表現）</span>
                    <div className={clsx("flex", "space-x-2")}>
                      <input
                        type="text"
                        placeholder="(piyo)+"
                        className={clsx(
                          "block",
                          "mt-2",
                          "form-input",
                          "rounded-md",
                          "w-full",
                          "text-gray-900"
                        )}
                        value={addNg}
                        onChange={(e) => setAddNg(e.target.value)}
                      />
                      <button
                        type="button"
                        className={clsx(
                          "mt-2",
                          "px-4",
                          "flex",
                          "items-center",
                          "justify-center",
                          "text-gray-900",
                          "bg-gray-200",
                          "rounded-md",

                          "cursor-pointer"
                        )}
                        onClick={() => {
                          setNg((replaces) => [...replaces, addNg])
                          setAddNg("")
                        }}
                        disabled={!addNg}
                      >
                        +
                      </button>
                    </div>
                    <div
                      className={clsx("flex", "flex-wrap", "space-x-2", "mt-4")}
                    >
                      {ng.map((word, idx) => (
                        <div
                          className={clsx(
                            "p-1",
                            "px-2",
                            "bg-gray-200",
                            "text-gray-800",
                            "rounded-md",
                            "flex",
                            "space-x-1",
                            "items-center",
                            "justify-center"
                          )}
                          key={idx}
                        >
                          <span
                            className={clsx(
                              "text-gray-200",
                              "hover:text-gray-800"
                            )}
                          >
                            {word}
                          </span>
                          <span
                            title="削除する"
                            className={clsx(
                              "flex",
                              "items-center",
                              "justify-center",
                              "bg-gray-200",
                              "rounded-md",
                              "cursor-pointer"
                            )}
                            onClick={() => {
                              const copied = Object.assign([], ng)
                              ;(copied as (string | null)[])[idx] = null
                              setNg(copied.filter((s) => !!s))
                            }}
                          >
                            ❌
                          </span>
                        </div>
                      ))}
                    </div>
                  </label>
                </div>
              </>
            )
          },
        },
      ],
      destroy() {
        return
      },
      windows: {},
    }
  },
}

export default main
