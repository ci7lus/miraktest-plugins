import { Server } from "net"
import { networkInterfaces } from "os"
import Router from "@koa/router"
import { eventmit } from "eventmit"
import getPort from "get-port"
import Koa from "koa"
import ws from "koa-easy-ws"
import {
  ContentPlayerPlayingContent,
  InitPlugin,
  Service,
} from "../@types/plugin"
import {
  RMCN_GET_PORT,
  RMCN_META,
  RMCN_ON_SET_STATE,
  RMCN_SET_CP_STATE,
  RMCN_SET_SERVICES,
} from "./constants"

export const Main: InitPlugin["main"] = async ({ appInfo, packages }) => {
  let server: Server | null = null
  return {
    ...RMCN_META,
    setup: async () => {
      const port = await getPort({ port: 10171 }) // TODO: Configurable
      packages.Electron.ipcMain.handle(RMCN_GET_PORT, () => {
        let ip = "unknown"
        try {
          const addr = Object.values(networkInterfaces())
            .flat()
            .find((i) => i && i.family === "IPv4" && !i.internal)?.address
          if (addr) {
            ip = addr
          }
        } catch {}
        return `${ip}:${port}`
      })
      type ContentPlayerState = {
        windowId: number
        isPlaying: boolean
        isSeekable: boolean
        playingContent: ContentPlayerPlayingContent | null
        time: number
        volume: number
      }
      let activeWindowId = -1
      const contentPlayerMap = new Map<string, ContentPlayerState>()
      const contentPlayerStateChange = eventmit<ContentPlayerState>()
      packages.Electron.ipcMain.handle(
        RMCN_SET_CP_STATE,
        (
          _,
          state: {
            windowId: number
            isPlaying: boolean
            isSeekable: boolean
            time: number
            playingContent: ContentPlayerPlayingContent | null
            activeWindowId: number | null
            volume: number
          }
        ) => {
          contentPlayerMap.set(state.windowId.toString(), state)
          contentPlayerStateChange.emit(state)
          activeWindowId = state.activeWindowId || -1
        }
      )
      const services = new Map<string, Service>()
      packages.Electron.ipcMain.handle(
        RMCN_SET_SERVICES,
        (_, _services: Service[]) => {
          _services.forEach((service) => {
            services.set(service.id.toString(), service)
          })
        }
      )
      const koa = new Koa()
      koa.use(ws())
      const router = new Router()
      router.use(async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*")
        await next()
      })

      router.options("(.*)", async (ctx) => {
        ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET")
        ctx.set("Access-Control-Allow-Headers", "*")
        ctx.body = ""
        ctx.status = 204
      })

      koa.use(async (ctx, next) => {
        if (ctx.ws) {
          const ws: WebSocket = await ctx.ws()
          const contentPlayerStateChangeHandler = (
            state: ContentPlayerState
          ) => {
            ws.send(JSON.stringify({ type: "stateUpdate", ...state }))
          }
          contentPlayerStateChange.on(contentPlayerStateChangeHandler)
          ws.addEventListener("message", async (msg: MessageEvent) => {
            try {
              const data = JSON.parse(msg.data)
              switch (data.type) {
                case "ping": {
                  ws.send(JSON.stringify({ type: "pong" }))
                  break
                }
                case "init": {
                  packages.Electron.browserWindow.getAllWindows()
                  const initData = {
                    type: "init",
                    version: RMCN_META.version,
                    appVersion: appInfo.version,
                    contentPlayers: Array.from(contentPlayerMap.values()),
                    services: Array.from(services.values()),
                    activeWindowId,
                  }
                  ws.send(JSON.stringify(initData))
                  break
                }
                case "setState": {
                  const { key, value } = data as { key: string; value: unknown }
                  const windowId = parseInt(data.windowId)
                  if (Number.isNaN(windowId)) {
                    break
                  }
                  const window =
                    packages.Electron.browserWindow.fromId(windowId)
                  if (!window) {
                    break
                  }
                  window.webContents.send(RMCN_ON_SET_STATE, { key, value })
                  break
                }
                default: {
                  break
                }
              }
            } catch (error) {
              console.error(error)
            }
          })
          ws.onclose = () => {
            contentPlayerStateChange.off(contentPlayerStateChangeHandler)
          }
        } else {
          await next()
        }
      })
      koa.use(router.routes())
      server = koa.listen(port, () => {
        console.info(
          "RMCN API Server listening on port http://localhost:" + port
        )
      })
    },
    destroy: () => {
      if (server) {
        server.close()
      }
      packages.Electron.ipcMain.removeHandler(RMCN_GET_PORT)
      packages.Electron.ipcMain.removeHandler(RMCN_SET_CP_STATE)
      packages.Electron.ipcMain.removeHandler(RMCN_SET_SERVICES)
    },
  }
}
