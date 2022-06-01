import { Presence } from "discord-rpc"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { syncEffect, refine as $ } from "recoil-sync"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { DRPC_PREFIX, DRPC_META, DRPC_ACTIVITY_EVENT_ID } from "./constants"
import { getServiceLogoForPresence } from "./presence"

export const DrpcRenderer: InitPlugin["renderer"] = ({
  appInfo,
  atoms,
  windowId,
  rpc,
  constants,
}) => {
  const isEnabledAtom = atom({
    key: `${DRPC_PREFIX}.isEnabled`,
    default: true,
    effects: [
      syncEffect({
        storeKey: constants.recoil.sharedKey,
        refine: $.boolean(),
      }),
      syncEffect({
        storeKey: constants.recoil.storedKey,
        refine: $.boolean(),
      }),
    ],
  })

  return {
    ...DRPC_META,
    exposedAtoms: [],
    sharedAtoms: [
      {
        type: "atom",
        atom: isEnabledAtom,
        key: isEnabledAtom.key,
      },
    ],
    storedAtoms: [
      {
        type: "atom",
        atom: isEnabledAtom,
        key: isEnabledAtom.key,
      },
    ],
    setup: () => {
      return
    },
    components: [
      {
        id: `${DRPC_PREFIX}.background`,
        position: "onBackground",
        label: DRPC_META.name,
        component: () => {
          const activeWindowId = useRecoilValue(
            atoms.globalActiveContentPlayerIdSelector
          )
          const playingContent = useRecoilValue(
            atoms.contentPlayerPlayingContentAtom
          )
          const isSeekable = useRecoilValue(
            atoms.contentPlayerIsSeekableSelector
          )
          const time = useRecoilValue(atoms.contentPlayerPlayingTimeSelector)
          const [timePer60, setTimePer60] = useState(time)
          useEffect(() => {
            setTimePer60(Math.floor(time / 60_000))
          }, [time])
          const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
          const isEnabled = useRecoilValue(isEnabledAtom)
          useEffect(() => {
            if (
              !isEnabled ||
              activeWindowId === null ||
              (!isPlaying && windowId === activeWindowId)
            ) {
              rpc.invoke(DRPC_ACTIVITY_EVENT_ID, null)
              return
            }
            if (windowId !== activeWindowId || !isPlaying) {
              return
            }
            const service = playingContent?.service
            const program = playingContent?.program
            const version = `${appInfo.name} ${appInfo.version}`
            const logo = service && getServiceLogoForPresence(service)
            const largeImageKey = logo || "miraktest_icon"
            const smallImageKey = logo ? "miraktest_icon" : undefined
            const largeImageText = logo ? service.name : version
            const smallImageText = logo ? version : undefined
            if (program) {
              const programName = `${isSeekable ? "録画：" : ""}${program.name}`
              const shiftedExtended =
                program.extended && Object.values(program.extended).shift()
              const description = program.description?.trim() || shiftedExtended
              const isDisplayDescription =
                logo && description && 2 <= description.length
              const details = isDisplayDescription ? programName : service?.name
              const state =
                isDisplayDescription && description
                  ? 128 < description.length
                    ? description.slice(0, 127) + "…"
                    : description
                  : programName
              let startTimestamp: number
              let endTimestamp: number | undefined = undefined
              if (isSeekable) {
                startTimestamp = Math.ceil((new Date().getTime() - time) / 1000)
              } else {
                startTimestamp = program.startAt / 1000
                if (program.duration !== 1) {
                  endTimestamp = (program.startAt + program.duration) / 1000
                }
              }
              const activity: Presence = {
                largeImageKey,
                largeImageText,
                smallImageKey,
                smallImageText,
                details,
                state,
                startTimestamp,
                endTimestamp,
                instance: false,
              }
              rpc.invoke(DRPC_ACTIVITY_EVENT_ID, activity)
            } else {
              const activity: Presence = {
                largeImageKey,
                largeImageText,
                smallImageKey,
                smallImageText,
                details: service?.name,
                instance: false,
              }
              rpc.invoke(DRPC_ACTIVITY_EVENT_ID, activity)
            }
          }, [
            activeWindowId,
            playingContent,
            isEnabled,
            isSeekable,
            isPlaying,
            timePer60,
          ])
          return <></>
        },
      },
      {
        id: `${DRPC_PREFIX}.settings`,
        position: "onSetting",
        label: DRPC_META.name,
        component: () => {
          const [isEnabled, setIsEnabled] = useRecoilState(isEnabledAtom)
          const [isRichPresenceEnabled, setIsRichPresenceEnabled] =
            useState(isEnabled)
          return (
            <>
              <style>{tailwind}</style>
              <div className="p-4">
                <p className="text-lg">Discord RPC設定</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setIsEnabled(isRichPresenceEnabled)
                  }}
                >
                  <label className="block mt-4">
                    <span>有効</span>
                    <input
                      type="checkbox"
                      className="block mt-2 form-checkbox"
                      checked={isRichPresenceEnabled || false}
                      onChange={() =>
                        setIsRichPresenceEnabled((enabled) => !enabled)
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer active:bg-gray-200"
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
    destroy: () => {
      return
    },
    windows: {},
  }
}
