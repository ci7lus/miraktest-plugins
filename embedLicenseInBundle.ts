import { promises as fs } from "fs"
import path from "path"

const main = async () => {
  const root = "./dist"
  for await (const f of await fs.opendir(root)) {
    const licensePath = path.join(root, f.name)
    if (!licensePath.endsWith(".licenses.txt")) {
      continue
    }
    const bundlePath = licensePath.replace(".licenses.txt", ".js")
    console.info(`${licensePath} -> ${bundlePath}`)
    const bundle = await fs.readFile(bundlePath, "utf8")
    const license = await fs.readFile(licensePath, "utf8")
    const newBundle = `/*\n${license}\n*/\n${bundle}`
    await fs.writeFile(bundlePath, newBundle)
    await fs.unlink(licensePath)
  }
}
main()
