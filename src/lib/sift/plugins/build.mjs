import fg from "fast-glob"
import ts from "typescript"
import * as fs from "fs"
import { mkdir, copyFile, readFile, writeFile } from "fs/promises"
import { dirname, extname } from "path"
import { iter, current } from "../edit.mjs"
import * as project from "../../project.mjs"

const { COPYFILE_FICLONE } = fs.constants

/**
 * Plugin that turns globs into files.
 */
export const glob = input => state => async send => {
  for (const glob of iter(input.glob))
    for await (const src of fg.stream(project.find(glob), { dot: true })) {
      send({ src, ext: extname(src), from: glob })
    }
}

/**
 * Plugin that copies source files.
 */
export const copy = input => state => {
  const src = input.path

  if (src && /\/src\/.+\.html$/.test(src)) {
    const dest = src.replace(/\/src\//, "/build/")

    return async send => {
      await mkdir(dirname(dest), { recursive: true })
      await copyFile(src, dest, COPYFILE_FICLONE)
      send({ path: dest, copied: true })
    }
  }
}

/**
 * Plugin that reads source files.
 */
export const source = file => state => {
  if (!file.src) return
  if (typeof file.content === "string") return
  file = current(file)

  return async send => {
    const content = await readFile(path).then(String)
    send({ ...file, path, content })
  }
}

export const file = (x = {}) => {
  // x.src ?? (x.src = )
}

/**
 * Plugin that reads source files.
 */
export const output = file => state => {
  if (!file.dst) return
  if (!file.output) return
  const { path } = file

  return async send => {
    const content = await readFile(path).then(String)
    send({ path, content })
  }
}

/**
 * Plugin that compiles typescript files
 */
export const compiler = input => {
  if (!input.path || !input.content || input.compiled) return
  if (!/\/src\/.*\.(mjs|js|ts)$/.test(input.path)) return

  const { path, content } = input

  return state => send => {
    const { outputText } = ts.transpileModule(content, {
      compilerOptions: {
        strictNullChecks: true,
        allowJs: true,
        lib: ["ES2019", "dom", "es2015"],
        target: "es2017",
        module: "es2020",
        moduleResolution: "node",
        jsx: "react",
        jsxFactory: "h",
        plugins: [{ name: "typescript-lit-html-plugin" }],
      },
    })

    send({
      path: path.replace(/\/src\//, "/build/"),
      content,
      compiled: outputText,
    })
  }
}
