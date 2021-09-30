import React, { useEffect, useRef, useState } from "react"
import { Plus, X } from "react-feather"
import type { RecoilState } from "recoil"
import {
  atom,
  atomFamily,
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
} from "recoil"
import ReconnectingWebSocket from "reconnecting-websocket"
import { Atom, InitPlugin } from "../@types/plugin"
import { SayaSetting, SayaCommentPayload } from "../miraktest-dplayer/types"
import { NicoCommentChat } from "../miraktest-zenza/types"
import { useRefFromState } from "../shared/utils"
import tailwind from "../tailwind.scss"
import { trimCommentForFlow } from "./comment"

/**
 * MirakTest Saya Plugin
 * Sayaからコメントを取得し、コメントレンダラに流し込むプラグイン
 * https://github.com/SlashNephy/saya
 */

const _id = "io.github.ci7lus.miraktest-plugins.saya"
const prefix = "plugins.ci7lus.saya"
const meta = {
  id: _id,
  name: "Saya",
  author: "ci7lus",
  version: "0.0.1",
  description:
    "Sayaからコメントを取得するプラグインです。ZenzaかDPlayerプラグインが必要です。",
}
const commentWindowId = `${_id}.sayaCommentWindow`

const main: InitPlugin = {
  renderer: ({ appInfo, packages, atoms }) => {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const sayaSettingAtom = atom<SayaSetting>({
      key: `${prefix}.sayaSetting`,
      default: {
        replaces: [],
      },
    })

    let zenzaCommentAtom: RecoilState<NicoCommentChat> | null = null
    let dplayerCommentAtom: RecoilState<SayaCommentPayload> | null = null

    const commentFamilyKey = `${prefix}.rawComment`
    const rawCommentFamily = atomFamily<SayaCommentPayload | null, number>({
      key: commentFamilyKey,
      default: null,
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        /*{
          type: "family",
          atom: rawCommentFamily,
          key: commentFamilyKey,
          arg: 0,
        },*/
        {
          type: "atom",
          atom: sayaSettingAtom,
        },
      ],
      storedAtoms: [
        {
          type: "atom",
          atom: sayaSettingAtom,
        },
      ],
      setup({ plugins }) {
        const zenza = plugins.find(
          (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.zenza"
        )
        if (zenza) {
          const family = zenza.exposedAtoms.find(
            (atom): atom is Atom<NicoCommentChat> =>
              atom.type === "atom" &&
              atom.atom.key === "plugins.ci7lus.zenza.comment"
          )
          if (family) {
            zenzaCommentAtom = family.atom
          }
        }
        const dplayer = plugins.find(
          (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.dplayer"
        )
        if (dplayer) {
          const family = dplayer.exposedAtoms.find(
            (atom): atom is Atom<SayaCommentPayload> =>
              atom.type === "atom" &&
              atom.atom.key === "plugins.ci7lus.dplayer.comment"
          )
          if (family) {
            dplayerCommentAtom = family.atom
          }
        }
      },
      components: [
        {
          id: `${prefix}.onPlayer`,
          position: "onPlayer",
          component: () => {
            useEffect(() => {
              console.warn("onPlayerTimeDisplayの描画")
            }, [])
            const sayaSetting = useRecoilValue(sayaSettingAtom)
            const service = useRecoilValue(atoms.contentPlayerServiceSelector)
            const program = useRecoilValue(atoms.contentPlayerProgramSelector)
            const isSeekable = useRecoilValue(
              atoms.contentPlayerIsSeekableSelector
            )
            const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
            const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
            const timeRef = useRefFromState(time)
            const setZenzaComment = zenzaCommentAtom
              ? useSetRecoilState(zenzaCommentAtom)
              : null
            const setDplayerComment = dplayerCommentAtom
              ? useSetRecoilState(dplayerCommentAtom)
              : null
            const setRawComment = useSetRecoilState(
              rawCommentFamily(remoteWindow.id)
            )
            const wsRef = useRef<ReconnectingWebSocket | null>(null)
            const send = (ws: ReconnectingWebSocket, payload: object) => {
              ws.send(JSON.stringify(payload))
              console.info("Send to Saya:", payload)
            }
            const syncPosition = (ws: ReconnectingWebSocket) => {
              const seconds = Math.ceil(timeRef.current / 1000)
              send(ws, {
                action: "Sync",
                seconds,
              })
            }
            useEffect(() => {
              if (!setZenzaComment && !setDplayerComment) {
                console.warn("コメント送信先の取得に失敗しています")
                return
              }
              if (!sayaSetting.baseUrl) {
                console.warn("Sayaの設定が行われていません")
                return
              }
              if (!service) {
                console.warn("サービスが不明です")
                return
              }

              let ws: ReconnectingWebSocket
              try {
                const wsUrl = new URL(sayaSetting.baseUrl)
                if (wsUrl.protocol === "https:") {
                  wsUrl.protocol = "wss:"
                } else {
                  wsUrl.protocol = "ws:"
                }

                let channelType = service.channel?.type as string

                if (channelType) {
                  const repl = (sayaSetting.replaces || []).find(
                    ([before]) => before === channelType
                  )
                  if (repl) {
                    channelType = repl[1]
                  }
                }

                const isTimeshift = isSeekable && program?.startAt

                if (isTimeshift) {
                  console.info("タイムシフトを行います:", program)
                  const endAt = program.startAt + program.duration
                  ws = new ReconnectingWebSocket(
                    `${wsUrl.href}/comments/${channelType}_${
                      service.serviceId
                    }/timeshift?${new URLSearchParams({
                      startAt: (program.startAt / 1000).toString(),
                      endAt: (endAt / 1000).toString(),
                    }).toString()}`
                  )
                } else {
                  ws = new ReconnectingWebSocket(
                    `${wsUrl.href}/comments/${channelType}_${service.serviceId}/live`
                  )
                }
                ws.addEventListener("message", (e) => {
                  const payload: SayaCommentPayload = JSON.parse(e.data)
                  if (payload.text.startsWith("RT @")) return
                  setRawComment(payload)
                  const commentText = trimCommentForFlow(payload.text)
                  if (commentText.trim().length === 0) return
                  if (setZenzaComment) {
                    setZenzaComment({
                      no: payload.no,
                      date: payload.time,
                      date_usec: payload.timeMs,
                      user_id: payload.author || undefined,
                      mail: payload.type,
                      content: commentText,
                    })
                  }
                  if (setDplayerComment) {
                    setDplayerComment({ ...payload, text: commentText })
                  }
                })
                ws.addEventListener("open", () => {
                  console.info("Sayaへ接続しました")
                  if (isTimeshift) {
                    syncPosition(ws)
                    send(ws, { action: "Ready" })
                  }
                })
                ws.addEventListener("close", () => {
                  wsRef.current = null
                })
                wsRef.current = ws
              } catch {
                console.info("Sayaへの接続に失敗しました")
              }

              return () => {
                ws?.close()
              }
            }, [service, program, isSeekable, sayaSetting])
            useEffect(() => {
              const ws = wsRef.current
              if (!ws) return
              if (!isSeekable) return
              if (isPlaying) {
                syncPosition(ws)
                send(ws, { action: "Resume" })
              } else {
                send(ws, { action: "Pause" })
              }
            }, [isPlaying])
            return <></>
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [sayaSetting, setSayaSetting] =
              useRecoilState(sayaSettingAtom)
            const [url, setUrl] = useState(sayaSetting.baseUrl)
            const [replaces, setReplaces] = useState(sayaSetting.replaces)
            const [repl1, setRepl1] = useState("")
            const [repl2, setRepl2] = useState("")
            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSayaSetting({
                      baseUrl: url || undefined,
                      replaces,
                    })
                  }}
                >
                  <label className="mb-2 block">
                    <span>Saya の URL</span>
                    <input
                      type="text"
                      placeholder="https://saya"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={url || ""}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </label>
                  <label className="mb-2 block">
                    <span>放送波置換設定</span>
                    <div className="flex flex-wrap space-x-2">
                      {(replaces || []).map(([before, after], idx) => (
                        <div
                          className="mt-2 p-1 px-2 bg-gray-200 text-gray-800 rounded-md flex space-x-1 items-center justify-center"
                          key={idx}
                        >
                          <span>
                            {before}→{after}
                          </span>
                          <span
                            title="削除する"
                            className="flex items-center justify-center bg-gray-200 rounded-md cursor-pointer"
                            onClick={() => {
                              const copied = Object.assign([], replaces)
                              ;(copied as (string | null)[])[idx] = null
                              setReplaces(copied.filter((s) => !!s))
                            }}
                          >
                            <X className="pointer-events-none" size={16} />
                          </span>
                        </div>
                      ))}
                    </div>
                    <datalist id="serviceTypes">
                      <option value="GR"></option>
                      <option value="BS"></option>
                      <option value="CS"></option>
                      <option value="SKY"></option>
                    </datalist>
                    <div className="flex space-x-2 mt-4">
                      <input
                        type="text"
                        placeholder="SKY"
                        className="block mt-2 form-input rounded-md w-full text-gray-900"
                        value={repl1}
                        onChange={(e) => setRepl1(e.target.value)}
                        list="serviceTypes"
                      />
                      <input
                        type="text"
                        placeholder="GR"
                        className="block mt-2 form-input rounded-md w-full text-gray-900"
                        value={repl2}
                        onChange={(e) => setRepl2(e.target.value)}
                        list="serviceTypes"
                      />
                      <button
                        type="button"
                        className="mt-2 px-4 flex items-center justify-center text-gray-900 bg-gray-200 rounded-md focus:outline-none cursor-pointer"
                        onClick={() => {
                          setReplaces((replaces) => [
                            ...replaces,
                            [repl1, repl2],
                          ])
                        }}
                        disabled={!repl1 || !repl2}
                      >
                        <Plus className="pointer-events-none" size={16} />
                      </button>
                    </div>
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
      /*contextMenu: {
        label: "Saya コメント一覧",
        click: () => {
          functions.openWindow({
            name: commentWindowId,
            isSingletone: true,
            args: {
              width: 300,
              height: 720,
            },
          })
        },
      },*/
      windows: {
        [commentWindowId]: () => {
          const [windowId, setWindowId] = useState(1)
          const playerIds = useRecoilValue(atoms.globalContentPlayerIdsSelector)
          const [comments, setComments] = useState<SayaCommentPayload[]>([])
          const comment = useRecoilValue(rawCommentFamily(windowId))
          useEffect(() => {
            if (!comment) return
            setComments((prev) =>
              prev.find(
                (_comment) =>
                  _comment.time === comment.time &&
                  _comment.timeMs === comment.timeMs
              )
                ? prev
                : [
                    comment,
                    ...(100 < prev.length ? [...prev].slice(0, 100) : prev),
                  ]
            )
          }, [comment])
          const playingContent = useRecoilValue(
            atoms.globalContentPlayerPlayingContentFamily(windowId)
          )
          useEffect(() => {
            remoteWindow.setTitle(`Saya コメント - ${appInfo.name}`)
          }, [])
          return (
            <>
              <style>{tailwind}</style>
              <div className="w-full h-screen bg-gray-100 text-gray-900 flex flex-col">
                {playingContent?.service ? (
                  <>{playingContent.service.name}</>
                ) : (
                  <p>サービスが不明です</p>
                )}
                <select
                  className="form-select my-1 block w-full"
                  onChange={(e) => {
                    const playerId = parseInt(e.target.value)
                    if (Number.isNaN(playerId)) return
                    if (!playerIds.includes(playerId)) return
                    setWindowId(playerId)
                  }}
                >
                  {playerIds.map((playerId) => (
                    <option key={playerId} value={playerId}>
                      {playerId}
                    </option>
                  ))}
                </select>
                <div className="overflow-auto select-auto">
                  {comments.map((comment) => (
                    <p
                      key={`${comment.time}${comment.timeMs}`}
                      className="overflow-ellipsis"
                    >
                      {comment.text}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )
        },
      },
    }
  },
  main: (/*{ functions }*/) => {
    return {
      ...meta,
      setup: () => {
        return
      },
      destroy: () => {
        return
      },
      /*appMenu: {
        label: "Saya コメント一覧",
        click: () => {
          functions.openWindow({
            name: commentWindowId,
            isSingletone: true,
            args: {
              width: 800,
              height: 600,
            },
          })
        },
      },*/
    }
  },
}

export default main
