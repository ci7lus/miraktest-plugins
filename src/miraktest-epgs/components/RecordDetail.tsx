import { Switch } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useCallback, useEffect, useState } from "react"
import { Play } from "react-feather"
import { useRecoilState } from "recoil"
import { ContentPlayerPlayingContent } from "../../@types/plugin"
import { AutoLinkedText } from "../../shared/AutoLinkedText"
import { EPGStationAPI } from "../api"
import { thumbnailFamily } from "../atom"
import { Genre, SubGenre } from "../constants"
import {
  convertChannelToService,
  convertProgramRecordToProgram,
} from "../convertion"
import { EPGSChannel, EPGSProgramRecord } from "../types"

import "dayjs/locale/ja"
dayjs.locale("ja")

export const RecordDetail: React.VFC<{
  api: EPGStationAPI
  record: EPGSProgramRecord
  channels: EPGSChannel[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
}> = ({ api, record, channels, setPlayingContent, openContentPlayer }) => {
  const thumbnail = [...record.thumbnails].shift()
  const [thumbnailUrl, setThunbnailUrl] = useRecoilState(
    thumbnailFamily(thumbnail || 0)
  )

  const duration = (record.endAt - record.startAt) / 1000
  const channel = channels.find((channel) => channel.id === record.channelId)

  const genre1 = Genre[record.genre1]
  const subGenre1 = genre1 && SubGenre[record.genre1][record.subGenre1]
  const genre2 = Genre[record.genre2]
  const subGenre2 = genre2 && SubGenre[record.genre2][record.subGenre2]
  const genre3 = Genre[record.genre3]
  const subGenre3 = genre3 && SubGenre[record.genre3][record.subGenre3]

  const [isOpenWithNewWindow, setIsOpenWithNewWindow] = useState(false)
  const [isStartAtOverride, setIsStartAtOverride] = useState(false)
  const [startAtOver, setStartAtOver] = useState(
    dayjs(record.startAt).format("YYYY-MM-DDTHH:mm")
  )
  const [durationOver, setDurationOver] = useState(duration / 60)

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
      const program = convertProgramRecordToProgram(record, channel)
      const service = channel ? convertChannelToService(channel) : undefined
      if (isStartAtOverride) {
        program.startAt = dayjs(startAtOver).unix() * 1000
        program.duration = durationOver * 1000 * 60
      }
      program.startAt -= 3000
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
    [record, isStartAtOverride, startAtOver, durationOver]
  )

  return (
    <div
      className={clsx(
        "flex",
        "flex-col",
        "items-start",
        "justify-around",
        "select-text",
        "leading-loose"
      )}
    >
      {0 < record.thumbnails.length ? (
        <div
          className={clsx("w-full", "bg-gray-400", "bg-center", "bg-cover")}
          style={{
            aspectRatio: "16/9",
            backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          }}
        ></div>
      ) : (
        <></>
      )}
      <div className={clsx("w-full", "p-4")}>
        {channel ? (
          <h3 className={clsx("text-xl", "text-gray-600", "mb-1")}>
            {channel.name}
          </h3>
        ) : (
          <></>
        )}
        <h2 className={clsx("text-2xl", "mb-2")}>{record.name}</h2>
        <div className={clsx("text-xl", "mb-2")}>
          {`${dayjs(record.startAt).format("YYYY/MM/DD(ddd) HH:mm")} - ${dayjs(
            record.endAt
          ).format("HH:mm")} (${duration / 60}分間)`}
        </div>
        <div className={clsx("text-gray-600", "leading-relaxed")}>
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
        <div
          className={clsx("w-full", "p-2", "bg-gray-200", "rounded-md", "my-2")}
        >
          <Switch.Group>
            <div className={clsx("flex", "items-center", "mb-2")}>
              <Switch
                checked={isOpenWithNewWindow}
                onChange={() => setIsOpenWithNewWindow((prev) => !!prev)}
                className={clsx(
                  isOpenWithNewWindow ? "bg-blue-600" : "bg-gray-300",
                  "relative",
                  "inline-flex",
                  "items-center",
                  "h-6",
                  "rounded-full",
                  "w-11"
                )}
              >
                <span
                  className={clsx(
                    isOpenWithNewWindow ? "translate-x-6" : "translate-x-1",
                    "inline-block",
                    "w-4",
                    "h-4",
                    "bg-white",
                    "rounded-full",
                    "transition",
                    "ease-in-out",
                    "duration-200"
                  )}
                />
              </Switch>
              <Switch.Label className="ml-2">
                新しいウィンドウで開く
              </Switch.Label>
            </div>
          </Switch.Group>
          <Switch.Group>
            <div className={clsx("flex", "items-center", "mb-2")}>
              <Switch
                checked={isStartAtOverride}
                onChange={() => setIsStartAtOverride((prev) => !!prev)}
                className={`${
                  isStartAtOverride ? "bg-blue-600" : "bg-gray-300"
                } relative inline-flex items-center h-6 rounded-full w-11`}
              >
                <span
                  className={clsx(
                    isStartAtOverride ? "translate-x-6" : "translate-x-1",
                    "inline-block",
                    "w-4",
                    "h-4",
                    "bg-white",
                    "rounded-full",
                    "transition",
                    "ease-in-out",
                    "duration-200"
                  )}
                />
              </Switch>
              <Switch.Label className="ml-2">時間を上書きする</Switch.Label>
            </div>
          </Switch.Group>
          {isStartAtOverride && (
            <div className="w-full">
              <label className={clsx("block", "mt-2", "w-full")}>
                <span>開始時間</span>
                <input
                  type="datetime-local"
                  className={clsx(
                    "block",
                    "mt-1",
                    "form-input",
                    "rounded-md",
                    "w-full",
                    "text-gray-900"
                  )}
                  value={startAtOver || ""}
                  onChange={(e) => setStartAtOver(e.target.value)}
                />
              </label>
              <label className={clsx("block", "mt-2", "w-full")}>
                <span>長さ</span>
                <input
                  type="number"
                  className={clsx(
                    "block",
                    "mt-1",
                    "form-input",
                    "rounded-md",
                    "w-full",
                    "text-gray-900"
                  )}
                  value={durationOver}
                  onChange={(e) => {
                    const p = parseInt(e.target.value)
                    if (Number.isNaN(p)) {
                      return
                    }
                    setDurationOver(p)
                  }}
                />
                {startAtOver && dayjs(startAtOver).isValid() ? (
                  <span>
                    {dayjs(startAtOver).add(durationOver, "minutes").format()}
                  </span>
                ) : (
                  <span>無効な日付</span>
                )}
              </label>
            </div>
          )}
          <div className={clsx("flex space-x-2 overflow-auto flex-wrap")}>
            {record.videoFiles.map((videoFile) => (
              <button
                key={videoFile.id}
                type="button"
                className={clsx(
                  "bg-indigo-400",
                  "text-gray-100",
                  "rounded-md",
                  "px-2",
                  "p-1",
                  "flex",
                  "items-center",
                  "justify-center",
                  "space-x-1",
                  "focus:outline-none",
                  "m-1"
                )}
                onClick={() => play(videoFile.id, isOpenWithNewWindow)}
              >
                <Play className="shrink-0" size={16} />
                <span className="shrink-0">{videoFile.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div
          className={clsx(
            "w-full",
            "bg-gray-200",
            "whitespace-pre-wrap",
            "rounded-md",
            "p-4",
            "md:my-2",
            "text-sm",
            "leading-relaxed",
            "programDescription"
          )}
        >
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
