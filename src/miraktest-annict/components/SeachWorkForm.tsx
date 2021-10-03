import clsx from "clsx"
import React, { useEffect, useState } from "react"
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
    if (!searchTerm) {
      setWorks(null)
      return
    }
    const sdk = generateGqlClient(accessToken)
    let isSubscribed = true
    sdk
      .searchWorksByTerm({
        term: searchTerm,
        count: 10,
        since: null,
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
    100,
    [localTerm]
  )

  return (
    <div className={clsx("relative")}>
      <form
        className="flex items-center justify-center space-x-2"
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
          onFocus={() => setIsVisible(true)}
          onClick={() => setIsVisible(true)}
        />
      </form>
      <div
        className={clsx(
          "absolute",
          "top-10",
          "w-full",
          "transition-opacity",
          !isVisible || works === null
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        )}
        onMouseLeave={() => setIsVisible(false)}
      >
        {works !== null ? (
          0 < works.length ? (
            <div
              className={clsx(
                "w-full",
                "bg-gray-700",
                "overflow-auto",
                "p-2",
                "rounded-md"
              )}
            >
              {(works || []).map((work) => (
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
              ))}
            </div>
          ) : (
            <div
              className={clsx(
                "flex",
                "items-center",
                "justify-center",
                "p-8",
                "text-gray-400",
                "bg-gray-700",
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
