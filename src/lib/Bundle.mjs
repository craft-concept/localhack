import fg from "fast-glob"
import Esbuild from "esbuild"

import * as Project from "lib/Project"
import * as Res from "lib/Resolution"
import Build from "lib/Build"

export default class Bundle {
  static project() {
    return this.all(".hack/build/src/entries/**/*.{mjs,js,ts,jsx,tsx,mjsx}")
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
      plugins: [this.resolvePlugin],
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      outExtension: { ".js": ".mjs" },
      external: [
        "chalk",
        "child_process",
        "commander",
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

  static resolvePlugin = {
    name: "Resolution",
    setup(build) {
      build.onResolve({ filter: /./ }, async args => {
        let path = await Res.realPathFor(args.path, args.resolveDir)
        if (path) {
          return { path }
        } else if (Res.isPackage(args.path)) {
          return { path: args.path, external: true }
        }

        console.log(args.path, "from:", args.resolveDir)
        console.log("  resolved:", path)
      })
    },
  }
}
