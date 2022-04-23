import axios from "axios"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { Program, Service } from "../../@types/plugin"
import { DPLAYER_COMMENT_EVENT } from "../../miraktest-dplayer/constants"
import { DPlayerCommentPayload } from "../../miraktest-dplayer/types"
import { trimCommentForFlow } from "../../miraktest-saya/comment"
import { SayaDefinition } from "../../miraktest-saya/types"
import { ChatInput, PECORE_ID } from "../../pecore"
import { useRefFromState, wait } from "../../shared/utils"
import { parseMail, POSITION_MAP } from "../parser"
import { IdealChat, NicoLogComment, NicoSetting } from "../types"

export const KakologStream = ({
  sayaDefinition,
  service,
  program,
  isSeekable,
  time,
  setting,
  isPkrFound,
  isDplayerFound,
}: {
  sayaDefinition: SayaDefinition
  service: Service | null
  program: Program | null
  isSeekable: boolean
  time: number
  setting: NicoSetting
  isPkrFound: boolean
  isDplayerFound: boolean
}) => {
  const [comments, setComments] = useState<IdealChat[]>([])
  const [log, setLog] = useState<string[]>([])
  const [lastStartAt, setLastStartAt] = useState<number>(0)

  const [period, setPeriod] = useState<[number | null, number | null]>([
    null,
    null,
  ])
  const [jk, setJk] = useState<number | null>(null)
  useEffect(() => {
    if (!isPkrFound && !isDplayerFound) {
      return
    }
    if (!sayaDefinition) {
      return
    }
    const chDef = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(service?.serviceId || 0)
    )
    setJk(chDef?.nicojkId || null)
  }, [sayaDefinition, service])

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

  useThrottleFn(
    (jk: number | null, ...period: [number | null, number | null]) => {
      const [start, end] = period
      if (
        setting.isTimeshiftEnabled !== true ||
        jk === null ||
        !start ||
        !end
      ) {
        return
      }
      const cacheKey = period.join(",")
      if (log.includes(cacheKey)) {
        return
      }
      console.info("コメントの取得を開始します", jk, start, end)

      axios
        .get<{ packet: { chat: NicoLogComment }[] } | { error: string }>(
          `https://jikkyo.tsukumijima.net/api/kakolog/jk${jk}`,
          {
            params: {
              format: "json",
              starttime: Math.floor(start / 1000),
              endtime: Math.floor(end / 1000),
            },
          }
        )
        .then((r) => {
          const { data } = r
          if ("error" in data) {
            console.error(data.error)
            return
          }
          setComments((prev) =>
            [
              ...prev,
              ...data.packet.map((packet) => {
                const { chat } = packet
                const date = parseInt(chat.date)
                const date_usec = parseInt(chat.date_usec)
                return {
                  ...packet.chat,
                  no: parseInt(chat.no),
                  date,
                  date_usec,
                  vpos: parseInt(chat.vpos),
                  time: date * 1000 + date_usec / 1000,
                }
              }),
            ].sort((a, b) => a.time - b.time)
          )
          setLog((prev) => [...prev, cacheKey])
        })
        .catch((e) => {
          console.error(e)
        })
    },
    5000,
    [jk, ...period]
  )

  const timeRef = useRefFromState(time)

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

        if (comment.time < program.startAt + time - 2000) {
          index++
          continue
        }
        if (program.startAt + timeRef.current - 1000 < comment.time) {
          await wait(500)
          continue
        }
        const text = trimCommentForFlow(comment.content)
        if (text.length === 0) {
          index++
          continue
        }
        const { color, position, size } = parseMail(comment.mail)
        if (isPkrFound) {
          const detail: ChatInput = {
            thread: "1",
            no: comment.no.toString(),
            vpos: performance.now() / 10 + 200,
            mail: [],
            date: dayjs(comment.date).format(),
            dateUsec: comment.date_usec,
            anonymous: true,
            commands: [],
            content: text,
            color,
            colorCode: color,
            position: position,
            size,
          }
          const event = new CustomEvent(PECORE_ID, {
            bubbles: false,
            detail,
          })
          window.dispatchEvent(event)
        }

        if (isDplayerFound) {
          const event = new CustomEvent(DPLAYER_COMMENT_EVENT, {
            bubbles: false,
            detail: {
              source: `ニコニコ実況過去ログ [${comment.thread}]`,
              sourceUrl: `https://jikkyo.tsukumijima.net/api/kakolog/jk${jk}`,
              time: comment.date,
              timeMs: comment.date_usec,
              author: comment.user_id,
              text,
              no: comment.no,
              color,
              type: POSITION_MAP[position || "naka"] || "right",
              commands: [],
            } as DPlayerCommentPayload,
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
}
