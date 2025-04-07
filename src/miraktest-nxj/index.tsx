import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest NXJ Plugin
 * nx-jikkyo からコメントを取得し、コメントレンダラに流し込むプラグイン
 * Impl copied from ../miraktest-nico
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./NicoRenderer").NicoRenderer
      : undefined,
}

export default main
