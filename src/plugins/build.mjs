import fg from "fast-glob"
import chalk from "chalk"
import * as fs from "fs"
import Esbuild from "esbuild"
import { copyFile, mkdir, readFile, writeFile, stat } from "fs/promises"
import { dirname, extname } from "path"
import * as project from "../lib/project.mjs"
import { current, exists, isNil, iter } from "../lib/edit.mjs"
import * as markdown from "./markdown.mjs"
import * as literate from "./Literate.mjs"

const { COPYFILE_FICLONE } = fs.constants

export const isJsPath = path => /\.(mjs|js)x?$/.test(path)

/**
 * Plugin that turns globs into source files.
 */
export function globbing(input) {
  const globs = input.glob
  if (!globs) return

  return state => async send => {
    for await (const path of fg.stream(project.root(globs), {
      dot: true,
      absolute: true,
    })) {
      send({ path, name: project.file(path), ext: extname(path) })
    }
  }
}

/**
 * Plugin that reads files as text.
 */
export function reading(input) {
  if (input.reading) return
  if (!input.path) return
  if (exists(input.text)) return

  const { path } = input
  input.reading = true

  return state => async send => {
    const text = await readFile(path).then(String)
    send({ path, text, persisted: true, reading: false })
  }
}

/**
 * Plugin that writes text to files.
 */
export function writing(input) {
  if (input.persisted) return
  if (input.virtual) return
  if (!input.path) return
  if (isNil(input.text)) return

  const { path, text } = input
  const mode = text.startsWith("#!") ? 0o755 : 0o644

  return state => async send => {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, text, {
      mode,
    })

    console.log(`${chalk.green("Wrote")}: ${project.file(path)}`)

    send({ path, persisted: true })
  }
}

export function transpiling(input) {
  const { name, path, text } = input

  if (!path) return
  if (!text) return
  if (!/\/src\/.+\.(mjs|js)x?$/.test(path)) return

  const outputPath = path
    .replace(/\.(\w+)$/, ".mjs")
    .replace("/src/", "/.localhack/build/")

  return state => async send => {
    const { code } = await Esbuild.transform(text, {
      sourcefile: name ?? path,
      target: "node12",
    })

    send({
      path: outputPath,
      text: code,
      persisted: false,
    })
  }
}

export function bundling(input) {
  const { name, dist } = input

  if (!dist) return

  const entryPoints = fg.sync(dist).filter(isJsPath)

  return state => async send => {
    const { outputFiles, warnings } = await Esbuild.build({
      entryPoints,
      platform: "node",
      bundle: true,
      target: "node12",
      format: "esm",
      outExtension: { ".js": ".mjs" },
      external: [
        "chalk",
        "electron",
        "esbuild",
        "fast-glob",
        "immer",
        "markdown-it",
        "react",
        "uuid",
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

export function watching(input) {
  return state => send => {
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

export const all = [
  { indexers },
  globbing,
  writing,
  reading,
  transpiling,
  markdown.all,
  literate.all,
]
