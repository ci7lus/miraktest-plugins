import clsx from "clsx"
import React, { useEffect, useRef, useState } from "react"
import { Search } from "react-feather"
import { useDebounce } from "react-use"
import { generateGqlClient } from "../annictAPI"
import { Work } from "../gql"

type QueryWork = Pick<Work, "id" | "annictId" | "title" | "image">

export const SearchWorkForm: React.FC<{
  accessToken: string
  setWorkId: React.Dispatch<React.SetStateAction<number | null>>
}> = ({ accessToken, setWorkId }) => {
  const [localTerm, setLocalTerm] = useState("")
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [works, setWorks] = useState<QueryWork[] | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!searchTerm || Array.from(searchTerm).length < 2) {
      setWorks(null)
      return
    }
    const sdk = generateGqlClient(accessToken)
    let isSubscribed = true
    sdk
      .searchWorksByTerm({
        term: searchTerm,
      })
      .then((result) => {
        if (isSubscribed) {
          setWorks((result.searchWorks?.nodes || []) as QueryWork[])
          setIsVisible(true)
        }
      })
    return () => {
      isSubscribed = false
    }
  }, [searchTerm])
  useDebounce(
    () => {
      setSearchTerm(localTerm || null)
    },
    750,
    [localTerm]
  )
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.composedPath().shift()
      if (!event || !ref.current || ref.current.contains(target as Node)) {
        return
      }
      setIsVisible(false)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref])

  return (
    <div className={clsx("relative")} ref={ref}>
      <form
        className="flex items-center justify-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault()
          setSearchTerm(localTerm || null)
        }}
      >
        <input
          type="text"
          placeholder="キーワードを入力…"
          className="block form-input rounded-md w-full text-gray-900 pr-8"
          value={localTerm}
          onChange={(e) => setLocalTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              setSearchTerm(localTerm || null)
            }
          }}
          onFocus={() => setIsVisible(true)}
          onClick={() => setIsVisible(true)}
        />
        <button
          type="button"
          onClick={() => {
            setSearchTerm(localTerm || null)
          }}
          className={clsx("absolute", "right-2.5", "top-2.5")}
        >
          <Search
            size={"1.25rem"}
            className={clsx("pointer-events-none", "text-gray-800")}
          />
        </button>
      </form>
      <div
        className={clsx(
          "absolute",
          "top-10",
          "w-full",
          "transition-opacity",
          !isVisible || works === null
            ? "opacity-0 pointer-events-none"
            : "opacity-100",
          "bg-gray-700",
          "overflow-auto",
          "p-2",
          "rounded-md"
        )}
        style={{ maxHeight: "66vh" }}
      >
        {works !== null ? (
          0 < works.length ? (
            (works || []).map((work) => (
              <p
                key={work.id}
                className={clsx(
                  "truncate",
                  "cursor-pointer",
                  "px-2",
                  "py-1",
                  "hover:bg-gray-600",
                  "transition-colors"
                )}
                onClick={() => setWorkId(work.annictId)}
              >
                {work.title}
              </p>
            ))
          ) : (
            <div
              className={clsx(
                "flex",
                "items-center",
                "justify-center",
                "p-8",
                "text-gray-400",
                "w-full",
                "text-sm"
              )}
            >
              <p>作品が見つかりません</p>
            </div>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
