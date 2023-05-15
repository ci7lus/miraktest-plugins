import $ from "@recoiljs/refine"
import axios from "axios"
import rax from "axios-retry"
import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import { GyazoSetting } from "./types"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"

const _id = "io.github.ci7lus.miraktest-plugins.gyazo"
const prefix = "plugins.ci7lus.gyazo"
const meta = {
  id: _id,
  name: "Gyazo",
  author: "ci7lus",
  version: "0.1.5",
  description: "スクリーンショットをGyazoにアップロードするプラグインです。",
  authorUrl: "https://github.com/ci7lus",
  url: "https://github.com/ci7lus/miraktest-plugins/tree/master/src/miraktest-gyazo",
}

rax(axios, {
  retryDelay: () => 1000,
  retryCondition: (res) => res.isAxiosError,
})

const main: InitPlugin = {
  renderer: ({ atoms, constants }) => {
    const settingRefine = $.object({
      token: $.voidable($.string()),
      collectionId: $.voidable($.string()),
    })
    const settingAtom = atom<GyazoSetting>({
      key: `${prefix}.setting`,
      default: {},
      effects: [
        syncEffect({
          storeKey: constants?.recoil?.sharedKey,
          refine: settingRefine,
        }),
        syncEffect({
          storeKey: constants?.recoil?.storedKey,
          refine: settingRefine,
        }),
      ],
    })
    const ssA = atom<string>({
      key: `${prefix}.objurl`,
      default: "",
      effects: [
        syncEffect({
          storeKey: constants?.recoil?.sharedKey,
          refine: $.string(),
        }),
      ],
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
        {
          type: "atom",
          atom: ssA,
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
          id: `${prefix}.uploader`,
          position: "onBackground",
          component: () => {
            const setting = useRecoilValue(settingAtom)
            const playingContent = useRecoilValue(
              atoms.contentPlayerPlayingContentAtom
            )
            const url = useRecoilValue(atoms.contentPlayerScreenshotUrlSelector)
            useEffect(() => {
              const token = setting.token
              if (!token || !url) {
                return
              }
              ;(async () => {
                const bin = await fetch(url)
                const form = new FormData()
                form.append("access_token", token)
                const title = playingContent?.program?.name
                if (title) {
                  form.append("desc", title)
                }
                const desc = playingContent?.service?.name
                if (desc) {
                  form.append("title", desc)
                }
                const blob = await bin.blob()
                form.append("imagedata", blob, url.split("/").pop())
                if (setting.collectionId) {
                  form.append("collection_id", setting.collectionId)
                }
                axios
                  .post("https://upload.gyazo.com/api/upload", form)
                  .catch((e) => console.error(e))
              })()
            }, [url])
            return <></>
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [setting, setSetting] = useRecoilState(settingAtom)
            const [token, setToken] = useState(setting.token)
            const [collectionId, setCollectionId] = useState(
              setting.collectionId
            )
            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      token: token || undefined,
                      collectionId: collectionId || undefined,
                    })
                  }}
                >
                  <label className={clsx("mb-2", "block")}>
                    <span>Gyazo Access Token</span>
                    <input
                      type="text"
                      placeholder="****"
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={token || ""}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </label>
                  <label className={clsx("mb-2", "block")}>
                    <span>Collection Id</span>
                    <input
                      type="text"
                      placeholder="****"
                      className={clsx(
                        "block",
                        "mt-2",
                        "form-input",
                        "rounded-md",
                        "w-full",
                        "text-gray-900"
                      )}
                      value={collectionId || ""}
                      onChange={(e) => setCollectionId(e.target.value)}
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

                      "cursor-pointer"
                    )}
                  >
                    保存
                  </button>
                </form>
              </>
            )
          },
        },
      ],
      destroy() {
        return
      },
      windows: {},
    }
  },
}

export default main
