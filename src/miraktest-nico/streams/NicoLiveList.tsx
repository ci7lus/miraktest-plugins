import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { Program, Service } from "../../@types/plugin"
import {
  SayaDefinition,
  SayaDefinitionChannel,
} from "../../miraktest-annict/types"
import { assertFulfilled } from "../../shared/utils"
import { getCommunityOnAir, getLivePrograms } from "../casAPI"
import { NicoSetting } from "../types"
import { PartialLiveProgram } from "../types/cas"
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
  const [def, setDef] = useState<SayaDefinitionChannel | null>(null)
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
      setDef(null)
      return
    }
    const chDef = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(service?.serviceId || 0)
    )
    console.info("ニコニコ実況（生）を有効化します:", chDef)
    setDef(chDef || null)
  }, [sayaDefinition, service, program, isSeekable])

  const [programs, setPrograms] = useState<PartialLiveProgram[]>([])

  useThrottleFn(
    (def) => {
      if (!def) {
        setPrograms([])
        return
      }
      console.info("ニコ生番組の取得を開始します", def.name)

      Promise.allSettled([
        ...(def.nicoliveCommunityIds || []).map((comId) =>
          getCommunityOnAir({ comId })
        ),
        ...(def.nicoliveTags || []).map((tag) =>
          getLivePrograms({ searchWord: tag })
        ),
      ]).then((results) => {
        setPrograms(
          Object.values(
            results
              .filter(assertFulfilled)
              .map((result) => result.value)
              .flat()
              .reduce((acc: Record<string, PartialLiveProgram>, cur) => {
                if (!acc[cur.id]) {
                  if (
                    !("tags" in cur) || // nicoliveCommunityIds より取得
                    cur.tags.find((tag) => tag.text === "ニコニコ実況")
                  ) {
                    acc[cur.id] = cur
                  }
                }
                return acc
              }, {})
          )
        )
      })
    },
    5000,
    [def]
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
