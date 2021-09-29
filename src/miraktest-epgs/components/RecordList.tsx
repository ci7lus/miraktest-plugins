import dayjs from "dayjs"
import React, { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "react-feather"
import { useTable, usePagination, Column, useGlobalFilter } from "react-table"
import { Service } from "../../@types/plugin"
import { EPGStationAPI } from "../api"
import type { EPGSProgramRecord } from "../types"
import "dayjs/locale/ja"

dayjs.locale("ja")

export const RecordList: React.VFC<{
  api: EPGStationAPI
  services: Service[]
  searchTerm: string | null
  setRecord: React.Dispatch<React.SetStateAction<EPGSProgramRecord | null>>
}> = ({ api, services, searchTerm, setRecord }) => {
  const [_records, setRecords] = useState<EPGSProgramRecord[] | null>(null)
  const records = useMemo(() => _records || [], [_records])

  const columns: Column<EPGSProgramRecord>[] = useMemo(
    () => [
      {
        id: "channel",
        Header: "放送局",
        accessor: (record: EPGSProgramRecord) =>
          services &&
          services.find((channel) => record.channelId === channel.id)?.name,
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
    [services]
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
    api
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
  }, [pageIndex, pageSize, globalFilter])
  useEffect(() => {
    gotoPage(0)
    setGlobalFilter(searchTerm)
  }, [searchTerm])

  return (
    <div className="h-full flex flex-col">
      <div className="w-full mx-auto px-2 py-2 overflow-auto">
        {_records === null || !services ? (
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
          disabled={!canPreviousPage}
          onClick={() => previousPage()}
          className={`${
            !canPreviousPage && "cursor-not-allowed text-gray-400"
          }`}
        >
          <ArrowLeft />
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
          <ArrowRight />
        </button>
      </div>
    </div>
  )
}
