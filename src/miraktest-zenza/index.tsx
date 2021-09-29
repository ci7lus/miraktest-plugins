import React, { useEffect, useState, useRef } from "react"
import { useDebounce } from "react-use"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { NicoCommentChat, NicoCommentList } from "./types"
import { NicoCommentPlayer } from "./zenzaLoader"

/**
 * MirakTest Zenza Plugin
 * ZenzaWatchのコメントプレイヤーをMirakTestで表示するためのプラグインです
 * https://github.com/neneka/ZenzaWatch
 * ニココメントフォーマット（NicoCommentChat）を出力するコメントソースのプラグインが別途必要です
 * 参考: https://github.com/rinsuki/nicotv
 * MIT License 2021 rinsuki
 * MIT License 2021 ci7lus
 */

const _id = "io.github.ci7lus.miraktest-plugins.zenza"
const prefix = "plugins.ci7lus.zenza"
const meta = {
  id: _id,
  name: "Zenza",
  author: "ci7lus",
  version: "0.0.1",
  description:
    "映像の上にSayaコメントレンダラーを表示するプラグインです。別途コメントソースが必要です。",
}

const main: InitPlugin = {
  renderer: async () => {
    const allCommentsAtom = atom<NicoCommentList | null>({
      key: `${prefix}.allComments`,
      default: null,
    })
    const commentAtom = atom<NicoCommentChat | null>({
      key: `${prefix}.comment`,
      default: null,
    })
    const opacityAtom = atom<number>({
      key: `${prefix}.opacity`,
      default: 1,
    })

    const ZenzaCommentRendererCore: React.FC<{
      comment: NicoCommentChat | null
      allComments: NicoCommentList | null
      currentTime: number
      isPaused: boolean
      opacity: number
    }> = ({ comment, allComments, currentTime, isPaused, opacity }) => {
      const playerRef = useRef<NicoCommentPlayer | null>(null)
      const div = useRef<HTMLDivElement>(null)

      useEffect(() => {
        if (playerRef.current) return
        const player = new NicoCommentPlayer({
          filter: {
            enableFilter: false,
            fork0: true,
            fork1: true,
            fork2: true,
          },
          showComment: true,
          debug: true,
          playbackRate: 1,
        })
        playerRef.current = player
        console.info("NicoCommentPlayer", player)
        player.setComment(JSON.stringify([]), { format: "json" })
      }, [])

      useEffect(() => {
        if (!div.current || !playerRef.current) return
        playerRef.current.appendTo(div.current)
      }, [div.current, playerRef.current])

      useEffect(() => {
        const player = playerRef.current
        if (!allComments || !player) return
        player.setComment(JSON.stringify(allComments), { format: "json" })
        console.info("コメント", allComments)
      }, [allComments, playerRef.current])

      useEffect(() => {
        const player = playerRef.current
        if (!comment || !player) return
        let vpos = comment.vpos
        if (!vpos) {
          vpos = player.vpos + 200 + new Date().getMilliseconds() / 10
        }
        player.addChat(comment.content, comment.mail, vpos, comment)
      }, [comment, playerRef.current])

      useEffect(() => {
        const player = playerRef.current
        if (!player) return
        try {
          player.currentTime = currentTime
        } catch {}
      }, [currentTime, playerRef.current])

      useEffect(() => {
        const player = playerRef.current
        if (!player) return
        if (isPaused) {
          player._view.pause()
        } else {
          player._view.play()
        }
      }, [isPaused, playerRef.current])

      return (
        <div
          ref={div}
          className="zenzaCommentRendererCore"
          style={{ opacity }}
        />
      )
    }

    return {
      ...meta,
      exposedAtoms: [
        { type: "atom", atom: allCommentsAtom },
        { type: "atom", atom: commentAtom },
      ],
      sharedAtoms: [
        { type: "atom", atom: allCommentsAtom },
        { type: "atom", atom: opacityAtom },
      ],
      storedAtoms: [{ type: "atom", atom: opacityAtom }],
      setup() {
        return
      },
      components: [
        {
          id: `${prefix}.zenzaCommentPlayer`,
          position: "onPlayer",
          component: () => {
            const comments = useRecoilValue(allCommentsAtom)
            const comment = useRecoilValue(commentAtom)
            const opacity = useRecoilValue(opacityAtom)
            const [currentTime, setCurrentTime] = useState(0)
            useEffect(() => {
              console.warn("onPlayerの描画（Zenza）")
              const timer = setInterval(
                () => setCurrentTime((n) => n + 1),
                1000
              )
              return () => clearInterval(timer)
            }, [])
            useEffect(() => {
              setCurrentTime(0)
            }, [comments])
            return (
              <>
                <style>{componentCss}</style>
                <ZenzaCommentRendererCore
                  comment={comment}
                  allComments={comments}
                  currentTime={currentTime}
                  isPaused={false}
                  opacity={opacity}
                />
              </>
            )
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
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
            return (
              <>
                <style>{tailwind}</style>
                <div className="p-4">
                  <p className="text-lg">Zenza 設定</p>
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

const componentCss = `
body { margin: 0; background: black; }
.player {
    width: 100%;
    height: 100%;
}
.player > * {
    position: absolute;
    width: 100%;
    height: 100%;
}
.zenzaCommentRendererCore {
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.zenzaCommentRendererCore > iframe {
    border: 0;
    width: 100%;
    height: 100%;
}`

export default main
