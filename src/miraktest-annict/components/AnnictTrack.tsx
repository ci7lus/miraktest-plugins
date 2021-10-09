import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { Link } from "react-feather"
import Recoil, { useRecoilState } from "recoil"
import { ContentPlayerPlayingContent } from "../../@types/plugin"
import { AnnictRESTAPI, generateGqlClient } from "../annictAPI"
import {
  RATING_COLOR,
  RATING_LABEL,
  SEASON_LABEL,
  STATUS_LABEL,
} from "../constants"
import { detectProgramInfo } from "../findWork"
import { RatingState, StatusState, WorkFragment } from "../gql"
import { ARM, SayaDefinition } from "../types"
import { SearchWorkForm } from "./SeachWorkForm"

export const AnnictTrack: React.FC<{
  accessToken: string
  playingContent: ContentPlayerPlayingContent | null
  sayaDefinition: SayaDefinition
  arm: ARM[]
  twitterAtom: Recoil.RecoilState<boolean>
  facebookAtom: Recoil.RecoilState<boolean>
}> = ({
  accessToken,
  playingContent,
  sayaDefinition,
  arm,
  twitterAtom,
  facebookAtom,
}) => {
  const [timing, setTiming] = useState(0)
  const [linkedAt, setLinkedAt] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const rest = new AnnictRESTAPI(accessToken)
  const [workId, setWorkId] = useState<number | null>(null)
  const [work, setWork] = useState<WorkFragment | null>(null)
  const [watchStatus, setWatchStatus] = useState<StatusState>(
    work?.viewerStatusState || StatusState.NO_STATE
  )
  const [episodeId, setEpisodeId] = useState<number | null>(null)
  useEffect(() => {
    const service = playingContent?.service
    if (!service) {
      return
    }
    const program = playingContent.program
    const sayaChannel = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(service?.serviceId ?? -1)
    )
    if (!sayaChannel) {
      console.warn("Sayaにチャンネル定義が存在しません")
      return
    }
    setIsLoading(true)

    detectProgramInfo({ rest, channel: sayaChannel, program, arm })
      .then((programInfo) => {
        setIsLoading(false)
        if (!programInfo) {
          setWorkId(null)
          return
        }
        setWorkId(programInfo.annictId)
        if (programInfo.episode?.id) {
          setEpisodeId(programInfo.episode.id)
          setEpisodeInfo(null)
        } else {
          setEpisodeInfo(programInfo.episode)
        }
      })
      .catch((e) => {
        console.error(e)
        setIsLoading(false)
      })
  }, [accessToken, linkedAt, arm])
  const [episodeInfo, setEpisodeInfo] = useState<{
    number: number
    title: string
  } | null>(null)
  useEffect(() => {
    if (!episodeInfo || !work) {
      return
    }
    const found = work.episodes?.nodes?.find(
      (episode) =>
        episode?.number === episodeInfo.number ||
        episode?.numberText?.match(/(\d+)/)?.[1] ==
          episodeInfo.number.toString() ||
        episode?.title === episodeInfo.title
    )
    if (!found) {
      return
    }
    setEpisodeId(found?.annictId)
  }, [episodeInfo, work])
  useEffect(() => {
    if (!workId) {
      setWork(null)
      return
    }
    const sdk = generateGqlClient(accessToken)
    setIsLoading(true)

    sdk
      .Work({ annictId: workId })
      .then((result) => {
        const work = result.searchWorks?.nodes?.[0]
        setWork(work || null)
        if (work) {
          setWatchStatus(work.viewerStatusState ?? StatusState.NO_STATE)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [workId, timing])
  const [isStatusChanging, setIsStatusChanging] = useState(false)
  useEffect(() => {
    if (!work || work.viewerStatusState === watchStatus) {
      return
    }
    const sdk = generateGqlClient(accessToken)
    setIsStatusChanging(true)

    sdk
      .updateWorkStatus({
        workId: work.id,
        state: watchStatus,
      })
      .then(() => {
        setIsStatusChanging(false)
        setWork((prev) =>
          prev ? { ...prev, viewerStatusState: watchStatus } : null
        )
      })
      .catch(() => {
        setWatchStatus(work.viewerStatusState || StatusState.NO_STATE)
      })
  }, [watchStatus])
  const [episode, setEpisode] = useState<{
    id: string
    number?: number | null
    numberText?: string | null
    title?: string | null
  } | null>(null)
  useEffect(() => {
    if (!episodeId || !work) {
      setEpisode(null)
      return
    }
    const episode = work.episodes?.nodes?.find(
      (ep) => ep?.annictId === episodeId
    )
    setEpisode(episode || null)
  }, [episodeId, work])

  const [rating, setRating] = useState<RatingState | null>(null)
  const [comment, setComment] = useState("")
  const [isTwitterEnabled, setIsTwitterEnabled] = useRecoilState(twitterAtom)
  const [isFacebookEnabled, setIsFacebookEnabled] = useRecoilState(facebookAtom)
  useEffect(() => {
    setRating(null)
    setComment("")
  }, [episode])
  const [isRecording, setIsRecording] = useState(false)
  const ratingCount = Object.keys(RATING_LABEL).length

  return (
    <div className={clsx("w-full", "h-screen", "flex", "flex-col")}>
      <div
        className={clsx(
          "w-full",
          "p-4",
          "py-2",
          "bg-gray-800",
          "flex",
          "justify-between",
          "items-center"
        )}
      >
        <h1 className={clsx("text-lg")}>視聴記録</h1>
        <div className={clsx("flex", "items-center", "space-x-2")}>
          <button
            className={clsx(
              "focus:outline-none",
              "rounded-md",
              "bg-gray-900",
              "hover:bg-gray-800",
              "p-1",
              "cursor-pointer",
              "transition-colors"
            )}
            title="番組情報から取得"
            onClick={() => setLinkedAt(performance.now())}
          >
            <Link size={18} />
          </button>
          <SearchWorkForm accessToken={accessToken} setWorkId={setWorkId} />
        </div>
      </div>
      {work ? (
        <div className={clsx("w-full", "flex", "overflow-auto")}>
          <div className={clsx("w-1/3", "flex", "flex-col", "overflow-auto")}>
            <div
              className={clsx("bg-gray-600", "bg-cover", "bg-center")}
              style={{
                aspectRatio: "16/9",
                backgroundImage: work.image?.recommendedImageUrl
                  ? `url("${work.image.recommendedImageUrl}")`
                  : undefined,
              }}
            ></div>
            <div className={clsx("p-2")}>
              <a
                href={`https://annict.com/works/${work.annictId}`}
                target="_blank"
              >
                <h2 title={work.title} className={clsx("text-xl", "truncate")}>
                  {work.title}
                </h2>
              </a>
              <span
                title={work.titleKana || undefined}
                className={clsx("block", "truncate", "pb-1")}
              >
                {work.titleKana}
              </span>
              <select
                className={clsx(
                  "form-select",
                  "mb-2",
                  "block",
                  "w-full",
                  "bg-gray-800",
                  "overflow-hidden"
                )}
                onChange={(e) => {
                  setWatchStatus(e.target.value as never)
                }}
                value={watchStatus}
                disabled={isStatusChanging}
              >
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {work.seasonName ? (
                <div className={clsx("pb-1")}>
                  <span className={clsx("text-gray-400", "text-sm", "block")}>
                    シーズン
                  </span>
                  <p className={clsx("truncate")}>
                    {work.seasonYear}年{SEASON_LABEL[work.seasonName]}
                  </p>
                </div>
              ) : (
                <></>
              )}
              {work.twitterHashtag ? (
                <div className={clsx("pb-1")}>
                  <span className={clsx("text-gray-400", "text-sm", "block")}>
                    ハッシュタグ
                  </span>
                  <a
                    href={`https://twitter.com/hashtag/${encodeURIComponent(
                      work.twitterHashtag
                    )}`}
                    target="_blank"
                    className={clsx("text-blue-400", "truncate")}
                  >
                    #{work.twitterHashtag}
                  </a>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className={clsx("w-2/3", "p-2", "flex", "flex-col")}>
            {episode ? (
              <div
                className={clsx(
                  "w-full",
                  "p-4",
                  "bg-gray-800",
                  "rounded-md",
                  "mb-2"
                )}
              >
                <a
                  href={`https://annict.com/works/${workId}/episodes/${episodeId}`}
                  target="_blank"
                >
                  <h2 className={clsx("text-lg", "pb-1")}>
                    {episode.numberText ?? episode.number} {episode.title}
                  </h2>
                </a>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!episodeId) {
                      return
                    }
                    setIsRecording(true)
                    const sdk = generateGqlClient(accessToken)
                    sdk
                      .createRecord({
                        episodeId: episode.id,
                        comment: comment || null,
                        ratingState: rating,
                        shareTwitter: isTwitterEnabled,
                        shareFacebook: isFacebookEnabled,
                      })
                      .then(() => setTiming(performance.now()))
                      .finally(() => setIsRecording(false))
                  }}
                >
                  <div className={clsx("inline-flex", "pb-1", "text-sm")}>
                    {Object.entries(RATING_LABEL).map(([key, label], idx) => (
                      <button
                        type="button"
                        className={clsx(
                          "px-2",
                          "py-1",
                          "border",
                          "focus:outline-none",
                          "transition-colors",
                          idx === 0 && "rounded-l-md",
                          ratingCount - 1 === idx && "rounded-r-md",
                          rating === key && RATING_COLOR[key]
                        )}
                        onClick={() => {
                          const _key = key as RatingState
                          setRating((prev) => (prev === _key ? null : _key))
                        }}
                        key={key}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={clsx(
                      "form-textarea",
                      "block",
                      "w-full",
                      "rounded-md",
                      "mb-2",
                      "text-gray-900"
                    )}
                    rows={2}
                    placeholder="感想を入力（省略可能）"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <div className="mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={isTwitterEnabled}
                        onChange={() =>
                          setIsTwitterEnabled((enabled) => !enabled)
                        }
                      />
                      <span className="ml-2">Twitter</span>
                    </label>
                    <label className="inline-flex items-center ml-6">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={isFacebookEnabled}
                        onChange={() =>
                          setIsFacebookEnabled((enabled) => !enabled)
                        }
                      />
                      <span className="ml-2">Facebook</span>
                    </label>
                  </div>
                  <div
                    className={clsx(
                      "w-full",
                      "flex",
                      "justify-center",
                      "items-center"
                    )}
                  >
                    <button
                      type="submit"
                      className={clsx(
                        "bg-pink-600",
                        "hover:bg-pink-700",
                        "py-1",
                        "px-4",
                        "rounded-full",
                        "focus:outline-none",
                        "disabled:opacity-50"
                      )}
                      disabled={isRecording}
                    >
                      記録する
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <></>
            )}
            <div className={clsx("w-full", "overflow-auto", "px-2")}>
              {work.episodes?.nodes?.map((episode) => (
                <p
                  onClick={() => {
                    setEpisodeId(episode?.annictId || null)
                  }}
                  key={episode?.annictId}
                  className={clsx(
                    "flex",
                    "justify-between",
                    "cursor-pointer",
                    episode?.viewerDidTrack && "text-gray-600",
                    "hover:text-gray-400",
                    "transition-colors"
                  )}
                >
                  <span className={clsx("truncate")}>
                    {episode?.numberText || episode?.number} {episode?.title}
                  </span>
                  <span>{episode?.viewerRecordsCount}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "w-full",
            "h-full",
            "flex",
            "justify-center",
            "items-center"
          )}
        >
          {isLoading ? "読込中です…" : "対象の作品が見つかりませんでした"}
        </div>
      )}
    </div>
  )
}
