import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { Program, Service } from "../../@types/plugin"
import { SayaDefinition } from "../../miraktest-annict/types"
import { getLivePrograms } from "../casAPI"
import { NicoSetting } from "../types"
import { LiveProgram } from "../types/cas"
import { NicoLiveStream } from "./NicoLive"

export const NicoLiveList = ({
  sayaDefinition,
  service,
  program,
  isSeekable,
  isPkrFound,
  isDplayerFound,
}: {
  sayaDefinition: SayaDefinition
  service: Service | null
  program: Program | null
  isSeekable: boolean
  setting: NicoSetting
  isPkrFound: boolean
  isDplayerFound: boolean
}) => {
  const [tags, setTags] = useState<string[]>([])
  useEffect(() => {
    if (!isPkrFound && !isDplayerFound) {
      return
    }
    if (
      isSeekable ||
      (program && dayjs().isAfter(program?.startAt + program.duration))
    ) {
      console.info(
        "過去番組の再生を検出したためニコニコ実況（生）を無効化します"
      )
      setTags([])
      return
    }
    const chDef = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(service?.serviceId || 0)
    )
    console.info("ニコニコ実況（生）を有効化します:", chDef)
    setTags(chDef?.nicoliveTags || [])
  }, [sayaDefinition, service, program, isSeekable])

  const [programs, setPrograms] = useState<LiveProgram[]>([])

  useThrottleFn(
    (tags: string[]) => {
      if (tags.length === 0) {
        setPrograms([])
        return
      }
      console.info("ニコ生番組の取得を開始します", tags)

      Promise.all(tags.map((tag) => getLivePrograms({ searchWord: tag }))).then(
        (results) => {
          setPrograms(
            Object.values(
              results.flat().reduce((acc: Record<string, LiveProgram>, cur) => {
                if (!acc[cur.id]) {
                  if (cur.tags.find((tag) => tag.text === "ニコニコ実況")) {
                    acc[cur.id] = cur
                  }
                }
                return acc
              }, {})
            )
          )
        }
      )
    },
    5000,
    [tags]
  )

  return (
    <>
      {programs.map((program) => (
        <NicoLiveStream
          key={program.id}
          liveProgram={program}
          isPkrFound={isPkrFound}
          isDplayerFound={isDplayerFound}
        />
      ))}
    </>
  )
}
