import { InitPlugin } from "./@types/plugin"
import tailwind from "./tailwind.scss"
import { NicoCommentChat, NicoCommentList } from "./zenza/types"
import { NicoCommentPlayer } from "./zenza/zenzaLoader"

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
  name: "ZenzaCommentPlayer",
  author: "ci7lus",
  version: "1.0.0",
  description:
    "映像の上にSayaコメントレンダラーを表示するプラグインです。別途コメントソースが必要です。",
}

const main: InitPlugin = {
  renderer: async ({ packages }) => {
    const React = packages.React
    const { useEffect, useState, useRef } = React
    const {
      atom,
      useRecoilValue,
      useRecoilState,
      useSetRecoilState,
      atomFamily,
    } = packages.Recoil
    const { useDebounce } = packages.ReactUse
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const allCommentsAtom = atom<NicoCommentList | null>({
      key: `${prefix}.allComments`,
      default: null,
    })
    const commentAtom = atomFamily<NicoCommentChat | null, number>({
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
        { type: "family", atom: commentAtom, key: `${prefix}.comment`, arg: 0 },
      ],
      sharedAtoms: [
        { type: "atom", atom: allCommentsAtom },
        { type: "atom", atom: opacityAtom },
        { type: "family", atom: commentAtom, key: `${prefix}.comment`, arg: 0 },
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
            const comment = useRecoilValue(commentAtom(remoteWindow.id))
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
            const setAllComments = useSetRecoilState(allCommentsAtom)
            const [allCommentForm, setAllCommentForm] = useState("")
            const [targetWindowNumber, setTargetWindowNumber] = useState(1)
            const setComment = useSetRecoilState(
              commentAtom(targetWindowNumber)
            )
            const [commentForm, setCommentForm] = useState("")
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
                  <p className="text-lg mt-8">デバッグ</p>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <label className="block mt-2">
                      <span>ターゲットウィンドウ番号</span>
                      <input
                        type="number"
                        className="block mt-2 form-input rounded-md w-full text-gray-900"
                        value={targetWindowNumber}
                        onChange={(e) => {
                          const p = parseInt(e.currentTarget.value)
                          if (Number.isNaN(p)) return
                          setTargetWindowNumber(p)
                        }}
                      />
                    </label>
                  </form>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setAllComments(JSON.parse(allCommentForm))
                    }}
                  >
                    <label className="block mt-2">
                      <span>全コメントセット</span>
                      <input
                        type="text"
                        className="block mt-2 form-input rounded-md w-full text-gray-900"
                        value={allCommentForm}
                        onChange={(e) => {
                          setAllCommentForm(e.currentTarget.value)
                        }}
                      />
                    </label>
                    <button
                      type="submit"
                      className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer active:bg-gray-200"
                    >
                      更新
                    </button>
                  </form>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setComment({
                        content: commentForm,
                        mail: "184",
                        date: new Date().getTime() / 1000,
                      })
                    }}
                  >
                    <label className="block">
                      <span>コメント単発追加</span>
                      <input
                        type="text"
                        className="block mt-2 form-input rounded-md w-full text-gray-900"
                        value={commentForm}
                        onChange={(e) => {
                          setCommentForm(e.currentTarget.value)
                        }}
                      />
                    </label>
                    <button
                      type="submit"
                      className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer active:bg-gray-200"
                    >
                      表示
                    </button>
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
