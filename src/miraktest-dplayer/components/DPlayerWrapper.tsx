import React, { memo, useEffect, useRef } from "react"
import { useRefFromState } from "../../shared/utils"
import { DPlayer } from "../dplayerLoader"
import style from "../style.scss"
import { DPlayerCommentPayload } from "../types"

export const DPlayerWrapper: React.VFC<{
  isPlaying: boolean
  comment: DPlayerCommentPayload | null
  opacity: number
  zoom: number
}> = memo(({ isPlaying, comment, opacity, zoom }) => {
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
    if (!player.current) return
    player.current.danmaku.opacity(opacity)
  }, [opacity])

  useEffect(() => {
    const playerRef = player.current
    if (!playerRef) {
      return
    }
    if (isPlaying) {
      playerRef.play()
    } else {
      playerRef.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const playerRef = player.current
    if (!playerRef || !comment || playerRef.video.paused === true) {
      return
    }
    if (comment.source.startsWith("5ch")) {
      setTimeout(() => playerRef.danmaku.draw(comment), comment.timeMs || 0)
    } else {
      playerRef.danmaku.draw(comment)
    }
  }, [comment])

  const isPlayingRef = useRefFromState(isPlaying)

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

    playerInstance.danmaku.opacity(opacity)
    playerInstance.danmaku.show()

    playerInstance.on("pause" as DPlayer.DPlayerEvents.pause, () => {
      isPlayingRef.current && playerInstance.play()
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
      <div style={{ zoom }} ref={dplayerElementRef}></div>
    </>
  )
})
