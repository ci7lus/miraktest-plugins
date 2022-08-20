import { Server } from "net"
import Router from "@koa/router"
import axios from "axios"
import getPort from "get-port"
import Koa from "koa"
import { InitPlugin } from "../@types/plugin"
import { GDRIVE_GET_PORT, GDRIVE_META, GDRIVE_WINDOW_ID } from "./constants"

export const Main: InitPlugin["main"] = async ({ packages, functions }) => {
  let server: Server | null = null
  return {
    ...GDRIVE_META,
    setup: async () => {
      const port = await getPort({ port: 10172 })
      packages.Electron.ipcMain.handle(GDRIVE_GET_PORT, () => port)
      const koa = new Koa()
      const router = new Router()
      router.use(async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*")
        await next()
      })

      router.options("(.*)", async (ctx) => {
        ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET")
        ctx.set("Access-Control-Allow-Headers", "*")
        ctx.set("Access-Control-Request-Private-Network", "true")
        const origin = ctx.header.origin
        if (origin) {
          ctx.set("Access-Control-Allow-Origin", origin)
        }
        ctx.body = ""
        ctx.status = 204
      })
      koa.onerror = (err) => {
        console.error(err, "koa error")
      }
      router.get("/file/:id", async (ctx) => {
        const id = ctx.params.id
        const accessToken = ctx.request.query.access_token
        if (typeof id !== "string" || typeof accessToken !== "string") {
          console.warn("[gdrive] access_token or id missing")
          ctx.status = 400
          return
        }

        const targetUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`
        const cancelToken = axios.CancelToken.source()
        const req = await axios.get(targetUrl, {
          headers: {
            "user-agent": ctx.request.headers["user-agent"],
            accept: "*/*",
            range: ctx.request.headers.range,
            authorization: `Bearer ${accessToken}`,
          },
          validateStatus: () => true,
          responseType: "stream",
          cancelToken: cancelToken.token,
        })
        ctx.onerror = (err) => console.error(err)
        ctx.req.on("error", (err) => console.error(err))
        ctx.body = req.data
        console.info(
          "[gdrive] file proxing:",
          id,
          "/ range:",
          ctx.request.headers.range
        )

        if ((req.status || 400) < 300) {
          ctx.status = req.status || 200
          const contentType = req.headers["content-type"]
          if (contentType) {
            ctx.type = contentType
          }
          for (const [key, value] of Object.entries(req.headers || {})) {
            if (value) {
              ctx.set(key, value as never)
            }
          }
          ctx.req.once("close", () => {
            cancelToken.cancel()
          })
        } else {
          console.info("[gdrive] Request failed!: ", req.status)
          ctx.status = req.status || 500
          ctx.body = ""
          return
        }
      })
      koa.use(router.routes())
      server = koa.listen(port, () => {
        console.info(
          "GDrive Proxy Server listening on port http://localhost:" + port
        )
      })
    },
    destroy: () => {
      if (server) {
        server.close()
      }
      packages.Electron.ipcMain.removeHandler(GDRIVE_GET_PORT)
    },
    appMenu: {
      label: "Google Drive",
      click: () => {
        functions.openWindow({
          name: GDRIVE_WINDOW_ID,
          isSingletone: true,
          args: {
            width: 800,
            height: 600,
          },
        })
      },
    },
    contextMenu: {
      label: "Google Drive",
      click: () => {
        functions.openWindow({
          name: GDRIVE_WINDOW_ID,
          isSingletone: true,
          args: {
            width: 800,
            height: 600,
          },
        })
      },
    },
  }
}
