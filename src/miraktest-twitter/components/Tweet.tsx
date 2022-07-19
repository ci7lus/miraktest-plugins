import clsx from "clsx"
import dayjs from "dayjs"
import formatDuration from "format-duration"
import React, { useEffect, useRef, useState } from "react"
import { Info, RotateCw } from "react-feather"
import {
  AccountVerifyCredentials,
  Search,
  TwitterClient,
  UsersShow,
} from "twitter-api-client"
import type { Status } from "twitter-d"
import twitterText from "twitter-text"
import { ContentPlayerPlayingContent } from "../../@types/plugin"
import { TWITTER_MAPPING } from "../constants"
import { embedInfoInImage } from "../embedInfo"
import { imageToCanvas } from "../imageToCanvas"
import { SayaDefinition, TwitterSetting, SayaDefinitionChannel } from "../types"

type ImageDatum = {
  imageUrl: string
  uri: string
  label?: string
}

export const TweetComponent: React.FC<{
  setting: Required<TwitterSetting>
  playingContent: ContentPlayerPlayingContent | null
  sayaDefinition: SayaDefinition
  imageUrl: string | null
  time: number
}> = ({ setting, playingContent, sayaDefinition, imageUrl, time }) => {
  const [text, setText] = useState("")
  const [hashtag, setHashtag] = useState("")
  const [tweetText, setTweetText] = useState("")
  const [remaining, setRemaining] = useState(280)
  const [isValid, setIsValid] = useState(true)
  useEffect(() => {
    const tweetText = [text, hashtag].join(" ").trim()
    setTweetText(tweetText)
    const { valid, weightedLength } = twitterText.parseTweet(tweetText)
    setIsValid(valid)
    setRemaining(280 - weightedLength)
  }, [text, hashtag])
  const [isPosting, setIsPosting] = useState(false)
  const [images, setImages] = useState<ImageDatum[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [failed, setFailed] = useState("")
  const [sayaDef, setSayaDef] = useState<SayaDefinitionChannel | null>(null)
  const [serviceTags, setServiceTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [suggestObtaining, setSuggestObtaining] = useState(false)
  const [user, setUser] = useState<AccountVerifyCredentials | null>(null)

  const twitter = new TwitterClient({
    apiKey: setting.consumerKey,
    apiSecret: setting.consumerSecret,
    accessToken: setting.accessToken,
    accessTokenSecret: setting.accessTokenSecret,
  })

  useEffect(() => {
    twitter.accountsAndUsers
      .accountVerifyCredentials()
      .then(
        (
          user: AccountVerifyCredentials | { data: AccountVerifyCredentials }
        ) => {
          setUser("data" in user ? user.data : user)
        }
      )
      .catch(console.error)
  }, [setting])

  useEffect(() => {
    const serviceId = playingContent?.service?.serviceId
    if (!serviceId) {
      return
    }
    const sayaDef = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(serviceId)
    )
    if (!sayaDef) {
      return
    }
    setSayaDef(sayaDef)
    const { twitterKeywords } = sayaDef
    if (!twitterKeywords) {
      setServiceTags([])
      return
    }
    setServiceTags(twitterKeywords)
  }, [playingContent])

  useEffect(() => {
    if (!imageUrl) {
      return
    }
    imageToCanvas(imageUrl)
      .then((canvas) => {
        if (setting.isContentInfoEmbedInImageEnabled === false) {
          const image = canvas.toDataURL("image/jpeg", 0.9)
          setImages((images) => [
            { imageUrl, uri: image },
            ...images.slice(0, 29),
          ])
        } else {
          const now = dayjs()
          const label = [
            playingContent?.service?.name,
            playingContent?.program?.name,
            playingContent?.program?.startAt
              ? now.isAfter(
                  playingContent.program.startAt +
                    playingContent.program.duration
                )
                ? time !== 0
                  ? formatDuration(time)
                  : null
                : formatDuration(
                    now.diff(playingContent.program.startAt, "millisecond")
                  )
              : null,
          ]
            .filter((s) => s)
            .join(" - ")
          setImages((images) => [
            {
              imageUrl,
              uri: embedInfoInImage(canvas, label),
              label,
            },
            ...images.slice(0, 29),
          ])
        }
      })
      .catch(console.error)
  }, [imageUrl])
  const formRef = useRef<HTMLFormElement>(null)

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
          "items-center",
          "space-x-2"
        )}
      >
        <h1 className={clsx("text-lg", "flex-shrink-0")}>ツイート</h1>
        {failed && (
          <p
            className={clsx("text-red-400", "font-semibold", "truncate")}
            title={failed}
          >
            {failed}
          </p>
        )}
      </div>
      <div className={clsx("w-full", "flex", "overflow-auto")}>
        <div className={clsx("w-full", "p-2", "flex", "flex-col")}>
          <div
            className={clsx(
              "w-full",
              "flex",
              "rounded-md",
              "justify-center",
              "items-center",
              "bg-gray-800"
            )}
          >
            <div
              className={clsx(
                "overflow-auto",
                "flex",
                "space-x-2",
                "justify-start",
                "items-center",
                "flex-nowrap",
                "w-full",
                "px-2"
              )}
              onWheel={(e) => {
                e.currentTarget.scrollLeft += e.deltaY
              }}
            >
              {[...serviceTags, ...suggestedTags].map((tag) => (
                <button
                  type="button"
                  className={clsx(
                    "bg-gray-700",
                    "px-1",
                    "rounded-md",
                    "flex-shrink-0",
                    (hashtag + " ").includes(tag + " ") && "opacity-50"
                  )}
                  key={tag}
                  onClick={() => {
                    setHashtag((prev) => `${prev.trim()} ${tag}`.trim())
                  }}
                  disabled={(hashtag + " ").includes(tag + " ")}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={clsx(
                "p-1",
                "rounded-md",
                "bg-gray-600",
                suggestObtaining && "opacity-50"
              )}
              title="タグを取得する"
              disabled={suggestObtaining}
              onClick={async () => {
                const lowServiceTags = serviceTags.map((tag) =>
                  tag.toLowerCase()
                )
                if (sayaDef && TWITTER_MAPPING[sayaDef.name]) {
                  // 番組情報の公式ツイートからタグを取得する
                  const screenName = TWITTER_MAPPING[sayaDef.name]
                  const user = await twitter.accountsAndUsers
                    .usersShow({
                      screen_name: screenName,
                    })
                    .then((_user: UsersShow | { data: UsersShow }) =>
                      "data" in _user ? _user.data : _user
                    )
                  if (user.status) {
                    const tags =
                      (
                        user.status.entities
                          .hashtags as Status["entities"]["hashtags"]
                      )
                        ?.map((hashtag) => "#" + hashtag.text)
                        .filter(
                          (hashtag) =>
                            !lowServiceTags.includes(hashtag.toLowerCase())
                        ) || []
                    if (0 < tags.length) {
                      setSuggestedTags(tags)
                      return
                    }
                  }
                }

                // ハッシュタグからタグを取得する
                if (!serviceTags || serviceTags.length === 0) {
                  return
                }
                setFailed("")
                setSuggestObtaining(true)
                const statuses = await twitter.tweets
                  .search({
                    q: serviceTags.join(" OR ") + " exclude:retweets",
                    locale: "ja",
                    result_type: "recent",
                    count: 30,
                  })
                  .then((tweets: Search | { data: Search }) =>
                    "data" in tweets ? tweets.data.statuses : tweets.statuses
                  )
                  .catch((e) => {
                    console.error(e)
                    setFailed("タグの取得に失敗しました")
                  })
                  .finally(() => {
                    setSuggestObtaining(false)
                  })
                if (!statuses) {
                  return
                }
                console.debug(statuses)
                const dedupedByUser = Array.from(
                  statuses
                    .reduce((arr, status) => {
                      arr.set(status.user.id_str, status)
                      return arr
                    }, new Map<string, typeof statuses[0]>())
                    .values()
                )
                const sortedHashtags = Object.entries(
                  dedupedByUser
                    .map(
                      (status) =>
                        (
                          status.entities
                            .hashtags as Status["entities"]["hashtags"]
                        )?.map((hashtag) => "#" + hashtag.text) ?? []
                    )
                    .flat()
                    .filter(
                      (hashtag) =>
                        !lowServiceTags.includes(hashtag.toLowerCase())
                    )
                    .reduce((record: Record<string, number>, tag) => {
                      if (tag in record) {
                        record[tag]++
                      } else {
                        record[tag] = 1
                      }
                      return record
                    }, {})
                ).sort((a, b) => b[1] - a[1])
                console.info("タグ候補:", sortedHashtags)
                const hashtags = sortedHashtags.every(([, n]) => n === 1)
                  ? sortedHashtags.map(([tag]) => tag)
                  : sortedHashtags.filter(([, n]) => n > 1).map(([tag]) => tag)
                setSuggestedTags(hashtags)
              }}
            >
              <RotateCw size={18} />
            </button>
          </div>
          <div
            className={clsx(
              "w-full",
              "p-4",
              "bg-gray-800",
              "rounded-md",
              "my-2",
              "transition-height",
              "max-h-screen"
            )}
          >
            {user ? (
              <div
                className={clsx("flex", "space-x-4", "items-center", "mb-2")}
              >
                <img src={user.profile_image_url_https} className="h-10" />
                <p>@{user.screen_name}</p>
              </div>
            ) : (
              <div>認証中...</div>
            )}
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault()
                setIsPosting(true)
                setFailed("")
                Promise.all(
                  selectedImages.map(async (targetImageUrl) => {
                    const media = images
                      .find(({ imageUrl }) => imageUrl === targetImageUrl)
                      ?.uri.split(",")[1]
                    if (!media) {
                      return
                    }
                    const uploadResult = await twitter.media.mediaUpload({
                      media,
                    })
                    return uploadResult.media_id_string
                  })
                )
                  .then((mediaIds) => {
                    const media_ids = mediaIds.filter((s): s is string => !!s)
                    setting.isReplyProhibitEnabled
                      ? twitter.tweetsV2
                          .createTweet({
                            text: tweetText,
                            media:
                              0 < media_ids.length
                                ? {
                                    media_ids,
                                  }
                                : undefined,
                            reply_settings: "mentionedUsers",
                          })
                          .then(() => {
                            setText("")
                            setSelectedImages([])
                          })
                          .catch((e) => {
                            console.error(e)
                            if ("data" in e) {
                              const data = JSON.parse(e.data)
                              setFailed(
                                "失敗しました: " +
                                  (data.detail || data.message || e.data)
                              )
                            } else {
                              setFailed("失敗しました")
                            }
                          })
                          .finally(() => {
                            setIsPosting(false)
                          })
                      : twitter.tweets
                          .statusesUpdate({
                            status: tweetText,
                            media_ids: media_ids.join(",") || undefined,
                          })
                          .then(() => {
                            setText("")
                            setSelectedImages([])
                          })
                          .catch((e) => {
                            console.error(e)
                            if ("data" in e) {
                              const data = JSON.parse(e.data)
                              setFailed(
                                "失敗しました: " +
                                  (data.detail || data.message || e.data)
                              )
                            } else {
                              setFailed("失敗しました")
                            }
                          })
                          .finally(() => {
                            setIsPosting(false)
                          })
                  })
                  .catch((e) => {
                    console.error(e)
                    if ("data" in e) {
                      const data = JSON.parse(e.data)
                      setFailed(
                        "画像のアップロードに失敗しました: " + data.error ||
                          e.data
                      )
                    } else {
                      setFailed("画像のアップロードに失敗しました")
                    }
                    setIsPosting(false)
                  })
              }}
            >
              <div className="block">
                <input
                  type="text"
                  className={clsx(
                    "form-input",
                    "block",
                    "w-full",
                    "rounded-md",
                    "text-gray-900"
                  )}
                  placeholder="ハッシュタグ"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  disabled={isPosting}
                />
              </div>
              <div className={clsx("block", "mt-2")}>
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
                  placeholder="ツイートする内容を入力"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required={selectedImages.length === 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      formRef.current?.requestSubmit()
                    }
                  }}
                  disabled={isPosting}
                ></textarea>
              </div>
              <div className={clsx("flex", "justify-end")}>
                <p className={clsx(!isValid && "text-red-400")}>
                  {remaining.toLocaleString()}
                </p>
              </div>
              <div
                className={clsx(
                  "w-full",
                  "flex",
                  "justify-center",
                  "items-center",
                  "space-x-4"
                )}
              >
                <button
                  type="button"
                  className={clsx(
                    "bg-gray-500",
                    "hover:bg-gray-600",
                    "py-1",
                    "px-4",
                    "rounded-full",
                    "focus:outline-none",
                    "disabled:opacity-50",
                    "mt-2",
                    selectedImages.length === 0 || isPosting
                      ? "opacity-50"
                      : "opacity-100"
                  )}
                  disabled={selectedImages.length === 0 || isPosting}
                  onClick={() => setSelectedImages([])}
                >
                  画像の選択を削除
                </button>
                <button
                  type="submit"
                  className={clsx(
                    "bg-blue-600",
                    "hover:bg-blue-700",
                    "py-1",
                    "px-4",
                    "rounded-full",
                    "focus:outline-none",
                    "disabled:opacity-50",
                    "mt-2",
                    isPosting ? "opacity-50" : "opacity-100"
                  )}
                  disabled={isPosting}
                >
                  ツイート
                </button>
              </div>
            </form>
          </div>

          <div
            className={clsx(
              "w-full",
              "overflow-auto",
              "px-2",
              "grid",
              "grid-cols-2",
              "md:grid-cols-3",
              "gap-2"
            )}
          >
            {images.map(({ imageUrl, uri, label }) => (
              <div
                onClick={() => {
                  setSelectedImages((selectedImages) =>
                    selectedImages.includes(imageUrl)
                      ? selectedImages.filter((image) => image !== imageUrl)
                      : 4 <= selectedImages.length
                      ? selectedImages
                      : [...selectedImages, imageUrl]
                  )
                }}
                key={imageUrl}
                className="relative"
                onContextMenu={(e) => {
                  e.preventDefault()
                  const clickable = document.createElement("a")
                  clickable.download = [
                    label ||
                      [playingContent?.program?.name, time]
                        .filter((s) => s)
                        .join("-") ||
                      "mirak",
                    ".jpg",
                  ].join("")
                  clickable.href = uri
                  clickable.click()
                }}
              >
                <img
                  className={clsx(
                    selectedImages.includes(imageUrl) && "opacity-50"
                  )}
                  src={imageUrl}
                />
                <p
                  className={clsx(
                    "absolute",
                    "left-0",
                    "top-0",
                    "px-2",
                    "text-gray-200"
                  )}
                >
                  {selectedImages.includes(imageUrl)
                    ? selectedImages.indexOf(imageUrl) + 1
                    : ""}
                </p>
                {label && (
                  <p
                    className={clsx(
                      "absolute",
                      "right-0",
                      "bottom-0",
                      "p-2",
                      "text-gray-200"
                    )}
                    title={label}
                  >
                    <Info size="1rem" />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
