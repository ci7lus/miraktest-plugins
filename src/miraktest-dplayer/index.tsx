import React, { useState } from "react"
import { useDebounce } from "react-use"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { DPlayerWrapper } from "./components/DPlayerWrapper"
import { DPlayerCommentPayload } from "./types"

/**
 * MirakTest DPlayer Plugin
 * DPlayerのコメントプレイヤーをMirakTestで表示するためのプラグインです
 * https://github.com/neneka/DPlayer
 * DPlayer Danmakuを出力するコメントソースのプラグインが別途必要です
 */

const _id = "io.github.ci7lus.miraktest-plugins.dplayer"
const prefix = "plugins.ci7lus.dplayer"
const meta = {
  id: _id,
  name: "DPlayer",
  author: "ci7lus",
  version: "0.2.1",
  description:
    "映像の上にDPlayerを表示するプラグインです。別途コメントソースが必要です。",
}

const main: InitPlugin = {
  renderer: async ({ atoms }) => {
    const commentAtom = atom<DPlayerCommentPayload | null>({
      key: `${prefix}.comment`,
      default: null,
    })
    const opacityAtom = atom<number>({
      key: `${prefix}.opacity`,
      default: 1,
    })
    const zoomAtom = atom<number>({
      key: `${prefix}.zoom`,
      default: 1,
    })

    return {
      ...meta,
      exposedAtoms: [{ type: "atom", atom: commentAtom }],
      sharedAtoms: [
        { type: "atom", atom: opacityAtom },
        { type: "atom", atom: zoomAtom },
      ],
      storedAtoms: [
        { type: "atom", atom: opacityAtom },
        { type: "atom", atom: zoomAtom },
      ],
      setup() {
        return
      },
      components: [
        {
          id: `${prefix}.dplayerCommentPlayer`,
          position: "onPlayer",
          component: () => {
            const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
            const comment = useRecoilValue(commentAtom)
            const opacity = useRecoilValue(opacityAtom)
            const zoom = useRecoilValue(zoomAtom)
            return (
              <DPlayerWrapper
                isPlaying={isPlaying}
                comment={comment}
                opacity={opacity}
                zoom={zoom}
              />
            )
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [opacity, setOpacity] = useRecoilState(opacityAtom)
            const [zoom, setZoom] = useRecoilState(zoomAtom)
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
            return (
              <>
                <style>{tailwind}</style>
                <div className="p-4">
                  <p className="text-lg">DPlayer 設定</p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <label className="block mt-4">
                      <span>コメント濃度</span>
                      <input
                        type="range"
                        className="block mt-2 rounded-md w-full"
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
                    <label className="block mt-4">
                      <span>表示倍率</span>
                      <input
                        type="range"
                        className="block mt-2 rounded-md w-full"
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
