import { promises as fs } from "fs"

export default class EmbedLicenseInBundlePlugin {
  public readonly name = "EmbedLicenseInBundlePlugin"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public apply(compiler: any) {
    compiler.hooks.done.tapAsync(
      this.name,
      async (
        stats: { compilation: { assets: { existsAt: string }[] } },
        callback: Function
      ) => {
        for (const asset of Object.values(stats.compilation.assets)) {
          const { existsAt } = asset
          if (!existsAt.endsWith(".licenses.txt")) {
            continue
          }
          const bundlePath = existsAt.replace(".licenses.txt", ".js")
          console.info(`${existsAt} -> ${bundlePath}`)
          const bundle = await fs.readFile(bundlePath, "utf8")
          const license = await fs.readFile(existsAt, "utf8")
          const newBundle = `/*\n${license}\n*/\n${bundle}`
          await fs.writeFile(bundlePath, newBundle)
          await fs.unlink(existsAt)
        }
        callback()
      }
    )
  }
}
