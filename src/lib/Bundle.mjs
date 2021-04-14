import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import chalk from "chalk"

import { iter } from "lib"
import * as Project from "lib/Project"
import Build from "lib/Build"

export default class Bundle {
  static project() {
    return this.all("src/entries/**/*.{mjs,js,ts,jsx,tsx,mjsx}")
  }

  static async all(...globs) {
    globs = globs.map(p => Project.root(p))
    let paths = await fg(globs, { dot: true, absolute: true })

    let prom = []
    for await (let entry of this.entries(paths)) {
      prom.push(Build.write(entry))
    }

    await Promise.all(prom)
  }

  static async *entries(entryPoints) {
    const { outputFiles, warnings } = await Esbuild.build({
      entryPoints,
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      outExtension: { ".js": ".mjs", ".jsx": ".mjs" },
      external: [
        "chalk",
        "electron",
        "esbuild",
        "fast-glob",
        "immer",
        "@textlint/markdown-to-ast",
        "react",
        "uuid",
        "vscode",
        "yaml",
      ],
      outdir: Project.dist(),
      write: false,
    })

    for (const out of outputFiles) {
      yield {
        path: out.path,
        compiled: out.text,
      }
    }
  }
}
