import React, { memo, useEffect, useState, useRef } from "react"
import { useDebounce } from "react-use"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { DPlayer } from "./dplayerLoader"
import style from "./style.scss"
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
  version: "0.0.1",
  description:
    "映像の上にDPlayerを表示するプラグインです。別途コメントソースが必要です。",
}

const main: InitPlugin = {
  renderer: async () => {
    const commentAtom = atom<DPlayerCommentPayload | null>({
      key: `${prefix}.comment`,
      default: null,
    })
    const opacityAtom = atom<number>({
      key: `${prefix}.opacity`,
      default: 1,
    })

    const DPlayerWrapper: React.VFC<{
      comment: DPlayerCommentPayload | null
    }> = memo(({ comment }) => {
      const dplayerElementRef = useRef<HTMLDivElement>(null)
      const player = useRef<DPlayer | null>()

      const danmaku = {
        id: "mirakutest",
        user: "mirakutest",
        api: "",
        bottom: "10%",
        unlimited: true,
      }

      const commentOpacity = useRecoilValue(opacityAtom)

      useEffect(() => {
        if (!player.current) return
        player.current.danmaku.opacity(commentOpacity)
      }, [commentOpacity])

      useEffect(() => {
        const playerRef = player.current
        if (!playerRef || !comment || playerRef.video.paused === true) {
          return
        }
        if (comment.source.startsWith("5ch")) {
          setTimeout(() => playerRef.danmaku.draw(comment), comment.timeMs || 0)
        } else {
          playerRef.danmaku.draw(comment)
        }
      }, [comment])

      useEffect(() => {
        const playerInstance = new DPlayer({
          container: dplayerElementRef.current,
          live: true,
          autoplay: true,
          screenshot: true,
          video: {
            url: "https://files.catbox.moe/tvs9xy.mp4",
          },
          danmaku,
          lang: "ja-jp",
          subtitle: {
            type: "webvtt",
            fontSize: "20px",
            color: "#fff",
            bottom: "40px",
            // TODO: Typing correctly
          } as never,
          apiBackend: {
            read: (option) => {
              option.success([{}])
            },
            send: (option, item, callback) => {
              callback()
            },
          },
          contextmenu: [],
          loop: true,
          volume: 0,
          hotkey: false,
        })

        playerInstance.danmaku.opacity(commentOpacity)
        playerInstance.danmaku.show()

        playerInstance.on("pause" as DPlayer.DPlayerEvents.pause, () => {
          playerInstance.play()
        })

        player.current = playerInstance
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.dplayer = playerInstance

        const timer = setInterval(() => {
          playerInstance.video.currentTime = 0
        }, 30 * 1000)
        return () => {
          player.current?.destroy()
          player.current = null
          clearInterval(timer)
        }
      }, [])

      return (
        <>
          <style>{style}</style>
          <div ref={dplayerElementRef}></div>
        </>
      )
    })

    return {
      ...meta,
      exposedAtoms: [{ type: "atom", atom: commentAtom }],
      sharedAtoms: [{ type: "atom", atom: opacityAtom }],
      storedAtoms: [{ type: "atom", atom: opacityAtom }],
      setup() {
        return
      },
      components: [
        {
          id: `${prefix}.dplayerCommentPlayer`,
          position: "onPlayer",
          component: () => {
            const comment = useRecoilValue(commentAtom)
            return <DPlayerWrapper comment={comment} />
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
