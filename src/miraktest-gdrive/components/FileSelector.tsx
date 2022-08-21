import clsx from "clsx"
import React, { useState } from "react"
import { RotateCw, Search } from "react-feather"
import { ContentPlayerPlayingContent, Service } from "../../@types/plugin"
import { FileDetail } from "./FileDetail"
import { FileList } from "./FileList"

export const FileSelector: React.FC<{
  api: typeof gapi.client.drive
  services: Service[]
  setPlayingContent: React.Dispatch<
    React.SetStateAction<ContentPlayerPlayingContent | null>
  >
  openContentPlayer: (_: ContentPlayerPlayingContent) => Promise<number>
  port: number
  accessToken: string
}> = ({
  api,
  services,
  setPlayingContent,
  openContentPlayer,
  port,
  accessToken,
}) => {
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [localTerm, setLocalTerm] = useState<string>("")

  const [file, setFile] = useState<gapi.client.drive.File | null>(null)

  const [reload, setReload] = useState(0)

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
          <h2 className={clsx("font-semibold", "text-lg")}>Google Drive</h2>
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
        <div className={file ? "w-2/3" : "w-full"}>
          <FileList
            api={api}
            searchTerm={searchTerm || null}
            setFile={setFile}
            reload={reload}
          />
        </div>
        {file ? (
          <div className={clsx("w-1/3", "h-full", "overflow-auto")}>
            <FileDetail
              file={file}
              services={services}
              setPlayingContent={setPlayingContent}
              openContentPlayer={openContentPlayer}
              port={port}
              accessToken={accessToken}
              key={file.id}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
