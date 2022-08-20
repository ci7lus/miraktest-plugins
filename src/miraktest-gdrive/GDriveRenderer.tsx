import $ from "@recoiljs/refine"
import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { useDebounce, useInterval } from "react-use"
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { FileSelector } from "./components/FileSelector"
import {
  GDRIVE_GET_PORT,
  GDRIVE_META,
  GDRIVE_PREFIX,
  GDRIVE_WINDOW_ID,
} from "./constants"

const refine = $.withDefault($.object({ accessToken: $.string() }), {
  accessToken: "",
})

export const GDriveRenderer: InitPlugin["renderer"] = ({
  appInfo,
  functions,
  atoms,
  rpc,
  constants,
}) => {
  const settingAtom = atom({
    key: `${GDRIVE_PREFIX}.setting`,
    default: { accessToken: "" },
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
          const [port, setPort] = useState(0)
          useEffect(() => {
            rpc.invoke(GDRIVE_GET_PORT).then((port) => setPort(port as number))
          }, [])
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
                    setSetting({ accessToken })
                  }}
                >
                  <label className={clsx("block", "mt-4")}>
                    <span>アクセストークン</span>
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
                      value={accessToken || ""}
                      onChange={(e) => setAccessToken(e.target.value)}
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
        useEffect(() => {
          setAccessToken(settings.accessToken)
        }, [settings])
        const [accessToken, setAccessToken] = useState(settings.accessToken)
        const [isReady, setIsReady] = useState(false)
        useEffect(() => {
          setSettings({ accessToken })
        }, [accessToken])
        const [sessionError, setSessionError] = useState<string | null>(null)
        const [interval, setInterval] = useState(0)
        useInterval(() => setInterval(performance.now()), 1000 * 60)
        useDebounce(
          () => {
            if (!accessToken.trim()) {
              return
            }
            fetch(
              "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" +
                accessToken
            )
              .then(async (res) => {
                if (res.ok) {
                  setIsSignedIn(true)
                  setSessionError(null)
                } else {
                  setIsSignedIn(false)
                  setSessionError(await res.text())
                }
              })
              .catch((err) => {
                console.error(err)
                setIsSignedIn(false)
                setSessionError(err.message)
              })
          },
          500,
          [accessToken, interval]
        )
        const [driveClientIsReady, setDriveClientIsReady] = useState(false)
        useEffect(() => {
          const apiScript = document.createElement("script")
          apiScript.src = "https://apis.google.com/js/api.js"
          apiScript.async = true
          apiScript.defer = true
          apiScript.onload = () => {
            gapi.load("client", () => {
              gapi.client.load("drive", "v3", () => {
                setDriveClientIsReady(true)
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
        }, [driveClientIsReady, isSignedIn])
        const [port, setPort] = useState(0)
        useEffect(() => {
          rpc.invoke(GDRIVE_GET_PORT).then((port) => setPort(port as number))
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
                isReady ? (
                  <FileSelector
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
                        className={clsx("p-4", "rounded-md", "bg-gray-300")}
                        onClick={() => {
                          const clientId =
                            "792055848835-vn9ievkdj8jqnbbt9l6u5obrsgskekvo.apps.googleusercontent.com"
                          const url = new URL(
                            "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&include_granted_scopes=true&client_id=$CLIENT_ID&redirect_uri=$REDIRECT_URI&scope=$SCOPE"
                          )
                          url.searchParams.set("client_id", clientId)
                          url.searchParams.set(
                            "redirect_uri",
                            "https://j6jn8s.csb.app/"
                          )
                          url.searchParams.set(
                            "scope",
                            "https://www.googleapis.com/auth/drive.readonly"
                          )
                          window.open(url.href, "_blank")
                        }}
                      >
                        Googleアカウントでログイン
                      </button>
                      <input
                        type="text"
                        className={clsx(
                          "block",
                          "form-input",
                          "rounded-md",
                          "w-full",
                          "text-gray-900",
                          "mt-4"
                        )}
                        placeholder="access_tokenの値を入力"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        required
                      />
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
