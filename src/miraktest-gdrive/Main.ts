import { createHash } from "crypto"
import type { IncomingMessage } from "http"
import { Server } from "net"
import { URLSearchParams } from "url"
import Router from "@koa/router"
import axios from "axios"
import getPort from "get-port"
import Koa from "koa"
import { InitPlugin } from "../@types/plugin"
import {
  GDRIVE_CALC_S256,
  GDRIVE_GET_PORT,
  GDRIVE_META,
  GDRIVE_SET_ACCESS_TOKEN,
  GDRIVE_SET_CRED,
  GDRIVE_WINDOW_ID,
} from "./constants"

type OAuth2Cred = {
  clientId: string
  clientSecret: string
  verifier: string
  redirectUri: string
}

export const Main: InitPlugin["main"] = async ({ packages, functions }) => {
  let server: Server | null = null
  return {
    ...GDRIVE_META,
    setup: async () => {
      const port = await getPort({ port: 10172 })
      let oauth2Cred: OAuth2Cred | null = null
      let oauth2CredSender:
        | Parameters<typeof packages.Electron.browserWindow.fromWebContents>[0]
        | null = null
      packages.Electron.ipcMain.handle(GDRIVE_GET_PORT, () => port)
      packages.Electron.ipcMain.handle(
        GDRIVE_SET_CRED,
        (event, data: OAuth2Cred) => {
          oauth2CredSender = event.sender
          oauth2Cred = data
        }
      )
      packages.Electron.ipcMain.handle(
        GDRIVE_CALC_S256,
        (_, verifier: string) =>
          createHash("sha256")
            .update(verifier, "utf8")
            // base64url 形式 (https://datatracker.ietf.org/doc/html/rfc4648#section-5) でダイジェストを生成
            .digest("base64url")
            // Base64 のパディングを削除
            .replace(/=+$/, "")
      )
      let oauth2AccessToken: string | null = null
      packages.Electron.ipcMain.handle(GDRIVE_SET_ACCESS_TOKEN, (_, token) => {
        oauth2AccessToken = token
      })
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
      router.get("/oauth2redirect", async (ctx) => {
        if (!oauth2Cred || !oauth2CredSender) {
          ctx.status = 500
          ctx.body = "oauth2Cred is null"
          return
        }
        const code = ctx.query.code
        if (typeof code !== "string") {
          ctx.status = 400
          ctx.body = "code is not string"
          return
        }
        const params = new URLSearchParams()
        params.set("code", code)
        params.set("code_verifier", oauth2Cred.verifier)
        params.set("client_id", oauth2Cred.clientId)
        params.set("client_secret", oauth2Cred.clientSecret)
        params.set("redirect_uri", oauth2Cred.redirectUri)
        params.set("grant_type", "authorization_code")
        const req = await axios.post<{
          access_token: string
          refresh_token: string
        }>("https://oauth2.googleapis.com/token", params, {
          validateStatus: () => true,
        })
        if (
          (req.status === 200 && typeof req.data.access_token === "string") ||
          typeof req.data.refresh_token === "string"
        ) {
          oauth2CredSender.send(GDRIVE_SET_CRED, req.data)
          ctx.body = "success"
        } else {
          ctx.body = "maybe failed"
        }
        console.info(req.data)
        ctx.status = 200
      })
      router.get("/file/:id", async (ctx) => {
        const id = ctx.params.id
        if (typeof id !== "string") {
          console.warn("[gdrive] idd missing")
          ctx.status = 400
          return
        }
        if (!oauth2AccessToken) {
          console.warn("[gdrive] oauth2AccessToken is null")
          ctx.status = 500
          return
        }
        const targetUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`
        const cancelToken = axios.CancelToken.source()
        const req = await axios.get<IncomingMessage>(targetUrl, {
          headers: {
            "user-agent": ctx.request.headers["user-agent"],
            accept: "*/*",
            range: ctx.request.headers.range,
            authorization: `Bearer ${oauth2AccessToken}`,
          },
          validateStatus: () => true,
          responseType: "stream",
          cancelToken: cancelToken.token,
        })
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
          req.data.once("close", () => {
            ctx.res.end()
          })
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
      packages.Electron.ipcMain.removeHandler(GDRIVE_SET_CRED)
      packages.Electron.ipcMain.removeHandler(GDRIVE_SET_ACCESS_TOKEN)
      packages.Electron.ipcMain.removeHandler(GDRIVE_CALC_S256)
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
