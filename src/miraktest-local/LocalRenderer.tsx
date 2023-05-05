import clsx from "clsx"
import React, { useEffect, useMemo } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { ContentPlayerPlayingContent, InitPlugin } from "../@types/plugin"
import { DEFAULT_SERVICES } from "../shared/services"
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
        const filledServices = useMemo(
          () => services || DEFAULT_SERVICES,
          [services]
        )
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
              <FileSelector
                services={filledServices}
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
            </div>
          </>
        )
      },
    },
  }
}
