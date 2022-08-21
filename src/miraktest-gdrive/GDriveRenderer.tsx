import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useCallback, useEffect, useState } from "react"
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { FileSelector } from "./components/FileSelector"
import {
  GDRIVE_GET_PORT,
  GDRIVE_META,
  GDRIVE_PREFIX,
  GDRIVE_SET_ACCESS_TOKEN,
  GDRIVE_SET_CRED,
  GDRIVE_WINDOW_ID,
} from "./constants"
import { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET } from "./cred"
import { generateRandomString } from "./utils"

const refine = $.withDefault(
  $.object({
    accessToken: $.string(),
    refreshToken: $.string(),
    clientId: $.string(),
    clientSecret: $.string(),
  }),
  {
    accessToken: "",
    refreshToken: "",
    clientId: "",
    clientSecret: "",
  }
)

export const GDriveRenderer: InitPlugin["renderer"] = ({
  appInfo,
  functions,
  atoms,
  rpc,
  constants,
}) => {
  const settingAtom = atom({
    key: `${GDRIVE_PREFIX}.setting`,
    default: {
      accessToken: "",
      refreshToken: "",
      clientId: "",
      clientSecret: "",
    },
    effects: [
      syncEffect({
        storeKey: constants?.recoil?.sharedKey,
        refine,
      }),
      syncEffect({
        storeKey: constants?.recoil?.storedKey,
        refine,
      }),
    ],
  })
  return {
    ...GDRIVE_META,
    exposedAtoms: [],
    sharedAtoms: [
      {
        type: "atom",
        atom: settingAtom,
      },
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
        id: `${GDRIVE_PREFIX}.settings`,
        position: "onSetting",
        label: "Google Drive",
        component: () => {
          const [setting, setSetting] = useRecoilState(settingAtom)
          const [accessToken, setAccessToken] = useState(setting.accessToken)
          const [refreshToken, setRefreshToken] = useState(setting.refreshToken)
          const [clientId, setClientId] = useState(setting.clientId)
          const [clientSecret, setClientSecret] = useState(setting.clientSecret)
          const [port, setPort] = useState(0)
          useEffect(() => {
            setAccessToken(setting.accessToken)
            setRefreshToken(setting.refreshToken)
            setClientId(setting.clientId)
            setClientSecret(setting.clientSecret)
          }, [setting])
          useEffect(() => {
            rpc.invoke(GDRIVE_GET_PORT).then((port) => setPort(port as number))
          }, [])
          const [focusingSensitive, setFocusingSensitive] = useState(false)
          return (
            <>
              <style>{tailwind}</style>
              <div className="p-4">
                <p className="text-lg">Google Drive</p>
                {port && (
                  <>
                    <h3 className={clsx("text-base", "mt-4")}>
                      プロキシのポート
                    </h3>
                    <input
                      type="text"
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      disabled={true}
                      value={port}
                      onClick={(e) => {
                        e.currentTarget.select()
                      }}
                    />
                  </>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      accessToken,
                      refreshToken,
                      clientId,
                      clientSecret,
                    })
                  }}
                >
                  <label className={clsx("block", "mt-4")}>
                    <span>クライアントID</span>
                    <input
                      type="text"
                      placeholder=""
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={clientId || ""}
                      onChange={(e) => setClientId(e.target.value)}
                    />
                  </label>
                  <label className={clsx("block", "mt-4")}>
                    <span>クライアントシークレット</span>
                    <input
                      type={focusingSensitive ? "text" : "password"}
                      placeholder=""
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={clientSecret || ""}
                      onChange={(e) => setClientSecret(e.target.value)}
                      onFocus={() => setFocusingSensitive(true)}
                      onBlur={() => setFocusingSensitive(false)}
                    />
                  </label>
                  <label className={clsx("block", "mt-4")}>
                    <span>アクセストークン</span>
                    <input
                      type={focusingSensitive ? "text" : "password"}
                      placeholder=""
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={accessToken || ""}
                      onChange={(e) => setAccessToken(e.target.value)}
                      onFocus={() => setFocusingSensitive(true)}
                      onBlur={() => setFocusingSensitive(false)}
                    />
                  </label>
                  <label className={clsx("block", "mt-4")}>
                    <span>リフレッシュトークン</span>
                    <input
                      type={focusingSensitive ? "text" : "password"}
                      placeholder=""
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={refreshToken || ""}
                      onChange={(e) => setRefreshToken(e.target.value)}
                      onFocus={() => setFocusingSensitive(true)}
                      onBlur={() => setFocusingSensitive(false)}
                    />
                  </label>
                  <button
                    type="submit"
                    className={clsx(
                      "bg-gray-100",
                      "text-gray-800",
                      "p-2",
                      "px-2",
                      "my-4",
                      "rounded-md",

                      "cursor-pointer",
                      "active:bg-gray-200"
                    )}
                  >
                    更新
                  </button>
                </form>
                <div className="my-4">
                  <button
                    type="button"
                    className={clsx(
                      "p-2",
                      "rounded-md",
                      "bg-gray-200",
                      "text-gray-800",
                      "font-semibold"
                    )}
                    onClick={() => {
                      const url = new URL(
                        "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=$CLIENT_ID&redirect_uri=$REDIRECT_URI&scope=$SCOPE"
                      )
                      const useClientId = clientId || GDRIVE_CLIENT_ID
                      const useClientSecret =
                        clientSecret || GDRIVE_CLIENT_SECRET
                      url.searchParams.set("client_id", useClientId)
                      const redirectUri = `http://127.0.0.1:${port}/oauth2redirect`
                      url.searchParams.set("redirect_uri", redirectUri)
                      url.searchParams.set(
                        "scope",
                        "https://www.googleapis.com/auth/drive.readonly"
                      )
                      const challenge = generateRandomString(10)
                      url.searchParams.set("code_challenge", challenge)
                      url.searchParams.set("code_challenge_method", "plain")
                      rpc.invoke(GDRIVE_SET_CRED, {
                        clientId: useClientId,
                        clientSecret: useClientSecret,
                        challenge,
                        redirectUri,
                      })
                      window.open(url.href, "_blank")
                    }}
                  >
                    Googleアカウントでログイン
                  </button>
                </div>
              </div>
            </>
          )
        },
      },
    ],
    destroy() {
      return
    },
    windows: {
      [GDRIVE_WINDOW_ID]: () => {
        const activeId = useRecoilValue(
          atoms.globalActiveContentPlayerIdSelector
        )
        const setPlayingContent = useSetRecoilState(
          atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
        )
        const services = useRecoilValue(atoms.mirakurunServicesSelector)
        useEffect(() => {
          rpc.setWindowTitle(`Google Drive - ${appInfo.name}`)
        }, [])
        const [isSignedIn, setIsSignedIn] = useState(false)
        const [settings, setSettings] = useRecoilState(settingAtom)
        const [isReady, setIsReady] = useState(false)
        const [accessToken, setAccessToken] = useState(settings.accessToken)
        const [refreshToken, setRefreshToken] = useState(settings.refreshToken)
        const [clientId, setClientId] = useState(settings.clientId)
        const useClientId = clientId || GDRIVE_CLIENT_ID
        const [clientSecret, setClientSecret] = useState(settings.clientSecret)
        const useClientSecret = clientSecret || GDRIVE_CLIENT_SECRET
        useEffect(() => {
          setSettings({ accessToken, refreshToken, clientId, clientSecret })
        }, [accessToken, refreshToken, clientId, clientSecret])
        useEffect(() => {
          setAccessToken(settings.accessToken)
          setRefreshToken(settings.refreshToken)
          setClientId(settings.clientId)
          setClientSecret(settings.clientSecret)
        }, [settings])
        const [sessionError, setSessionError] = useState<string | null>(null)
        const refreshAccessToken = useCallback(async () => {
          if (!refreshToken || !useClientSecret) {
            return
          }
          setSessionError(null)
          const params = new URLSearchParams()
          params.set("client_id", useClientId)
          params.set("client_secret", useClientSecret)
          params.set("grant_type", "refresh_token")
          params.set("refresh_token", refreshToken)
          const result = await fetch("https://oauth2.googleapis.com/token", {
            body: params,
            method: "POST",
          })
          if (result.ok) {
            const data: { access_token: string } = await result.json()
            setAccessToken(data.access_token)
          } else {
            setSessionError(await result.text())
          }
        }, [refreshToken])
        useEffect(() => {
          if (!accessToken.trim()) {
            return
          }
          let timer: NodeJS.Timeout | null = null
          fetch(
            "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" +
              accessToken
          ).then(async (res) => {
            if (res.ok) {
              const data: { expires_in: number } = await res.json()
              setIsSignedIn(true)
              setSessionError(null)
              const renewAt = Date.now() + (data.expires_in - 10) * 1000
              timer = setInterval(async () => {
                if (Date.now() > renewAt) {
                  if (timer) {
                    clearInterval(timer)
                    timer = null
                  }
                  await refreshAccessToken()
                }
              }, 1000)
              rpc.invoke(GDRIVE_SET_ACCESS_TOKEN, accessToken)
            } else {
              setIsSignedIn(false)
              setSessionError(await res.text())
              refreshAccessToken()
            }
          })
          return () => {
            if (timer) {
              clearInterval(timer)
              timer = null
            }
          }
        }, [accessToken])
        const [driveClient, setDriveClient] = useState<
          typeof gapi.client.drive | false
        >(false)
        useEffect(() => {
          const apiScript = document.createElement("script")
          apiScript.src = "https://apis.google.com/js/api.js"
          apiScript.async = true
          apiScript.defer = true
          apiScript.onload = () => {
            gapi.load("client", () => {
              gapi.client.load("drive", "v3", () => {
                setDriveClient(gapi.client.drive)
              })
            })
          }
          document.body.appendChild(apiScript)
          return () => {
            document.body.removeChild(apiScript)
          }
        }, [])
        useEffect(() => {
          if (isSignedIn && accessToken) {
            // @ts-expect-error miss type
            gapi.auth.setToken({ access_token: accessToken })
            setIsReady(true)
          } else {
            setIsReady(false)
          }
        }, [driveClient, isSignedIn, accessToken])
        const [port, setPort] = useState(0)
        useEffect(() => {
          rpc.invoke(GDRIVE_GET_PORT).then((port) => setPort(port as number))
          const off = rpc.onCustomIpcListener(GDRIVE_SET_CRED, (data) => {
            const { access_token, refresh_token } = data as {
              access_token?: string
              refresh_token?: string
            }
            console.info("[gdrive] credential data:", data)
            if (access_token) {
              setAccessToken(access_token)
            }
            if (refresh_token) {
              setRefreshToken(refresh_token)
            }
          })
          return () => {
            off()
          }
        }, [])

        return (
          <>
            <style>{tailwind}</style>
            <div
              className={clsx(
                "w-full",
                "h-screen",
                "bg-gray-100",
                "text-gray-900",
                "flex",
                "leading-loose"
              )}
            >
              {services && port ? (
                isReady && driveClient ? (
                  <FileSelector
                    api={driveClient}
                    services={services}
                    setPlayingContent={setPlayingContent}
                    openContentPlayer={(
                      playingContent: ContentPlayerPlayingContent
                    ) => {
                      return functions.openContentPlayerWindow({
                        playingContent,
                      })
                    }}
                    port={port}
                    accessToken={accessToken}
                  />
                ) : (
                  <div
                    className={clsx(
                      "w-full",
                      "h-full",
                      "flex",
                      "items-center",
                      "justify-center"
                    )}
                  >
                    <div
                      className={clsx("text-gray-600", "px-4", "text-center")}
                    >
                      <button
                        type="button"
                        className={clsx(
                          "p-4",
                          "rounded-md",
                          "bg-gray-200",
                          "font-semibold"
                        )}
                        onClick={() => {
                          const url = new URL(
                            "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=$CLIENT_ID&redirect_uri=$REDIRECT_URI&scope=$SCOPE"
                          )
                          url.searchParams.set("client_id", useClientId)
                          const redirectUri = `http://127.0.0.1:${port}/oauth2redirect`
                          url.searchParams.set("redirect_uri", redirectUri)
                          url.searchParams.set(
                            "scope",
                            "https://www.googleapis.com/auth/drive.readonly"
                          )
                          const challenge = generateRandomString(10)
                          url.searchParams.set("code_challenge", challenge)
                          url.searchParams.set("code_challenge_method", "plain")
                          rpc.invoke(GDRIVE_SET_CRED, {
                            clientId: useClientId,
                            clientSecret: useClientSecret,
                            challenge,
                            redirectUri,
                          })
                          window.open(url.href, "_blank")
                        }}
                      >
                        Googleアカウントでログイン
                      </button>
                      {sessionError && (
                        <p
                          className={clsx(
                            "mt-2",
                            "text-red-600",
                            "font-semibold",
                            "break-words",
                            "font-medium"
                          )}
                        >
                          {sessionError}
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div
                  className={clsx(
                    "w-full",
                    "h-full",
                    "flex",
                    "items-center",
                    "justify-center"
                  )}
                >
                  <div className={clsx("text-gray-600", "px-4", "text-center")}>
                    <p>読み込み中</p>
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
