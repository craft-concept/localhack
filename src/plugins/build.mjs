import fg from "fast-glob"
import chalk from "chalk"
import * as fs from "fs"
import Esbuild from "esbuild"
import { copyFile, mkdir, readFile, writeFile, stat } from "fs/promises"
import { dirname, extname } from "path"
import * as project from "lib/project"
import { current, exists, isNil, iter } from "lib"
import * as markdown from "./markdown"
import * as literate from "./Literate"

const { COPYFILE_FICLONE } = fs.constants

export const isJsPath = path => /\.(mjs|js)x?$/.test(path)

export function bundling(input, state) {
  const { name, dist } = input

  if (!dist) return

  const entryPoints = fg.sync(dist).filter(isJsPath)

  return async send => {
    const { outputFiles, warnings } = await Esbuild.build({
      entryPoints,
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      loader: loaders,
      outExtension: { ".js": ".mjs" },
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
      outdir: project.dist(),
      write: false,
    })

    for (const out of outputFiles) {
      send({
        path: out.path,
        text: out.text,
        persisted: false,
      })
    }
  }
}

export function watching(input, state) {
  return send => {
    state.watcher ??= fs.watch(
      project.src(),
      { recursive: true },
      async (event, relativePath) => {
        if (event !== "change") return
        const path = project.src(relativePath)
        const stats = await stat(path)

        send({ path, watching: true, modifiedAt: stats.mtime.toISOString() })
      },
    )
  }
}

export const indexers = {
  byPath: input => input.path,
}

export const all = [{ indexers }, markdown.all, literate.all]
