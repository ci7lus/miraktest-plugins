import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import clsx from "clsx"
import dayjs from "dayjs"
import prettyBytes from "pretty-bytes"
import React, { useCallback, useEffect, useMemo, useState } from "react"

import "dayjs/locale/ja"
dayjs.locale("ja")

type File = gapi.client.drive.File
const columnHelper = createColumnHelper<File>()
const columns = [
  columnHelper.accessor((row) => row.name, {
    id: "name",
    header: "ファイル名",
  }),
  columnHelper.accessor(
    (row) => dayjs(row.modifiedTime).format("YYYY/MM/DD HH:mm"),
    {
      id: "modifiedTime",
      header: "更新日時",
    }
  ),
  columnHelper.accessor((row) => prettyBytes(parseInt(row.size || "NaN")), {
    id: "size",
    header: "サイズ",
  }),
]

export const FileList: React.FC<{
  searchTerm: string | null
  setFile: React.Dispatch<React.SetStateAction<File | null>>
  reload: number
}> = ({ searchTerm, setFile, reload }) => {
  const [_records, setFiles] = useState<File[] | null>(null)
  const data = useMemo(() => _records || [], [_records])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const [moreToken, setMoreToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const argument = useCallback(
    (moreToken?: string) => {
      const arg: Exclude<
        Parameters<typeof gapi.client.drive.files.list>[0],
        undefined
      > = {
        pageToken: moreToken,
        pageSize: 20,
        q: `${
          searchTerm?.trim() ? `fullText contains '${searchTerm}' and ` : ""
        }mimeType contains 'video/' and trashed = false`,
        orderBy: "modifiedTime desc",
        fields:
          "nextPageToken, files(id, name, createdTime, modifiedTime, size, thumbnailLink, videoMediaMetadata(width, height, durationMillis), webContentLink, exportLinks)",
        supportsAllDrives: true,
        includeTeamDriveItems: true,
      }
      return arg
    },
    [searchTerm]
  )

  useEffect(() => {
    setIsLoading(true)
    gapi.client.drive.files
      .list(argument())
      .then((result) => {
        setFiles(result.result.files || [])
        setMoreToken(result.result.nextPageToken || null)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(error)
        console.error("ファイルの取得に失敗しました")
        setIsLoading(false)
      })
  }, [searchTerm, reload])
  const handleLoadMore = useCallback(() => {
    if (!moreToken) {
      return
    }
    setIsLoading(true)
    gapi.client.drive.files
      .list(argument(moreToken))
      .then((result) => {
        setFiles((prev) => [...(prev || []), ...(result.result.files || [])])
        setMoreToken(result.result.nextPageToken || null)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(error)
        console.error("ファイルの取得に失敗しました")
        setIsLoading(false)
      })
  }, [searchTerm, moreToken])

  return (
    <div className={clsx("h-full", "flex", "flex-col")}>
      <div
        className={clsx("w-full", "mx-auto", "px-2", "py-2", "overflow-auto")}
      >
        {_records === null ? (
          <div
            className={clsx(
              "flex",
              "items-center",
              "justify-center",
              "h-full",
              "w-full"
            )}
            style={{ minHeight: "60vh" }}
          >
            Loading...
          </div>
        ) : (
          <table className={clsx("table", "w-full", "rounded-md")}>
            <thead className="table-header-group">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="table-row" id={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      id={header.id}
                      className={clsx(
                        "table-cell",
                        "text-center",
                        "font-bold",
                        "text-gray-800"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="table-row-group">
              {table.getRowModel().rows.map((row) => {
                return (
                  <a
                    role="cell block"
                    className={clsx(
                      "table-row",
                      "hover:bg-gray-200",
                      "cursor-pointer"
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      setFile((prev) =>
                        prev?.id === row.original.id ? null : row.original
                      )
                    }}
                    title={[row.original.name, row.original.description]
                      .filter((s) => !!s)
                      .join("\n\n")}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className={clsx(
                            "table-cell",
                            "px-2",
                            "whitespace-pre",
                            "truncate"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )
                    })}
                  </a>
                )
              })}
            </tbody>
          </table>
        )}
        <div className={clsx("m-2", "flex", "justify-center", "items-center")}>
          <button
            type="button"
            className={clsx(
              !moreToken || isLoading
                ? ["text-gray-400", "opacity-50", "cursor-not-allowed"]
                : "text-blue-400"
            )}
            disabled={!moreToken || isLoading}
            onClick={handleLoadMore}
          >
            続きを読み込む
          </button>
        </div>
      </div>
    </div>
  )
}
