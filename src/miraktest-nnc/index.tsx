import React, { useEffect, useRef, useState } from "react"
import { useDebounce } from "react-use"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import { DPlayerCommentPayload } from "../miraktest-dplayer/types"
import tailwind from "../tailwind.scss"
import { DPLAYER_COMMENT_EVENT } from "./constants"
import NiconiComments from "./nnc"

/**
 * MirakTest niconicomments Plugin
 * niconicommentsのコメントプレイヤーをMirakTestで表示するためのプラグインです
 * DPlayer Danmakuを出力するコメントソースのプラグインが別途必要です
 */

const _ID = "io.github.ci7lus.miraktest-plugins.nnc"
const PREFIX = "plugins.ci7lus.nnc"
const META = {
  id: _ID,
  name: "niconicomments",
  author: "ci7lus",
  version: "0.0.1",
  description:
    "映像の上にniconicommentsを表示するプラグインです。別途コメントソースが必要です。",
}

const main: InitPlugin = {
  renderer: async () => {
    const opacityAtom = atom<number>({
      key: `${PREFIX}.opacity`,
      default: 1,
    })

    return {
      ...META,
      exposedAtoms: [],
      sharedAtoms: [{ type: "atom", atom: opacityAtom }],
      storedAtoms: [{ type: "atom", atom: opacityAtom }],
      setup() {
        return
      },
      components: [
        {
          id: `${PREFIX}.nncCommentPlayer`,
          position: "onPlayer",
          component: () => {
            const ref = useRef<HTMLCanvasElement>(null)
            /*const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
            const isSeekable = useRecoilValue(
              atoms.contentPlayerIsSeekableSelector
            )*/
            const opacity = useRecoilValue(opacityAtom)
            useEffect(() => {
              const canvas = ref.current
              if (!canvas) {
                return
              }
              let vpos = 0
              const nc = new NiconiComments(canvas, [])
              const timer = setInterval(() => {
                vpos += 100
                nc.drawCanvas(vpos)
              }, 1000)
              const handler = (event: CustomEvent) => {
                const comment = event.detail as DPlayerCommentPayload
                /**
 *   {
    "chat": {
      "thread": "1173108780",
      "no": 4118020,
      "vpos": 36114,
      "date": 1361103390,
      "nicoru": 18,
      "premium": 1,
      "anonymity": 1,
      "score": -2200,
      "user_id": "Yg_6QWiiS_T2mq3WJuzUcp41MvQ",
      "mail": "184",
      "content": "混ぜるな危険ｗｗｗ"
    }
  },
 */
                if (!comment.text) {
                  return
                }
                const chat = {
                  thread: comment.source,
                  no: comment.no,
                  vpos: vpos + 10000,
                  date: comment.time,
                  date_usec: 0,
                  mail: comment.author,
                  content: comment.text,
                }
                nc.addComment(chat)
              }
              window.addEventListener(
                DPLAYER_COMMENT_EVENT,
                handler as EventListener
              )
              return () => {
                window.removeEventListener(
                  DPLAYER_COMMENT_EVENT,
                  handler as EventListener
                )
                clearInterval(timer)
              }
            }, [ref.current])
            return (
              <canvas
                ref={ref}
                style={{ opacity, width: "100%", height: "100%" }}
                width={1920}
                height={1080}
              ></canvas>
            )
          },
        },
        {
          id: `${PREFIX}.settings`,
          position: "onSetting",
          label: META.name,
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
                  <p className="text-lg">niconicomments 設定</p>
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
