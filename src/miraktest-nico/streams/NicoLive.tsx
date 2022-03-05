import dayjs from "dayjs"
import React, { memo, useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import ReconnectingWebSocket from "reconnecting-websocket"
import { DPLAYER_COMMENT_EVENT } from "../../miraktest-dplayer/constants"
import { DPlayerCommentPayload } from "../../miraktest-dplayer/types"
import { trimCommentForFlow } from "../../miraktest-saya/comment"
import { ChatInput, PECORE_ID } from "../../pecore"
import { getEmbeddedData } from "../casAPI"
import { parseMail } from "../parser"
import { NicoLiveChat } from "../types"
import { LiveProgram } from "../types/cas"
import { NicoLiveWS } from "../types/ws"

type MessageWS = {
  uri: string
  threadId: string
}

export const NicoLiveStream = memo(
  ({
    liveProgram,
    isPkrFound,
    isDplayerFound,
  }: {
    liveProgram: LiveProgram
    isPkrFound: boolean
    isDplayerFound: boolean
  }) => {
    const [systemWSUrl, setSystemWSUrl] = useState<string | null>(null)
    const [messageWSData, setMessageWSData] = useState<MessageWS | null>(null)
    useThrottleFn(
      (liveProgram) => {
        getEmbeddedData({ liveId: liveProgram.id })
          .then((embedded) => {
            setSystemWSUrl(embedded.site.relive.webSocketUrl)
          })
          .catch(console.error)
      },
      1000 * 10,
      [liveProgram]
    )
    useEffect(() => {
      if (!systemWSUrl) {
        return
      }
      const ws = new ReconnectingWebSocket(systemWSUrl)
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "startWatching",
            data: {
              stream: {
                quality: "abr",
                protocol: "hls",
                latency: "low",
                chasePlay: false,
              },
              room: {
                protocol: "webSocket",
                commentable: true,
              },
              reconnect: false,
            },
          })
        )
      }
      let keepSeat: NodeJS.Timer | null = null
      ws.onmessage = (e) => {
        const payload: NicoLiveWS = JSON.parse(e.data)
        switch (payload.type) {
          case "room": {
            setMessageWSData({
              uri: payload.data.messageServer.uri,
              threadId: payload.data.threadId,
            })
            break
          }
          case "ping": {
            ws.send(JSON.stringify({ type: "pong" }))
            break
          }
          case "seat": {
            keepSeat = setInterval(() => {
              ws.send(JSON.stringify({ type: "keepSeat" }))
            }, payload.data.keepIntervalSec * 1000)
            break
          }
          case "disconnect": {
            ws.close()
            break
          }
          default:
            break
        }
      }
      return () => {
        keepSeat && clearInterval(keepSeat)
        ws.close()
      }
    }, [systemWSUrl])
    useEffect(() => {
      if (!messageWSData) {
        return
      }
      const { threadId, uri } = messageWSData
      const ws = new ReconnectingWebSocket(uri)
      ws.onopen = () => {
        ws.send(
          JSON.stringify([
            {
              ping: {
                content: "rs:0",
              },
            },
            {
              ping: {
                content: "ps:0",
              },
            },
            {
              thread: {
                thread: threadId,
                version: "20061206",
                user_id: "guest",
                res_from: -10,
                with_global: 1,
                scores: 1,
                nicoru: 0,
              },
            },
            {
              ping: {
                content: "pf:0",
              },
            },
            {
              ping: {
                content: "rf:0",
              },
            },
          ])
        )
      }
      ws.onmessage = (e) => {
        const payload: { chat: NicoLiveChat } | { ping: { content: string } } =
          JSON.parse(e.data)
        if ("chat" in payload) {
          const { chat } = payload
          const text = trimCommentForFlow(chat.content)
          if (text.length === 0) {
            return
          }
          const { color, position } = parseMail(chat.mail)
          if (isDplayerFound) {
            const event = new CustomEvent(DPLAYER_COMMENT_EVENT, {
              bubbles: false,
              detail: {
                source: `ニコニコ生放送 [${liveProgram.title}/${chat.thread}]`,
                sourceUrl: `https://live.nicovideo.jp/watch/${liveProgram.id}`,
                time: chat.date,
                timeMs: chat.date_usec,
                author: chat.user_id,
                text,
                no: chat.no,
                color: color,
                type: position,
                commands: [],
              } as DPlayerCommentPayload,
            })
            window.dispatchEvent(event)
          }
          if (isPkrFound) {
            const detail: ChatInput = {
              thread: "1",
              no: chat.no.toString(),
              vpos: performance.now() / 10 + 200,
              mail: [chat.mail],
              date: dayjs(chat.date * 1000).format(),
              dateUsec: chat.date_usec,
              anonymous: !!chat.anonymity,
              commands: [color, position],
              content: text,
            }
            const event = new CustomEvent(PECORE_ID, {
              bubbles: false,
              detail,
            })
            window.dispatchEvent(event)
          }
        }
      }
      return () => {
        ws.close()
      }
    }, [messageWSData])
    return <></>
  }
)
