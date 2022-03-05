import { InitPlugin } from "../@types/plugin"

/**
 * MirakTest Nico Plugin
 * ニコニコ実況からコメントを取得し、コメントレンダラに流し込むプラグイン
 * Impl copied from ../miraktest-miyou
 */

const main: InitPlugin = {
  renderer:
    typeof window !== "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("./NicoRenderer").NicoRenderer
      : undefined,
}

export default main
