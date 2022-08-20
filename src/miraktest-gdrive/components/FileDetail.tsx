import { Switch } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Play } from "react-feather"
import {
  ContentPlayerPlayingContent,
  Program,
  Service,
} from "../../@types/plugin"
import { AutoLinkedText } from "../../shared/AutoLinkedText"

import "dayjs/locale/ja"
dayjs.locale("ja")

export const FileDetail: React.FC<{
  file: gapi.client.drive.File
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
  port: number
  accessToken: string
}> = ({
  file,
  services,
  setPlayingContent,
  openContentPlayer,
  port,
  accessToken,
}) => {
  const [isOpenWithNewWindow, setIsOpenWithNewWindow] = useState(false)
  const durationMills = useMemo(
    () => parseInt(file.videoMediaMetadata?.durationMillis || "1800000"), // 30分
    [file]
  )
  const [startAtOver, setStartAtOver] = useState(
    dayjs(file.modifiedTime)
      .subtract(durationMills, "ms")
      .format("YYYY-MM-DDTHH:mm")
  )
  useEffect(() => {
    setStartAtOver(
      dayjs(file.modifiedTime)
        .subtract(durationMills, "ms")
        .format("YYYY-MM-DDTHH:mm")
    )
  }, [file])
  const [durationOver, setDurationOver] = useState(
    Math.ceil(durationMills / 1000 / 60)
  )
  useEffect(() => {
    setDurationOver(Math.ceil(durationMills / 1000 / 60))
  }, [durationMills])
  const [serviceId, setServiceId] = useState(0)

  const play = useCallback(() => {
    const program: Program = {
      id: -1,
      eventId: -1,
      serviceId: serviceId,
      networkId: -1,
      startAt: dayjs(startAtOver).unix() * 1000,
      duration: durationOver * 1000 * 60 - 3000,
      isFree: true,
      name: file.name,
      description: file.description,
    }
    const service = services.find((service) => service.id === serviceId)
    const url = new URL(`http://localhost`)
    url.port = port.toString()
    url.pathname = `/file/${file.id}`
    url.searchParams.set("access_token", accessToken)
    const payload = {
      contentType: "GoogleDrive",
      url: url.href,
      service,
      program,
    }
    if (isOpenWithNewWindow) {
      openContentPlayer(payload)
    } else {
      setPlayingContent(payload)
    }
  }, [file, startAtOver, durationOver, isOpenWithNewWindow, port, accessToken])

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
      {file.thumbnailLink ? (
        <div
          className={clsx("w-full", "bg-gray-400", "bg-center", "bg-cover")}
          style={{
            aspectRatio: "16/9",
            backgroundImage: file.thumbnailLink
              ? `url(${file.thumbnailLink})`
              : undefined,
          }}
        ></div>
      ) : (
        <></>
      )}
      <div className={clsx("w-full", "p-4")}>
        <h2 className={clsx("text-2xl", "mb-2")}>{file.name}</h2>
        <div className={clsx("text-xl", "mb-2")}>
          {`${dayjs(file.modifiedTime).format("YYYY/MM/DD(ddd) HH:mm")}${
            durationMills !== 0
              ? ` (${Math.ceil(durationMills / 1000 / 60)}分間)`
              : ""
          }`}
        </div>
        <form
          className={clsx("w-full", "p-2", "bg-gray-200", "rounded-md", "my-2")}
          onSubmit={(e) => {
            e.preventDefault()
            play()
          }}
        >
          <Switch.Group>
            <div className={clsx("flex", "items-center", "mb-2")}>
              <Switch
                checked={isOpenWithNewWindow}
                onChange={setIsOpenWithNewWindow}
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
          <div className="w-full">
            <label className={clsx("block", "mt-2", "w-full")}>
              <span>サービス</span>
              <select
                className={clsx(
                  "block",
                  "appearance-none",
                  "border",
                  "rounded",
                  "p-2",
                  "mt-1",
                  "leading-tight"
                )}
                value={serviceId}
                onChange={(e) => {
                  const selectedServiceId = parseInt(e.target.value)
                  if (Number.isNaN(selectedServiceId)) {
                    setServiceId(0)
                    return
                  }
                  setServiceId(selectedServiceId)
                }}
                required
              >
                <option value="0" defaultChecked>
                  選択解除
                </option>
                {services.map((service) => {
                  return (
                    <option key={service.id} value={service.serviceId}>
                      {service.name}
                    </option>
                  )
                })}
              </select>
            </label>
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
                min={1}
                required
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
          <div className={clsx("flex space-x-2 overflow-auto flex-wrap")}>
            <button
              type="submit"
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
                "m-1"
              )}
            >
              <Play className="shrink-0" size={16} />
              <span className="shrink-0">再生</span>
            </button>
          </div>
        </form>
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
            {[file.description].filter((s) => !!s).join("\n\n")}
          </AutoLinkedText>
        </div>
      </div>
    </div>
  )
}
