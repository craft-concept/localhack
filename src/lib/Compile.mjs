import Esbuild from "esbuild"
import { extname } from "path"

import Stream from "lib/Stream"
import Precursor from "lib/Precursor"
import Literate from "lib/Literate"

export default Precursor.clone.def({
  module(entry) {
    return Stream.deep(this.rawModule(entry))
  },

  rawModule(entry) {
    let { path, source } = entry
    let ext = extname(path)

    switch (ext) {
      case ".json":
        return [this.copy(entry), this.json(entry)]

      case ".yml":
        return [this.copy(entry), this.yml(entry)]

      case ".mjs":
      case ".js":
        return this.js(entry)

      case ".mjsx":
      case ".jsx":
        return this.jsx(entry)

      case ".ts":
      case ".tsx":
        return this.ts(entry)

      case ".md":
        return [this.copy(entry), this.md(entry)]

      case ".sql":
        return [this.copy(entry), this.sql(entry)]

      case ".html":
      case ".ohm":
        return this.copy(entry)

      default:
        console.warn(`Unknown extension on path '${path}. Copying.`)
        return this.copy(entry)
    }
  },

  copy({ source, path }) {
    return { source, compiled: source, path }
  },

  md(entry) {
    return Literate.tangle(entry).flatMap(this.module)
  },

  async js({ source, path }) {
    let { code, map } = await Esbuild.transform(source, {
      sourcefile: path,
      target: "node12",
      sourcemap: "external",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return [
      { path, source, compiled: code },
      { path: `${path}.map`, compiled: map },
    ]
  },

  async jsx({ source, path }) {
    let { code, map } = await Esbuild.transform(source, {
      loader: "jsx",
      sourcefile: path,
      sourcemap: "external",
      target: "node12",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return [
      { path, source, compiled: code },
      { path: `${path}.map`, compiled: map },
    ]
  },

  async ts({ source, path }) {
    let { code } = await Esbuild.transform(source, {
      loader: "ts",
      sourcefile: path,
      target: "node12",
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    return { path, source, compiled: code }
  },

  yml({ source, path }) {
    let compiled = `import Yaml from "yaml"

export let path = "${path}"
export let source = ${JSON.stringify(source)}
export default Yaml.parse(source)
`
    return { source, compiled, path: path + ".mjs" }
  },

  json({ source, path }) {
    let compiled = `export let path = "${path}"
export let source = ${JSON.stringify(source)}
export default JSON.parse(source)
`
    return { source, compiled, path: path + ".mjs" }
  },

  sql({ source, path }) {
    let compiled = `import Db from "db"

export let path = "${path}"
export let source = ${JSON.stringify(source)}
export default Db.prepare(source)
`
    return { source, compiled, path: path + ".mjs" }
  },
})
