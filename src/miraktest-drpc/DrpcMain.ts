import { InitPlugin } from "../@types/plugin"
import { wait } from "../shared/utils"
import { DRPC_ACTIVITY_EVENT_ID, DRPC_META } from "./constants"
import { RPC } from "./rpcLoader"

export const DrpcMain: InitPlugin["main"] = async ({ packages }) => {
  let rpc: RPC.Client | undefined
  let isAlive = true
  const clientId = "828277784396824596"
  const loop = async () => {
    while (isAlive) {
      try {
        const _rpc = new RPC.Client({ transport: "ipc" })
        RPC.register(clientId)
        await _rpc.login({ clientId })
        packages.Electron.ipcMain.removeHandler(DRPC_ACTIVITY_EVENT_ID)
        packages.Electron.ipcMain.handle(
          DRPC_ACTIVITY_EVENT_ID,
          (_ev, args) => {
            if (args !== null) {
              _rpc.setActivity(args)
            } else {
              _rpc.clearActivity()
            }
          }
        )

        rpc = _rpc
        await Promise.all([
          wait(1000 * 60),
          new Promise<void>((res) => {
            _rpc.addListener("disconnected", () => {
              console.info(`[${DRPC_META.name}] disconnected`)
              _rpc.removeAllListeners()
              res()
            })
          }),
        ])
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[${DRPC_META.name}] ${error.message}`)
        } else {
          console.error(error)
        }
        packages.Electron.ipcMain.removeHandler(DRPC_ACTIVITY_EVENT_ID)
        packages.Electron.ipcMain.handle(DRPC_ACTIVITY_EVENT_ID, () => {
          return
        })
        await wait(1000 * 60)
      }
    }
  }
  return {
    ...DRPC_META,
    setup: () => {
      loop()
    },
    destroy: () => {
      isAlive = false
      rpc?.destroy()
    },
  }
}
