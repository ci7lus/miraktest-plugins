import React, { useState } from "react"
import { Search } from "react-feather"
import { ContentPlayerPlayingContent, Service } from "../../@types/plugin"
import { EPGStationAPI } from "../api"
import type { EPGSProgramRecord } from "../types"
import { RecordDetail } from "./RecordDetail"
import { RecordList } from "./RecordList"

export const Records: React.VFC<{
  api: EPGStationAPI
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
}> = ({ api, services, setPlayingContent, openContentPlayer }) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [localTerm, setLocalTerm] = useState<string>("")

  const [record, setRecord] = useState<EPGSProgramRecord | null>(null)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full bg-gray-800 text-gray-200">
        <div className="w-full py-2 pl-4 pr-2 flex items-center justify-between">
          <h2 className="font-semibold text-lg">録画番組</h2>
          <form
            className="flex items-center justify-center space-x-2 w-1/3"
            onSubmit={(e) => {
              e.preventDefault()
              setSearchTerm(localTerm || null)
            }}
          >
            <Search size={18} />
            <input
              type="text"
              placeholder="キーワードを入力…"
              className="block form-input rounded-md w-full text-gray-900"
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
      <div className="w-full flex overflow-auto">
        <div className={record ? "w-2/3" : "w-full"}>
          <RecordList
            api={api}
            services={services}
            searchTerm={searchTerm || null}
            setRecord={setRecord}
          />
        </div>
        {record ? (
          <div className="w-1/3 h-full overflow-auto">
            <RecordDetail
              api={api}
              record={record}
              services={services}
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
