import dayjs from "dayjs"
import React, { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "react-feather"
import { useTable, usePagination, Column, useGlobalFilter } from "react-table"
import { EPGStationAPI } from "../api"
import type { EPGSChannel, EPGSProgramRecord } from "../types"
import "dayjs/locale/ja"

dayjs.locale("ja")

export const RecordList: React.VFC<{
  api: EPGStationAPI
  channels: EPGSChannel[]
  searchTerm: string | null
  setRecord: React.Dispatch<React.SetStateAction<EPGSProgramRecord | null>>
  reload: number
  isRecording: boolean
}> = ({ api, channels, searchTerm, setRecord, reload, isRecording }) => {
  const [_records, setRecords] = useState<EPGSProgramRecord[] | null>(null)
  const records = useMemo(() => _records || [], [_records])

  const columns: Column<EPGSProgramRecord>[] = useMemo(
    () => [
      {
        id: "channel",
        Header: "放送局",
        accessor: (record: EPGSProgramRecord) =>
          channels &&
          channels.find((channel) => record.channelId === channel.id)?.name,
      },
      {
        id: "name",
        Header: "番組名",
        accessor: (record: EPGSProgramRecord) => record.name,
      },
      {
        id: "startAt",
        Header: "放送日時",
        accessor: (record: EPGSProgramRecord) =>
          dayjs(record.startAt).format("YYYY/MM/DD(ddd) HH:mm"),
      },
      {
        id: "duration",
        Header: "長さ",
        accessor: (record: EPGSProgramRecord) =>
          (record.endAt - record.startAt) / 1000 / 60,
        Cell: ({ value }: { value: number }) => `${value}m`,
      },
    ],
    [channels]
  )

  const [total, setTotal] = useState<number | null>(null)
  const [_pageSize, setPageSize] = useState(20)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageOptions,
    state: { pageIndex, pageSize, globalFilter },
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
    gotoPage,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: records || [],
      initialState: { pageSize: 20 },
      manualPagination: true,
      manualGlobalFilter: true,
      pageCount: Math.ceil((total || 0) / _pageSize),
    },
    useGlobalFilter,
    usePagination
  )

  useEffect(() => {
    setPageSize(pageSize)
    isRecording
      ? api
          .getRecordings({ offset: pageSize * pageIndex, limit: pageSize })
          .then(({ records, total }) => {
            setTotal(total)
            setRecords(records)
          })
          .catch(() => console.error("録画番組の取得に失敗しました"))
      : api
          .getRecords({
            offset: pageSize * pageIndex,
            limit: pageSize,
            keyword: globalFilter || undefined,
          })
          .then(({ records, total }) => {
            setTotal(total)
            setRecords(records)
          })
          .catch(() => console.error("録画番組の取得に失敗しました"))
  }, [pageIndex, pageSize, globalFilter, reload, isRecording])
  useEffect(() => {
    gotoPage(0)
    setGlobalFilter(searchTerm)
  }, [searchTerm, isRecording])

  return (
    <div className="h-full flex flex-col">
      <div className="w-full mx-auto px-2 py-2 overflow-auto">
        {_records === null || !channels ? (
          <div
            className="flex items-center justify-center h-full w-full"
            style={{ minHeight: "60vh" }}
          >
            Loading...
          </div>
        ) : (
          <div {...getTableProps()} className="table w-full rounded-md">
            <div className="table-header-group">
              {headerGroups.map((headerGroup) => (
                <div
                  className="table-row"
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column) => (
                    <div
                      {...column.getHeaderProps()}
                      className={`table-cell text-center font-bold text-gray-800`}
                    >
                      {column.render("Header")}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="table-row-group" {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row)
                return (
                  <a
                    role="cell block"
                    className="table-row hover:bg-gray-200 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      setRecord((prev) =>
                        prev?.id === row.original.id ? null : row.original
                      )
                    }}
                    title={[
                      row.original.name,
                      row.original.description,
                      row.original.extended,
                    ]
                      .filter((s) => !!s)
                      .join("\n\n")}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <span
                          {...cell.getCellProps()}
                          className={`table-cell px-2 whitespace-pre truncate`}
                        >
                          {cell.render("Cell")}
                        </span>
                      )
                    })}
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <div className="px-2 my-4 flex justify-center items-center space-x-4">
        <button
          type="button"
          onClick={() => gotoPage(0)}
          disabled={pageIndex === 0}
          className={`${pageIndex === 0 && "cursor-not-allowed text-gray-400"}`}
        >
          <ChevronsLeft />
        </button>
        <button
          type="button"
          disabled={!canPreviousPage}
          onClick={() => previousPage()}
          className={`${
            !canPreviousPage && "cursor-not-allowed text-gray-400"
          }`}
        >
          <ChevronLeft />
        </button>
        <div>
          {pageIndex + 1}/{pageOptions.length || 1}
        </div>
        <button
          type="button"
          disabled={!canNextPage}
          onClick={() => nextPage()}
          className={`${!canNextPage && "cursor-not-allowed text-gray-400"}`}
        >
          <ChevronRight />
        </button>
        <button
          type="button"
          disabled={!pageOptions.length}
          onClick={() => {
            pageOptions.length && gotoPage(pageOptions.length - 1)
          }}
          className={`${
            !pageOptions.length && "cursor-not-allowed text-gray-400"
          }`}
        >
          <ChevronsRight />
        </button>
      </div>
    </div>
  )
}
