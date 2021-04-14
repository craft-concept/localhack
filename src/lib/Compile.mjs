import Esbuild from "esbuild"
import { extname } from "path"

import Literate from "lib/Literate"

export default class Compile {
  static *module(source, { path }) {
    const ext = extname(path)

    switch (ext) {
      case ".json":
        yield this.copy(source, { path })
        yield this.json(source, { path })
        return

      case ".yml":
        yield this.copy(source, { path })
        yield this.yml(source, { path })
        return

      case ".mjs":
      case ".js":
        yield this.js(source, { path })
        return

      case ".mjsx":
      case ".jsx":
        yield this.jsx(source, { path })
        return

      case ".ts":
      case ".tsx":
        yield this.ts(source, { path })
        return

      case ".md":
        yield this.copy(source, { path })
        yield* this.md(source, { path })
        return

      case ".html":
      case ".ohm":
        yield this.copy(source, { path })
        return

      default:
        throw new Error(`Cannot compile ${ext}`)
    }
  }

  static async js(source, { path }) {
    const { code } = await Esbuild.transform(source, {
      sourcefile: path,
      target: "node12",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return { path, source, compiled: code }
  }

  static async jsx(source, { path }) {
    const { code } = await Esbuild.transform(source, {
      loader: "jsx",
      sourcefile: path,
      target: "node12",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return { path, source, compiled: code }
  }

  static async ts(source, { path }) {
    const { code } = await Esbuild.transform(source, {
      loader: "ts",
      sourcefile: path,
      target: "node12",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return { path, source, compiled: code }
  }

  static yml(source, { path }) {
    const compiled = `import Yaml from "yaml"

export const path = "${path}"
export const source = ${JSON.stringify(source)}
export default Yaml.parse(source)
`
    return { source, compiled, path: path + ".mjs" }
  }

  static json(source, { path }) {
    const compiled = `export const path = "${path}"
export const source = ${JSON.stringify(source)}
export default JSON.parse(source)
`
    return { source, compiled, path: path + ".mjs" }
  }

  static *md(source, { path }) {
    for (let mod of Literate.tangle(source, { path })) {
      yield* this.module(mod.source, { path: mod.path })
    }
  }

  static copy(source, { path }) {
    return { source, compiled: source, path }
  }
}
