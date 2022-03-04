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
  const [filePath, setFilePath] = useState("")
  const [startAt, setStartAt] = useState("")
  const [duration, setDuration] = useState(30)
  const [serviceId, setServiceId] = useState(-1)

  const [isOpenWithNewWindow, setIsOpenWithNewWindow] = useState(false)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full bg-gray-800 text-gray-200">
        <div className="w-full py-2 pl-4 pr-2 flex items-center justify-between">
          <h2 className="font-semibold text-lg">ローカルファイル再生</h2>
        </div>
      </div>
      <div className="w-full flex overflow-auto p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!filePath) {
              return
            }
            const contentType = "Local"
            const url = "file://" + filePath
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
          <label className="block w-full">
            <span>ファイルを選択</span>
            <div className="flex justify-center flex-grow">
              <input
                type="text"
                className={clsx(
                  "block mt-1 form-input rounded-l-md w-full text-gray-900 focus:outline-none cursor-pointer"
                )}
                value={filePath || ""}
                onChange={(e) => setFilePath(e.target.value)}
                spellCheck={false}
              />
              <button
                className={clsx(
                  `px-4 py-2 mt-1 rounded-r-md flex items-center justify-center bg-gray-200 text-gray-900 focus:outline-none cursor-pointer`
                )}
                onClick={async () => {
                  const dialog = await requestDialog({
                    properties: ["openFile"],
                  })
                  if (dialog.canceled) {
                    return
                  }
                  const path = dialog.filePaths.slice(0).shift()
                  if (!path) {
                    return
                  }
                  setFilePath(path)
                }}
              >
                <File className="pointer-events-none" size="1.75rem" />
              </button>
            </div>
          </label>
          <div className={clsx("flex", "space-x-2")}>
            <label className="block mt-2">
              <span>開始時間</span>
              <input
                type="datetime-local"
                className="block mt-1 form-input rounded-md w-full text-gray-900"
                value={startAt || ""}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>
            <label className="block mt-2">
              <span>長さ</span>
              <input
                type="number"
                className="block mt-1 form-input rounded-md w-full text-gray-900"
                value={duration}
                onChange={(e) => {
                  const p = parseInt(e.target.value)
                  if (Number.isNaN(p)) {
                    return
                  }
                  setDuration(p)
                }}
              />
              {startAt ? (
                <span>{dayjs(startAt).add(duration, "minutes").format()}</span>
              ) : (
                <span>未選択</span>
              )}
            </label>
          </div>
          <select
            className="appearance-none border rounded py-2 px-2 mt-2 leading-tight focus:outline-none"
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
                <option key={service.serviceId} value={service.serviceId}>
                  {service.name}
                </option>
              )
            })}
          </select>
          <Switch.Group>
            <div className="flex items-center mt-4">
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
          <button
            type="submit"
            className="bg-blue-500 text-gray-100 p-2 px-3 my-4 rounded-md focus:outline-none cursor-pointer active:bg-gray-200"
          >
            再生
          </button>
        </form>
      </div>
    </div>
  )
}
