import { Switch } from "@headlessui/react"
import clsx from "clsx"
import React, { useState } from "react"
import { RotateCw, Search } from "react-feather"
import { ContentPlayerPlayingContent } from "../../@types/plugin"
import { EPGStationAPI } from "../api"
import type { EPGSChannel, EPGSProgramRecord } from "../types"
import { RecordDetail } from "./RecordDetail"
import { RecordList } from "./RecordList"

export const Records: React.VFC<{
  api: EPGStationAPI
  channels: EPGSChannel[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
}> = ({ api, channels, setPlayingContent, openContentPlayer }) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [localTerm, setLocalTerm] = useState<string>("")

  const [record, setRecord] = useState<EPGSProgramRecord | null>(null)

  const [reload, setReload] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

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
          <h2 className={clsx("font-semibold", "text-lg")}>録画番組</h2>
          <div
            className={clsx(
              "w-1/2",
              "flex",
              "items-center",
              "justify-center",
              "space-x-4"
            )}
          >
            <button
              type="button"
              onClick={() => setReload(performance.now())}
              className={clsx(
                "shrink-0",
                "bg-gray-900",
                "hover:bg-gray-800",
                "p-1",
                "rounded-md"
              )}
            >
              <RotateCw size={20} />
            </button>
            <Switch.Group>
              <div
                className={clsx(
                  "flex",
                  "items-center",
                  "justify-center",
                  "shrink-0"
                )}
              >
                <Switch
                  checked={isRecording}
                  onChange={setIsRecording}
                  className={clsx(
                    isRecording ? "bg-blue-600" : "bg-gray-300",
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
                      isRecording ? "translate-x-6" : "translate-x-1",
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
                <Switch.Label className="ml-2">録画中</Switch.Label>
              </div>
            </Switch.Group>
            <form
              className={clsx(
                "flex",
                "items-center",
                "justify-center",
                "space-x-2",
                "w-full"
              )}
              onSubmit={(e) => {
                e.preventDefault()
                setSearchTerm(localTerm || null)
              }}
            >
              <Search size={20} />
              <input
                type="text"
                placeholder="キーワードを入力…"
                className={clsx(
                  "block",
                  "form-input",
                  "rounded-md",
                  "w-full",
                  "text-gray-900"
                )}
                value={localTerm}
                onChange={(e) => setLocalTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    setSearchTerm(localTerm || null)
                  }
                }}
              />
            </form>
          </div>
        </div>
      </div>
      <div className={clsx("w-full", "flex", "overflow-auto")}>
        <div className={record ? "w-2/3" : "w-full"}>
          <RecordList
            api={api}
            channels={channels}
            searchTerm={searchTerm || null}
            setRecord={setRecord}
            reload={reload}
            isRecording={isRecording}
          />
        </div>
        {record ? (
          <div className={clsx("w-1/3", "h-full", "overflow-auto")}>
            <RecordDetail
              api={api}
              record={record}
              channels={channels}
              setPlayingContent={setPlayingContent}
              openContentPlayer={openContentPlayer}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
