import clsx from "clsx"
import React, { useEffect } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { FileSelector } from "./components/FileSelector"
import { LOCAL_META, Local_RECORDS_WINDOW_ID } from "./constants"

export const LocalRenderer: InitPlugin["renderer"] = ({
  appInfo,
  functions,
  atoms,
  rpc,
}) => {
  return {
    ...LOCAL_META,
    exposedAtoms: [],
    sharedAtoms: [],
    storedAtoms: [],
    setup() {
      return
    },
    components: [],
    destroy() {
      return
    },
    windows: {
      [Local_RECORDS_WINDOW_ID]: () => {
        const activeId = useRecoilValue(
          atoms.globalActiveContentPlayerIdSelector
        )
        const setPlayingContent = useSetRecoilState(
          atoms.globalContentPlayerPlayingContentFamily(activeId ?? 0)
        )
        const services = useRecoilValue(atoms.mirakurunServicesSelector)
        useEffect(() => {
          rpc.setWindowTitle(`ローカル - ${appInfo.name}`)
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
              {services ? (
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
                  requestDialog={rpc.requestDialog}
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
