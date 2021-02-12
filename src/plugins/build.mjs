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
export function globbing(input, state) {
  const globs = input.glob
  if (!globs) return

  return async send => {
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
export function reading(input, state) {
  if (input.reading) return
  if (!input.path) return
  if (exists(input.text)) return

  const { path } = input
  input.reading = true

  return async send => {
    const text = await readFile(path).then(String)
    send({ path, text, persisted: true, reading: false })
  }
}

/**
 * Plugin that writes text to files.
 */
export function writing(input, state) {
  if (input.persisted) return
  if (input.virtual) return
  if (!input.path) return
  if (isNil(input.text)) return

  const { path, text } = input
  const mode = text.startsWith("#!") ? 0o755 : 0o644

  return async send => {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, text, {
      mode,
    })

    console.log(`${chalk.green("Wrote")}: ${project.file(path)}`)

    send({ path, persisted: true })
  }
}

export function resolveImports(input, state) {
  const { path, text } = input
  if (!path) return
  if (!text) return

  input.text = text.replaceAll(
    /^(\s*import[^'"]*from\s*['"])([^.]+)(['"])/gm,
    "$1$2$3",
  )
}

export const loaders = {
  ".ohm": "text",
}

export function transpiling(input, state) {
  const { name, path, text } = input

  if (!path) return
  if (!text) return
  if (!/\/src\/.+\.(m?jsx?|ohm)$/.test(path)) return

  const outputPath = path
    .replace("/src/", "/.localhack/build/")
    .replace(/\/Readme\.(\w+)$/, ".$1")

  return async send => {
    const { code } = await Esbuild.transform(text, {
      sourcefile: name ?? path,
      target: "node12",
      loader: loaders[extname(path)],
      // format: outputPath.endsWith(".mjs") ? "esm" : "cjs",
      format: "esm",
    })

    send({
      path: outputPath,
      text: code,
      source: path,
      persisted: false,
    })
  }
}

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
        "markdown-it",
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

export const all = [
  { indexers },
  globbing,
  writing,
  reading,
  transpiling,
  markdown.all,
  literate.all,
]
