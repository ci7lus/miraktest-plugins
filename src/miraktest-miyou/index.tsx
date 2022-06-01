import axios from "axios"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import YAML from "yaml"
import { InitPlugin } from "../@types/plugin"
import { DPLAYER_COMMENT_EVENT } from "../miraktest-dplayer/constants"
import { DPlayerCommentPayload } from "../miraktest-dplayer/types"
import { trimCommentForFlow } from "../miraktest-saya/comment"
import { SayaDefinition } from "../miraktest-saya/types"
import { ChatInput, PECORE_ID } from "../pecore"
import { useRefFromState, wait } from "../shared/utils"
import tailwind from "../tailwind.scss"
import { MiyouComment, MiyouSetting } from "./types"

/**
 * MirakTest Miyou Plugin
 * Miyouからコメントを取得し、コメントレンダラに流し込むプラグイン
 * https://github.com/search-future/miyou.tv/blob/f042a10cc86cbb98eb84a34c0f74072a9776fa5c/src/services/CommentService.ts
 * Impl from https://github.com/SlashNephy/saya/commit/0f400e9839365c60a2daf39848cb31fa39f359b7
 */

const _id = "io.github.ci7lus.miraktest-plugins.miyou"
const prefix = "plugins.ci7lus.miyou"
const meta = {
  id: _id,
  name: "Miyou",
  author: "ci7lus",
  version: "0.2.0",
  description:
    "Miyouからコメントを取得するプラグインです。対応するコメントレンダラープラグインが必要です。",
  authorUrl: "https://github.com/ci7lus",
  url: "https://github.com/ci7lus/miraktest-plugins/tree/master/src/miraktest-miyou",
}

const main: InitPlugin = {
  renderer: ({ atoms, constants }) => {
    const settingRefine = $.object({
      isEnabled: $.boolean(),
      mail: $.voidable($.string()),
      pass: $.voidable($.string()),
    })
    const miyouSettingAtom = atom<MiyouSetting>({
      key: `${prefix}.setting`,
      default: {
        isEnabled: true,
      },
      effects: [
        syncEffect({
          storeKey: constants.recoil.sharedKey,
          refine: settingRefine,
        }),
        syncEffect({
          storeKey: constants.recoil.storedKey,
          refine: settingRefine,
        }),
      ],
    })

    const tokenAtom = atom<string | null>({
      key: `${prefix}.token`,
      default: null,
      effects: [
        syncEffect({
          storeKey: constants.recoil.sharedKey,
          refine: $.nullable($.string()),
        }),
      ],
    })

    let isDplayerFound = false
    let isPkrFound = false

    const client = axios.create({
      baseURL: "https://miteru.digitiminimi.com/a2sc.php",
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          type: "atom",
          atom: miyouSettingAtom,
        },
        {
          type: "atom",
          atom: tokenAtom,
        },
      ],
      storedAtoms: [
        {
          type: "atom",
          atom: miyouSettingAtom,
        },
      ],
      setup({ plugins }) {
        isDplayerFound = !!plugins.find(
          (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.dplayer"
        )
        isPkrFound = !!plugins.find(
          (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.pecore"
        )
      },
      components: [
        {
          id: `${prefix}.onPlayer`,
          position: "onPlayer",
          component: () => {
            const setting = useRecoilValue(miyouSettingAtom)
            const service = useRecoilValue(atoms.contentPlayerServiceSelector)
            const program = useRecoilValue(atoms.contentPlayerProgramSelector)
            const isSeekable = useRecoilValue(
              atoms.contentPlayerIsSeekableSelector
            )
            const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
            const timeRef = useRefFromState(time)
            const [token, setToken] = useRecoilState(tokenAtom)

            // miyou token取得
            useEffect(() => {
              if (!isPkrFound && !isDplayerFound) {
                console.warn("コメント送信先の取得に失敗しています")
                return
              }
              if (!setting.mail || !setting.pass) {
                console.warn("Miyouの設定が行われていません")
                return
              }
              if (token) {
                console.info("トークンがすでに取得されています")
                return
              }
              if (setting.isEnabled === false) {
                console.info("Miyouが無効化されています")
                return
              }
              if (!isSeekable || !program?.startAt) {
                return
              }

              const data = new FormData()
              data.append("email", setting.mail)
              data.append("password", setting.pass)

              client
                .post<{}, { data: { token: string } }>(
                  "auth/moritapo",
                  data,
                  {}
                )
                .then((r) => {
                  setToken(r.data.token || null)
                })
                .catch((e) => {
                  console.error(e)
                  setToken(null)
                })
            }, [setting, isSeekable, service])

            const [sayaDefinition, setSayaDefinition] =
              useState<SayaDefinition | null>(null)
            useEffect(() => {
              axios
                .get<string>(
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
            }, [])

            const [miyouChannel, setMiyouChannel] = useState<string | null>(
              null
            )
            useEffect(() => {
              if (!sayaDefinition) {
                return
              }
              const chDef = sayaDefinition.channels.find((channel) =>
                channel.serviceIds.includes(service?.serviceId || 0)
              )
              setMiyouChannel(chDef?.miyoutvId || null)
            }, [sayaDefinition, service])

            const [comments, setComments] = useState<MiyouComment[]>([])
            const [log, setLog] = useState<string[]>([])
            const [lastStartAt, setLastStartAt] = useState<number>(0)

            const [period, setPeriod] = useState<
              [number | null, number | null]
            >([null, null])
            useEffect(() => {
              if (!program?.duration || !isSeekable) {
                setPeriod([null, null])
                return
              }
              const pos = Math.floor((time + 5000) / 600_000) // 10分
              const start = program.startAt + pos * 600_000
              const endAt = program.startAt + program.duration
              const end = Math.min(start + 600_000, endAt)
              if (lastStartAt !== program.startAt) {
                setLastStartAt(program.startAt)
                setComments([])
              }
              setPeriod([start, end])
            }, [program, time])

            useEffect(() => {
              const [start, end] = period
              if (!token || !miyouChannel || !start || !end) {
                return
              }
              const cacheKey = period.join(",")
              if (log.includes(cacheKey)) {
                return
              }
              console.info("コメントの取得を開始します", service)

              client
                .get<
                  | "null"
                  | {
                      data: {
                        comments?: MiyouComment[]
                        n_hits: number
                      }
                    }
                >("miyou/comments", {
                  headers: {
                    "x-miteyou-auth-token": token,
                  },
                  params: {
                    channel: miyouChannel,
                    start,
                    end,
                  },
                })
                .then((r) => {
                  const { data } = r
                  if (data === "null") {
                    return
                  }
                  const { comments } = data.data
                  if (!comments) {
                    return
                  }
                  setComments(
                    (prev) =>
                      [...prev, ...comments].sort((a, b) => a.time - b.time) /*
                    Object.values(
                      [...prev, ...r.data.data.comments].reduce(
                        (acc: { [key: string]: MiyouComment }, comment) => ({
                          ...acc,
                          [comment.id + comment.time]: comment,
                        }),
                        {}
                      )
                    ).sort((a, b) => a.time - b.time)*/
                  )
                  setLog((prev) => [...prev, cacheKey])
                })
                .catch((e) => {
                  console.error(e)
                })
            }, [token, miyouChannel, ...period])

            useEffect(() => {
              if (!program?.startAt || !isSeekable || !time) {
                return
              }
              let isCanceled = false
              ;(async () => {
                let lastTime = timeRef.current
                let index = 0
                while (index < comments.length) {
                  if (isCanceled) {
                    break
                  }
                  const comment = comments[index]

                  const time = timeRef.current

                  if (time < lastTime) {
                    console.info("巻き戻しを検知、インデックスを0に戻します")
                    lastTime = time
                    index = 0
                    continue
                  }
                  lastTime = time

                  if (comment.time < program.startAt + time - 4_000) {
                    index++
                    continue
                  }
                  if (program.startAt + timeRef.current - 3000 < comment.time) {
                    await wait(500)
                    continue
                  }
                  const text = trimCommentForFlow(comment.text)
                  if (text.length === 0) {
                    index++
                    continue
                  }
                  if (isDplayerFound) {
                    const event = new CustomEvent(DPLAYER_COMMENT_EVENT, {
                      bubbles: false,
                      detail: {
                        source: `MiyouTV [${comment.title}]`,
                        sourceUrl: null,
                        time: comment.time / 1000,
                        timeMs: Math.random() * 100,
                        author: `${comment.name} (${comment.id})`,
                        text,
                        no: comment.time,
                        color: "white",
                        type: "right",
                        commands: [],
                      } as DPlayerCommentPayload,
                    })
                    window.dispatchEvent(event)
                  }
                  if (isPkrFound) {
                    const detail: ChatInput = {
                      thread: "1",
                      no: comment.title,
                      vpos: performance.now() / 10 + 200,
                      mail: [comment.email],
                      date: dayjs(comment.time).format(),
                      dateUsec: NaN,
                      anonymous: true,
                      commands: [],
                      content: text,
                    }
                    const event = new CustomEvent(PECORE_ID, {
                      bubbles: false,
                      detail,
                    })
                    window.dispatchEvent(event)
                  }
                  index++
                }
              })()
              return () => {
                isCanceled = true
              }
            }, [comments])

            return <></>
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [setting, setSetting] = useRecoilState(miyouSettingAtom)
            const [mail, setMail] = useState(setting.mail)
            const [pass, setPass] = useState(setting.pass)
            const [isEnabled, setIsEnabled] = useState(setting.isEnabled)
            const [isHidden, setIsHidden] = useState(true)

            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      mail,
                      pass,
                      isEnabled,
                    })
                  }}
                >
                  <label className="block mt-4">
                    <span>有効</span>
                    <input
                      type="checkbox"
                      className="block mt-2 form-checkbox"
                      checked={isEnabled || false}
                      onChange={() => setIsEnabled((enabled) => !enabled)}
                    />
                  </label>
                  <label className="mt-4 block">
                    <span>モリタポのメールアドレス</span>
                    <input
                      type="text"
                      placeholder="miyou@miyou.tv"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={mail || ""}
                      onChange={(e) => setMail(e.target.value)}
                    />
                  </label>
                  <label className="mt-4 block">
                    <span>モリタポのパスワード</span>
                    <input
                      type={isHidden ? "password" : "text"}
                      placeholder="*****"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={pass || ""}
                      onChange={(e) => setPass(e.target.value)}
                      onFocus={() => setIsHidden(false)}
                      onBlur={() => setIsHidden(true)}
                    />
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
      ],
      destroy() {
        return
      },
      windows: {},
    }
  },
}

export default main
