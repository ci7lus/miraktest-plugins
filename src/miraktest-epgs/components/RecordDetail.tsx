import { Switch } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useCallback, useEffect, useState } from "react"
import { Play } from "react-feather"
import { useRecoilState } from "recoil"
import { ContentPlayerPlayingContent, Service } from "../../@types/plugin"
import { AutoLinkedText } from "../../shared/AutoLinkedText"
import { EPGStationAPI } from "../api"
import { thumbnailFamily } from "../atom"
import { Genre, SubGenre } from "../constants"
import { convertProgramRecordToProgram } from "../convertion"
import { EPGSProgramRecord } from "../types"

import "dayjs/locale/ja"
dayjs.locale("ja")

export const RecordDetail: React.VFC<{
  api: EPGStationAPI
  record: EPGSProgramRecord
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
}> = ({ api, record, services, setPlayingContent, openContentPlayer }) => {
  const thumbnail = [...record.thumbnails].shift()
  const [thumbnailUrl, setThunbnailUrl] = useRecoilState(
    thumbnailFamily(thumbnail || 0)
  )

  const duration = (record.endAt - record.startAt) / 1000
  const service = services.find((service) => service.id === record.channelId)

  const genre1 = Genre[record.genre1]
  const subGenre1 = genre1 && SubGenre[record.genre1][record.subGenre1]
  const genre2 = Genre[record.genre2]
  const subGenre2 = genre2 && SubGenre[record.genre2][record.subGenre2]
  const genre3 = Genre[record.genre3]
  const subGenre3 = genre3 && SubGenre[record.genre3][record.subGenre3]

  const [isOpenWithNewWindow, setIsOpenWithNewWindow] = useState(false)

  useEffect(() => {
    if (thumbnailUrl) {
      return
    }
    setThunbnailUrl(null)
    const thumbnail = [...record.thumbnails].shift()
    if (!thumbnail) return
    api
      .getThumbnailUrl({ id: thumbnail })
      .then((url) => setThunbnailUrl(url))
      .catch(console.warn)
  }, [thumbnailUrl])

  const play = useCallback(
    (videoId: number, isNewWindow: boolean) => {
      const url = api.getVideoUrl({ videoId })
      const program = convertProgramRecordToProgram(record, service)
      const payload = {
        contentType: "EPGStation",
        url,
        service,
        program,
      }
      if (isNewWindow) {
        openContentPlayer(payload)
      } else {
        setPlayingContent(payload)
      }
    },
    [record]
  )

  return (
    <div className="flex flex-col items-start justify-around select-text leading-loose">
      {0 < record.thumbnails.length ? (
        <div
          className="w-full bg-gray-400 bg-center bg-cover"
          style={{
            aspectRatio: "16/9",
            backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          }}
        ></div>
      ) : (
        <></>
      )}
      <div className="w-full p-4">
        {service ? (
          <h3 className="text-xl text-gray-600 mb-1">{service.name}</h3>
        ) : (
          <></>
        )}
        <h2 className="text-2xl mb-2">{record.name}</h2>
        <div className="text-xl mb-2">
          {`${dayjs(record.startAt).format("YYYY/MM/DD(ddd) HH:mm")} - ${dayjs(
            record.endAt
          ).format("HH:mm")} (${duration / 60}分間)`}
        </div>
        <div className="text-gray-600 leading-relaxed">
          {[
            [genre1, subGenre1],
            [genre2, subGenre2],
            [genre3, subGenre3],
          ]
            .filter(([genre]) => !!genre)
            .map(([genre, subGenre]) => (
              <p key={`${genre}${subGenre}`}>
                {genre}
                {subGenre && ` / ${subGenre}`}
              </p>
            ))}
        </div>
        <div className="w-full p-2 bg-gray-200 rounded-md my-2">
          <Switch.Group>
            <div className="flex items-center mb-2">
              <Switch
                checked={isOpenWithNewWindow}
                onChange={(e) => setIsOpenWithNewWindow(e)}
                className={`${
                  isOpenWithNewWindow ? "bg-blue-600" : "bg-gray-300"
                } relative inline-flex items-center h-6 rounded-full w-11`}
              >
                <span
                  className={`${
                    isOpenWithNewWindow ? "translate-x-6" : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200`}
                />
              </Switch>
              <Switch.Label className="ml-2">
                新しいウィンドウで開く
              </Switch.Label>
            </div>
          </Switch.Group>
          <div className={clsx("flex space-x-2 overflow-auto flex-wrap")}>
            {record.videoFiles.map((videoFile) => (
              <button
                key={videoFile.id}
                type="button"
                className="bg-indigo-400 text-gray-100 rounded-md px-2 p-1 flex items-center justify-center space-x-1 focus:outline-none m-1"
                onClick={() => play(videoFile.id, isOpenWithNewWindow)}
              >
                <Play className="flex-shrink-0" size={16} />
                <span className="flex-shrink-0">{videoFile.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-full bg-gray-200 whitespace-pre-wrap rounded-md p-4 md:my-2 text-sm leading-relaxed programDescription">
          <AutoLinkedText>
            {[record.description, record.extended]
              .filter((s) => !!s)
              .join("\n\n")}
          </AutoLinkedText>
        </div>
      </div>
    </div>
  )
}
