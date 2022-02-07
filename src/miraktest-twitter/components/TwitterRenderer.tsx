import Axios from "axios"
import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { atom, useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import YAML from "yaml"
import { InitPlugin } from "../../@types/plugin"
import tailwind from "../../tailwind.scss"
import {
  TWITTER_META,
  TWITTER_PLUGIN_PREFIX,
  TWITTER_TWEET_WINDOW_ID,
} from "../constants"
import { TwitterSetting, SayaDefinition } from "../types"
import { TweetComponent } from "./Tweet"

export const TwitterRenderer: InitPlugin["renderer"] = ({
  appInfo,
  rpc,
  atoms,
  windowId,
}) => {
  const settingAtom = atom<TwitterSetting>({
    key: `${TWITTER_PLUGIN_PREFIX}.setting`,
    default: { isContentInfoEmbedInImageEnabled: false },
  })
  const imageUrlAtom = atom<string | null>({
    key: `${TWITTER_PLUGIN_PREFIX}.imageUrl`,
    default: null,
  })
  const timeAtom = atom<number>({
    key: `${TWITTER_PLUGIN_PREFIX}.time`,
    default: 0,
  })

  return {
    ...TWITTER_META,
    exposedAtoms: [],
    sharedAtoms: [
      {
        type: "atom",
        atom: settingAtom,
      },
      {
        type: "atom",
        atom: imageUrlAtom,
      },
      { type: "atom", atom: timeAtom },
    ],
    storedAtoms: [
      {
        type: "atom",
        atom: settingAtom,
      },
    ],
    setup() {
      return
    },
    components: [
      {
        id: `${TWITTER_PLUGIN_PREFIX}.settings`,
        position: "onSetting",
        label: TWITTER_META.name,
        component: () => {
          const [setting, setSetting] = useRecoilState(settingAtom)
          const [consumerKey, setConsumerKey] = useState(setting.consumerKey)
          const [consumerSecret, setConsumerSecret] = useState(
            setting.consumerSecret
          )
          const [accessToken, setAccessToken] = useState(setting.accessToken)
          const [accessTokenSecret, setAccessTokenSecret] = useState(
            setting.accessTokenSecret
          )
          const [
            isContentInfoEmbedInImageEnabled,
            setIsContentInfoEmbedInImageEnabled,
          ] = useState(setting.isContentInfoEmbedInImageEnabled)
          return (
            <>
              <style>{tailwind}</style>
              <form
                className="m-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSetting({
                    consumerKey: consumerKey || undefined,
                    consumerSecret: consumerSecret || undefined,
                    accessToken: accessToken || undefined,
                    accessTokenSecret: accessTokenSecret || undefined,
                    isContentInfoEmbedInImageEnabled:
                      isContentInfoEmbedInImageEnabled,
                  })
                }}
              >
                <label className="mb-2 block">
                  <span>Twitter 認証情報</span>
                  <input
                    type="text"
                    placeholder="ConsumerKey"
                    className="block mt-2 form-input rounded-md w-full text-gray-900"
                    value={consumerKey || ""}
                    onChange={(e) => setConsumerKey(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="ConsumerSecret"
                    className="block mt-2 form-input rounded-md w-full text-gray-900"
                    value={consumerSecret || ""}
                    onChange={(e) => setConsumerSecret(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="AccessToken"
                    className="block mt-2 form-input rounded-md w-full text-gray-900"
                    value={accessToken || ""}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="AccessTokenSecret"
                    className="block mt-2 form-input rounded-md w-full text-gray-900"
                    value={accessTokenSecret || ""}
                    onChange={(e) => setAccessTokenSecret(e.target.value)}
                  />
                  <label className="block mt-4">
                    <span>画像に番組情報を埋め込む</span>
                    <input
                      type="checkbox"
                      className="block mt-2 form-checkbox"
                      checked={isContentInfoEmbedInImageEnabled || false}
                      onChange={() =>
                        setIsContentInfoEmbedInImageEnabled(
                          (enabled) => !enabled
                        )
                      }
                    />
                  </label>
                </label>
                <button
                  type="submit"
                  className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer"
                >
                  保存
                </button>
              </form>
            </>
          )
        },
      },
      {
        id: `${TWITTER_PLUGIN_PREFIX}.contentplayer`,
        position: "onSplash",
        component: () => {
          const url = useRecoilValue(atoms.contentPlayerScreenshotUrlSelector)
          const setImageUrl = useSetRecoilState(imageUrlAtom)
          const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )
          const setTime = useSetRecoilState(timeAtom)
          const activeId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          useThrottleFn(
            (time: number, activeId: number | null, isSeekable: boolean) => {
              if (windowId === activeId && isSeekable) {
                setTime(time)
              }
            },
            1000,
            [time, activeId, isSeekable]
          )
          useEffect(() => {
            if (!url) {
              return
            }
            setImageUrl(url)
          }, [url])
          return <></>
        },
      },
    ],
    destroy() {
      return
    },
    windows: {
      [TWITTER_TWEET_WINDOW_ID]: () => {
        const setting = useRecoilValue(settingAtom)
        const activeId = useRecoilValue(
          atoms.globalActiveContentPlayerIdSelector
        )
        const playingContent = useRecoilValue(
          atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
        )
        const imageUrl = useRecoilValue(imageUrlAtom)
        useEffect(() => {
          rpc.setWindowTitle(`ツイートする - ${appInfo.name}`)
        }, [])
        const [sayaDefinition, setSayaDefinition] =
          useState<SayaDefinition | null>(null)
        useEffect(() => {
          // TODO: LOAD
          Axios.get<string>(
            "https://raw.githack.com/SlashNephy/saya/dev/docs/definitions.yml",
            {
              responseType: "text",
            }
          )
            .then((r) => {
              const parsed: SayaDefinition = YAML.parse(r.data)
              setSayaDefinition(parsed)
            })
            .catch(console.error)
        }, [])
        const time = useRecoilValue(timeAtom)

        const isCredentialFulfilled =
          setting.consumerKey &&
          setting.consumerSecret &&
          setting.accessToken &&
          setting.accessTokenSecret

        return (
          <>
            <style>{tailwind}</style>
            <div className="w-full h-screen bg-gray-900 text-gray-100 flex leading-loose">
              {setting.consumerKey &&
              setting.consumerSecret &&
              setting.accessToken &&
              setting.accessTokenSecret &&
              sayaDefinition ? (
                <TweetComponent
                  setting={setting as Required<TwitterSetting>}
                  playingContent={playingContent}
                  sayaDefinition={sayaDefinition}
                  imageUrl={imageUrl}
                  time={time}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="px-4 text-center">
                    {isCredentialFulfilled ? (
                      <h1 className="text-lg">読込中です…</h1>
                    ) : (
                      <>
                        <h1 className="text-lg">
                          Twitter の設定が行われていません。
                        </h1>
                        <p>設定から認証情報を設定してください。</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )
      },
    },
  }
}
