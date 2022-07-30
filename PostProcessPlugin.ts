import fs from "fs"
import path from "path"

export default class PostProcessPlugin {
  public readonly name = "PostProcessPlugin"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public apply(compiler: any) {
    compiler.hooks.done.tapAsync(
      this.name,
      async (
        stats: { compilation: { assets: Record<string, {}> } },
        callback: Function
      ) => {
        for (const assetName of Object.keys(stats.compilation.assets)) {
          if (!assetName.endsWith(".licenses.txt")) {
            continue
          }
          const existsAt = path.join(path.resolve("./dist"), assetName)
          if (!fs.existsSync(existsAt)) {
            continue
          }
          const bundlePath = existsAt.replace(".licenses.txt", ".js")
          console.info(`${existsAt} -> ${bundlePath}`)
          const bundle = await fs.promises.readFile(bundlePath, "utf8")
          const license = await fs.promises.readFile(existsAt, "utf8")
          const version = bundle.match(/version: "(\d+\.\d+\.\d+)"/)?.[1]
          const newBundle = `/*! ${assetName.replace(".licenses.txt", "")}${
            version ? ` ${version}` : ""
          } */\n/*!\n${license}\n*/\n${bundle}`
            .replace(
              `import{createRequire as __WEBPACK_EXTERNAL_createRequire}from"module";`,
              "const __WEBPACK_EXTERNAL_createRequire = () => (s) => require(s);"
            )
            .replace(/import\.meta\.url/g, "undefined")
          await fs.promises.writeFile(bundlePath, newBundle)
          await fs.promises.unlink(existsAt)
        }
        callback()
      }
    )
  }
}
