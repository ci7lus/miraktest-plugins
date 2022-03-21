import axios from "axios"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import YAML from "yaml"
import { InitPlugin } from "../@types/plugin"
import { SayaDefinition } from "../miraktest-saya/types"
import tailwind from "../tailwind.scss"
import { KakologStream } from "./streams/Kakolog"
import { NicoLiveList } from "./streams/NicoLiveList"
import { NicoSetting } from "./types"

const _id = "io.github.ci7lus.miraktest-plugins.nico"
const prefix = "plugins.ci7lus.nico"
const meta = {
  id: _id,
  name: "ニコニコ実況",
  author: "ci7lus",
  version: "0.2.2",
  description:
    "ニコニコ実況からコメントを取得するプラグインです。対応するコメントレンダラープラグインが必要です。",
  authorUrl: "https://github.com/ci7lus",
  url: "https://github.com/ci7lus/miraktest-plugins/tree/master/src/miraktest-nico",
}

export const NicoRenderer: InitPlugin["renderer"] = ({ atoms }) => {
  const settingAtom = atom<NicoSetting>({
    key: `${prefix}.setting`,
    default: {
      isLiveEnabled: true,
      isTimeshiftEnabled: true,
    },
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
          const setting = useRecoilValue(settingAtom)
          const service = useRecoilValue(atoms.contentPlayerServiceSelector)
          const program = useRecoilValue(atoms.contentPlayerProgramSelector)
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )
          const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)

          const [sayaDefinition, setSayaDefinition] =
            useState<SayaDefinition | null>(null)
          useEffect(() => {
            if (!isPkrFound && !isDplayerFound) {
              console.warn("コメント送信先の取得に失敗しています")
              return
            }
            axios
              .get<string>(
                "https://cdn.jsdelivr.net/gh/SlashNephy/saya@dev/docs/definitions.yml",
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

          return (
            <>
              {setting.isLiveEnabled && sayaDefinition && (
                <NicoLiveList
                  sayaDefinition={sayaDefinition}
                  service={service}
                  program={program}
                  setting={setting}
                  isSeekable={isSeekable}
                  isDplayerFound={isDplayerFound}
                  isPkrFound={isPkrFound}
                />
              )}
              {setting.isTimeshiftEnabled && sayaDefinition && (
                <KakologStream
                  sayaDefinition={sayaDefinition}
                  service={service}
                  program={program}
                  isSeekable={isSeekable}
                  time={time}
                  setting={setting}
                  isDplayerFound={isDplayerFound}
                  isPkrFound={isPkrFound}
                />
              )}
            </>
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
          const [isTimeshiftEnabled, setIsTimeshiftEnabled] = useState(
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
                <label className="block mt-4">
                  <span>ニコニコ実況</span>
                  <input
                    type="checkbox"
                    className="block mt-2 form-checkbox"
                    checked={isLiveEnabled || false}
                    onChange={() => setIsLiveEnabled((enabled) => !enabled)}
                  />
                </label>
                <label className="block mt-4">
                  <span>タイムシフト有効</span>
                  <input
                    type="checkbox"
                    className="block mt-2 form-checkbox"
                    checked={isTimeshiftEnabled || false}
                    onChange={() =>
                      setIsTimeshiftEnabled((enabled) => !enabled)
                    }
                  />
                </label>
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
                  className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer"
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
