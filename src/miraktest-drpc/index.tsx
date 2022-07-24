import { InitPlugin } from "../@types/plugin"

const main: InitPlugin = {
  main:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./DrpcMain").DrpcMain
      : undefined,
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./DrpcRenderer").DrpcRenderer
      : undefined,
}

export default main
