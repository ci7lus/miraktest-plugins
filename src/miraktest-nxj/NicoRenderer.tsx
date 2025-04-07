import $ from "@recoiljs/refine"
import axios from "axios"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect } from "recoil-sync"
import YAML from "yaml"
import { NicoSetting } from "./../miraktest-nico/types"
import { NXJStream } from "./streams/NXJStream"
import { InitPlugin } from "../@types/plugin"
import { SayaDefinition, SayaDefinitionChannel } from "../miraktest-saya/types"
import tailwind from "../tailwind.scss"

const _id = "io.github.ci7lus.miraktest-plugins.nxj"
const prefix = "plugins.ci7lus.nxj"
const meta = {
  id: _id,
  name: "nx-jikkyo",
  author: "ci7lus",
  version: "0.0.1",
  description:
    "nx-jikkyoからコメントを取得するプラグインです。対応するコメントレンダラープラグインが必要です。",
  authorUrl: "https://github.com/ci7lus",
  url: "https://github.com/ci7lus/miraktest-plugins/tree/master/src/miraktest-nxj",
}

export const NicoRenderer: InitPlugin["renderer"] = ({ atoms, constants }) => {
  const settingRefine = $.object({
    isLiveEnabled: $.withDefault($.boolean(), true),
    isTimeshiftEnabled: $.withDefault($.boolean(), true),
    mail: $.voidable($.string()),
    pass: $.voidable($.string()),
  })
  const settingAtom = atom<NicoSetting>({
    key: `${prefix}.setting`,
    default: {
      isLiveEnabled: true,
      isTimeshiftEnabled: true,
    },
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

  let isDplayerFound = false
  let isPkrFound = false

  return {
    ...meta,
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
    setup({ plugins }) {
      isDplayerFound = !!plugins.find(
        (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.dplayer"
      )
      isPkrFound = !!plugins.find(
        (plugin) => plugin.id === "io.github.ci7lus.miraktest-plugins.pecore"
      )
    },
    components: [
      {
        id: `${prefix}.onPlayer`,
        position: "onPlayer",
        component: () => {
          // const setting = useRecoilValue(settingAtom)
          const service = useRecoilValue(atoms.contentPlayerServiceSelector)
          const program = useRecoilValue(atoms.contentPlayerProgramSelector)
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )

          const [sayaDefinition, setSayaDefinition] =
            useState<SayaDefinition | null>(null)
          useEffect(() => {
            if (!isPkrFound && !isDplayerFound) {
              console.warn("コメント送信先の取得に失敗しています")
              return
            }
            axios
              .get<string>(
                "https://cdn.jsdelivr.net/gh/SlashNephy/saya-definitions@master/definitions.yml",
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
          const [def, setDef] = useState<SayaDefinitionChannel | null>(null)
          useEffect(() => {
            if (!sayaDefinition) {
              return
            }
            if (!isPkrFound && !isDplayerFound) {
              return
            }
            if (
              isSeekable ||
              (program &&
                program.duration !== 1 &&
                dayjs().isAfter(program?.startAt + program.duration))
            ) {
              console.info("過去番組の再生を検出したためnxjを無効化します")
              setDef(null)
              return
            }
            const chDef = sayaDefinition.channels.find((channel) =>
              channel.serviceIds.includes(service?.serviceId || 0)
            )
            console.info("nxjを有効化します:", chDef)
            setDef((prev) =>
              prev && prev.name === chDef?.name ? prev : chDef || null
            )
          }, [sayaDefinition, service, program, isSeekable])

          return def?.nicojkId ? (
            <NXJStream
              nicojkId={def.nicojkId}
              isPkrFound={isPkrFound}
              isDplayerFound={isDplayerFound}
            />
          ) : (
            <></>
          )
        },
      },
      {
        id: `${prefix}.settings`,
        position: "onSetting",
        label: meta.name,
        component: () => {
          const [setting, setSetting] = useRecoilState(settingAtom)
          const [mail /*, setMail*/] = useState(setting.mail)
          const [pass /*, _setPass*/] = useState(setting.pass)
          const [isLiveEnabled, setIsLiveEnabled] = useState(
            setting.isLiveEnabled
          )
          const [isTimeshiftEnabled /*setIsTimeshiftEnabled*/] = useState(
            setting.isTimeshiftEnabled
          )
          //const [isHidden, setIsHidden] = useState(true)

          return (
            <>
              <style>{tailwind}</style>
              <form
                className="m-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSetting({
                    mail,
                    pass,
                    isLiveEnabled,
                    isTimeshiftEnabled,
                  })
                }}
              >
                <label className={clsx("block", "mt-4")}>
                  <span>nx-jikkyo</span>
                  <input
                    type="checkbox"
                    className={clsx("block", "mt-2", "form-checkbox")}
                    checked={isLiveEnabled || false}
                    onChange={() => setIsLiveEnabled((enabled) => !enabled)}
                  />
                </label>
                {/*<label className={clsx("block", "mt-4")}>
                  <span>タイムシフト有効</span>
                  <input
                    type="checkbox"
                    className={clsx("block", "mt-2", "form-checkbox")}
                    checked={isTimeshiftEnabled || false}
                    onChange={() =>
                      setIsTimeshiftEnabled((enabled) => !enabled)
                    }
                  />
                </label>*/}
                {/*<label className="mt-4 block">
                    <span>モリタポのメールアドレス</span>
                    <input
                      type="text"
                      placeholder="miyou@miyou.tv"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={mail || ""}
                      onChange={(e) => setMail(e.target.value)}
                    />
                  </label>
                  <label className="mt-4 block">
                    <span>モリタポのパスワード</span>
                    <input
                      type={isHidden ? "password" : "text"}
                      placeholder="*****"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={pass || ""}
                      onChange={(e) => setPass(e.target.value)}
                      onFocus={() => setIsHidden(false)}
                      onBlur={() => setIsHidden(true)}
                    />
                    </label>*/}
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
}
