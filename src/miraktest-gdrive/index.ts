import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest GDrive
 * Google Drive上のファイルを再生するプラグイン
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./GDriveRenderer").GDriveRenderer
      : undefined,
  main:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./Main").Main
      : undefined,
}

export default main
