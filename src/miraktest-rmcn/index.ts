import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest RMCN Plugin
 * リモコン用のAPIを生やすプラグイン
 */

const main: InitPlugin = {
  main:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./Main").Main
      : undefined,
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./Renderer").Renderer
      : undefined,
}

export default main
