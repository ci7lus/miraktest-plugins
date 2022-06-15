// eslint-disable-next-line import/no-unresolved
import type { DPlayerDanmakuItem } from "dplayer"
import React, { memo, useEffect, useRef } from "react"
import { useRefFromState } from "../../shared/utils"
import { DPLAYER_COMMENT_EVENT } from "../constants"
import { DPlayer } from "../dplayerLoader"
import style from "../style.scss"
import { DPlayerCommentPayload } from "../types"

export const DPlayerWrapper: React.VFC<{
  isPlaying: boolean
  isSeekable: boolean
  opacity: number
  zoom: number
  ng: RegExp[]
}> = memo(({ isPlaying, isSeekable, opacity, zoom, ng }) => {
  const dplayerElementRef = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()

  const danmaku = {
    id: "mirakutest",
    user: "mirakutest",
    api: "",
    bottom: "10%",
    unlimited: true,
  }

  useEffect(() => {
    const playerRef = player.current
    if (!playerRef) {
      return
    }
    if (isPlaying) {
      playerRef.play()
    } else if (isSeekable) {
      playerRef.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const handler = (event: CustomEvent<DPlayerCommentPayload>) => {
      const comment = event.detail
      if (!player.current) {
        return
      }
      if (ng.some((ng) => ng.test(comment.text))) {
        console.debug("ng:", comment.text)
        return
      }
      player.current.danmaku.draw({
        ...comment,
        color: comment.color || "#ffffff",
      } as DPlayerDanmakuItem)
    }
    window.addEventListener(DPLAYER_COMMENT_EVENT, handler as EventListener)
    return () =>
      window.removeEventListener(
        DPLAYER_COMMENT_EVENT,
        handler as EventListener
      )
  }, [ng])

  const isPlayingRef = useRefFromState(isPlaying)
  const isSeekableRef = useRefFromState(isSeekable)

  useEffect(() => {
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
      live: true,
      autoplay: true,
      screenshot: true,
      video: {
        url: "https://user-images.githubusercontent.com/7887955/135782430-ec36baf3-2f12-4629-b89e-0628d1baa91b.mp4",
      },
      danmaku,
      lang: "ja-jp",
      subtitle: {
        type: "webvtt",
        fontSize: "20px",
        color: "#fff",
        bottom: "40px",
        // TODO: Typing correctly
      } as never,
      apiBackend: {
        read: (option) => {
          option.success([{}])
        },
        send: (option, item, callback) => {
          callback()
        },
      },
      contextmenu: [],
      loop: true,
      volume: 0,
      hotkey: false,
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.dplayer = playerInstance

    playerInstance.danmaku.show()

    playerInstance.on("pause" as DPlayer.DPlayerEvents.pause, () => {
      if (isSeekableRef.current === false || isPlayingRef.current === true) {
        playerInstance.play()
      }
    })

    player.current = playerInstance
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.dplayer = playerInstance

    const timer = setInterval(() => {
      playerInstance.video.currentTime = 0
    }, 30 * 1000)
    return () => {
      player.current?.destroy()
      player.current = null
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      <style>{style}</style>
      <div
        style={{ zoom, opacity: opacity.toString() }}
        ref={dplayerElementRef}
      ></div>
    </>
  )
})
