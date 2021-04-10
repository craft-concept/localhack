import Compile from "lib/Compile"
import fs from "fs/promises"

export default class Build {
  static async file(path) {
    const source = String(await fs.readFile(path))
    const output = Compile.js(source, { path })
    const outPath = path.replace("/src/", "/.hack/build/")

    await fs.writeFile(outPath, output)
  }
}
