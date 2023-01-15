import { Switch } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useState } from "react"
import { File } from "react-feather"
import {
  ContentPlayerPlayingContent,
  InitPluginInRenderer,
  Program,
  Service,
} from "../../@types/plugin"

export const FileSelector: React.VFC<{
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
  requestDialog: Parameters<InitPluginInRenderer>[0]["rpc"]["requestDialog"]
}> = ({ services, setPlayingContent, openContentPlayer, requestDialog }) => {
  const [url, setFilePath] = useState("")
  const [startAt, setStartAt] = useState(
    dayjs().startOf("hour").format("YYYY-MM-DDTHH:mm")
  )
  const [duration, setDuration] = useState(30)
  const [serviceId, setServiceId] = useState(-1)

  const [isOpenWithNewWindow, setIsOpenWithNewWindow] = useState(false)

  return (
    <div className={clsx("w-full", "h-full", "flex", "flex-col")}>
      <div className={clsx("w-full", "bg-gray-800", "text-gray-200")}>
        <div
          className={clsx(
            "w-full",
            "py-2",
            "pl-4",
            "pr-2",
            "flex",
            "items-center",
            "justify-between"
          )}
        >
          <h2 className={clsx("font-semibold", "text-lg")}>
            ローカルファイル再生
          </h2>
        </div>
      </div>
      <div className={clsx("w-full", "flex", "overflow-auto", "p-4")}>
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault()
            if (!url) {
              return
            }
            const contentType = "Local"
            const service = services.find(
              (service) => service.serviceId === serviceId
            )
            const program: Program | undefined = startAt
              ? {
                  startAt: dayjs(startAt).unix() * 1000,
                  duration: duration * 1000 * 60,
                  id: -1,
                  networkId: -1,
                  serviceId,
                  eventId: -1,
                  isFree: true,
                }
              : undefined
            const contentPlayload = {
              contentType,
              url,
              program,
              service,
            }
            console.info("再生します:", contentPlayload)
            if (isOpenWithNewWindow) {
              openContentPlayer(contentPlayload)
            } else {
              setPlayingContent(contentPlayload)
            }
          }}
        >
          <label className={clsx("block", "w-full")}>
            <span>ファイルを選択</span>
            <div className={clsx("flex", "justify-center", "grow")}>
              <input
                type="text"
                className={clsx(
                  "block",
                  "mt-1",
                  "form-input",
                  "rounded-l-md",
                  "w-full",
                  "text-gray-900",
                  "cursor-pointer"
                )}
                value={url || ""}
                onChange={(e) => setFilePath(e.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                className={clsx(
                  "px-4",
                  "py-2",
                  "mt-1",
                  "rounded-r-md",
                  "flex",
                  "items-center",
                  "justify-center",
                  "bg-gray-200",
                  "text-gray-900",
                  "cursor-pointer"
                )}
                onClick={async () => {
                  const dialog = await requestDialog({
                    properties: ["openFile"],
                  })
                  if (dialog.canceled) {
                    return
                  }
                  const path = dialog.filePaths.at(0)
                  if (!path) {
                    return
                  }
                  setFilePath(
                    // Windows なら file:///C:\path\to\file.m2ts、Linux / Mac なら file:///path/to/file.m2ts になるように加工する
                    "file:///" + path.at(0) === "/" ? path.slice(1) : path
                  )
                }}
              >
                <File className="pointer-events-none" size="1.75rem" />
              </button>
            </div>
          </label>
          <div className={clsx("flex", "space-x-2", "W-full")}>
            <label className={clsx("block", "mt-2")}>
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
                value={startAt || ""}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label className={clsx("block", "mt-2")}>
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
                value={duration}
                onChange={(e) => {
                  const p = parseInt(e.target.value)
                  if (Number.isNaN(p)) {
                    return
                  }
                  setDuration(p)
                }}
              />
              {startAt && dayjs(startAt).isValid() ? (
                <span>{dayjs(startAt).add(duration, "minutes").format()}</span>
              ) : (
                <span>無効な日付</span>
              )}
            </label>
          </div>
          <select
            className={clsx(
              "appearance-none",
              "border",
              "rounded",
              "py-2",
              "px-2",
              "mt-2",
              "leading-tight"
            )}
            value={serviceId}
            onChange={(e) => {
              const selectedServiceId = parseInt(e.target.value)
              if (Number.isNaN(selectedServiceId)) {
                setServiceId(-1)
                return
              }
              setServiceId(selectedServiceId)
            }}
          >
            <option value="-1" defaultChecked>
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
          <Switch.Group>
            <div className={clsx("flex", "items-center", "mt-4")}>
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
                    "transform",
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
          <button
            type="submit"
            className={clsx(
              "bg-blue-500",
              "text-gray-100",
              "p-2",
              "px-3",
              "my-4",
              "rounded-md",

              "cursor-pointer",
              "active:bg-gray-200"
            )}
          >
            再生
          </button>
        </form>
      </div>
    </div>
  )
}
