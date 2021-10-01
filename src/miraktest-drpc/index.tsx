import { Presence } from "discord-rpc"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { getServiceLogoForPresence } from "./presence"
import { RPC } from "./rpcLoader"

const _id = "io.github.ci7lus.miraktest-plugins.discord-rpc"
const prefix = "plugins.ci7lus.discord-rpc"
const meta = {
  id: _id,
  name: "Discord RPC",
  author: "ci7lus",
  version: "0.0.1",
  description: "表示中の番組を Discord に共有します",
}

const activityEventId = `${_id}.setActivity`

const main: InitPlugin = {
  main: async ({ packages }) => {
    let rpc: RPC.Client | undefined
    return {
      ...meta,
      setup: async () => {
        const clientId = "828277784396824596"
        try {
          const _rpc = new RPC.Client({ transport: "ipc" })
          RPC.register(clientId)
          await _rpc.login({ clientId })
          packages.Electron.ipcMain.handle(activityEventId, (_ev, args) => {
            if (args !== null) {
              _rpc.setActivity(args)
            } else {
              _rpc.clearActivity()
            }
          })
          rpc = _rpc
        } catch (error) {
          console.error(error)
        }
      },
      destroy: () => {
        rpc?.destroy()
      },
    }
  },
  renderer: ({ appInfo, packages, atoms }) => {
    const remote = packages.Electron
    const remoteWindow = remote.getCurrentWindow()

    const isEnabledAtom = atom({
      key: `${prefix}.isEnabled`,
      default: true,
    })

    return {
      ...meta,
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
          id: `${prefix}.player`,
          position: "onPlayer",
          label: meta.name,
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
            const isPlaying = useRecoilValue(atoms.contentPlayerIsPlayingAtom)
            const isEnabled = useRecoilValue(isEnabledAtom)
            useEffect(() => {
              if (!isEnabled || !isPlaying) {
                packages.IpcRenderer.invoke(activityEventId, null)
                return
              }
              if (
                remoteWindow.id !== activeWindowId ||
                !playingContent?.service
              ) {
                return
              }
              const service = playingContent.service
              const program = playingContent.program
              const version = `${appInfo.name} ${appInfo.version}`
              const logo = getServiceLogoForPresence(service)
              const largeImageKey = logo || "miraktest_icon"
              const smallImageKey = logo ? "miraktest_icon" : undefined
              const largeImageText = logo ? service.name : version
              const smallImageText = logo ? version : undefined
              if (program) {
                const programName = `${isSeekable ? "録画：" : ""}${
                  program.name
                }`
                const shiftedExtended =
                  program.extended && Object.values(program.extended).shift()
                const description =
                  program.description?.trim() || shiftedExtended
                const isDisplayDescription =
                  logo && description && 2 <= description.length
                const details = isDisplayDescription
                  ? programName
                  : service.name
                const state =
                  isDisplayDescription && description
                    ? 128 < description.length
                      ? description.slice(0, 127) + "…"
                      : description
                    : programName
                let startTimestamp: number
                let endTimestamp: number | undefined = undefined
                if (isSeekable) {
                  startTimestamp = Math.ceil(
                    (new Date().getTime() - time) / 1000
                  )
                } else {
                  startTimestamp = program.startAt / 1000
                  endTimestamp = (program.startAt + program.duration) / 1000
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
                packages.IpcRenderer.invoke(activityEventId, activity)
              } else {
                const activity: Presence = {
                  largeImageKey,
                  largeImageText,
                  smallImageKey,
                  smallImageText,
                  details: service.name,
                  instance: false,
                }
                packages.IpcRenderer.invoke(activityEventId, activity)
              }
            }, [
              activeWindowId,
              playingContent,
              isEnabled,
              isSeekable,
              isPlaying,
            ])
            return <></>
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
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
  },
}

export default main
