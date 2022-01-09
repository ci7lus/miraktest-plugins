import clsx from "clsx"
import React, { useEffect, useRef, useState } from "react"
import { RotateCw } from "react-feather"
import {
  AccountVerifyCredentials,
  Search,
  TwitterClient,
} from "twitter-api-client"
import type { Status } from "twitter-d"
import twitterText from "twitter-text"
import { ContentPlayerPlayingContent } from "../../@types/plugin"
import { SayaDefinition, TwitterSetting } from "../types"
import { blobToBase64Uri } from "../utils"

export const TweetComponent: React.FC<{
  setting: Required<Omit<TwitterSetting, "isContentInfoEmbedInImageEnabled">>
  playingContent: ContentPlayerPlayingContent | null
  sayaDefinition: SayaDefinition
  imageUrl: string | null
}> = ({ setting, playingContent, sayaDefinition, imageUrl }) => {
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
  const [images, setImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [failed, setFailed] = useState("")
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
      setServiceTags([])
      return
    }
    const twitterKeywords = sayaDefinition.channels.find((channel) =>
      channel.serviceIds.includes(serviceId)
    )?.twitterKeywords
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
    setImages((images) => [imageUrl, ...images.slice(0, 30)])
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
          "items-center"
        )}
      >
        <h1 className={clsx("text-lg")}>ツイート</h1>
        {failed && (
          <p className={clsx("text-red-400", "font-semibold")}>{failed}</p>
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
                    setHashtag((prev) => `${prev} ${tag}`.trim())
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
              onClick={() => {
                if (!serviceTags || serviceTags.length === 0) {
                  return
                }
                setFailed("")
                setSuggestObtaining(true)
                twitter.tweets
                  .search({
                    q: serviceTags.join(" OR ") + " exclude:retweets",
                    locale: "ja",
                  })
                  .then((tweets: Search | { data: Search }) => {
                    const statuses =
                      "data" in tweets ? tweets.data.statuses : tweets.statuses
                    console.debug(statuses)
                    setSuggestedTags(
                      Array.from(
                        new Set(
                          statuses
                            .filter(
                              (status) => status.entities.hashtags.length <= 5
                            )
                            .map(
                              (status) =>
                                (
                                  status.entities
                                    .hashtags as Status["entities"]["hashtags"]
                                )?.map((hashtag) => "#" + hashtag.text) ?? []
                            )
                            .flat()
                        )
                      ).filter((hashtag) => !serviceTags.includes(hashtag))
                    )
                  })
                  .catch((e) => {
                    console.error(e)
                    setFailed("タグの取得に失敗しました")
                  })
                  .finally(() => {
                    setSuggestObtaining(false)
                  })
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
                <img
                  src={user.profile_image_url_https}
                  className={clsx("h-10")}
                />
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
                  selectedImages.map(async (image) => {
                    const response = await fetch(image)
                    const uri = await blobToBase64Uri(await response.blob())
                    const uploadResult = await twitter.media.mediaUpload({
                      media: uri.split(",")[1],
                    })
                    return uploadResult.media_id_string
                  })
                )
                  .then((mediaIds) => {
                    twitter.tweets
                      .statusesUpdate({
                        status: tweetText,
                        media_ids: mediaIds.join(",") || undefined,
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
                            "ツイートに失敗しました: " + data.message || e.data
                          )
                        } else {
                          setFailed("ツイートに失敗しました")
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
              <div className={clsx("block")}>
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
              "grid-cols-3",
              "gap-2"
            )}
          >
            {images.map((imageUrl) => (
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
                className={clsx("relative")}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
