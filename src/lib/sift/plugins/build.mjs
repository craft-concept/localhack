import fg from "fast-glob"
import * as fs from "fs"
import { copyFile, mkdir, readFile, writeFile } from "fs/promises"
import { dirname, extname } from "path"
import ts from "typescript"
import * as project from "../../project.mjs"
import { current, exists, isNil, iter } from "../edit.mjs"

const { COPYFILE_FICLONE } = fs.constants

/**
 * Plugin that turns globs into source files.
 */
export const glob = input => state => async send => {
  if (input.src) return

  for (const glob of iter(input.glob))
    for await (const src of fg.stream(project.find(glob), { dot: true })) {
      send({ glob, src, ext: extname(src) })
    }
}

export const rename = file => {
  if (!file.src) return
  if (file.dst) return

  file.dst = file.src.replace(/\/src\//, "/build/").replace(/\.ts$/, ".mjs")
}

/**
 * Plugin that copies source files.
 */
export const copy = file => state => {
  if (file.copied) return
  if (!file.src) return
  if (!file.dst) return
  if (!/\.html$/.test(file.src)) return

  const { src, dst } = (file = current(file))

  return async send => {
    await mkdir(dirname(dst), { recursive: true })
    await copyFile(src, dst, COPYFILE_FICLONE)
    send({ ...file, dst, copied: true })
  }
}

/**
 * Plugin that reads source files.
 */
export const source = file => state => {
  if (file.reading) return
  if (!file.src) return
  if (exists(file.source)) return

  file.reading = true

  file = current(file)

  return async send => {
    const source = await readFile(file.src).then(String)
    send({ ...file, source })
  }
}

export const file = (x = {}) => {
  // x.src ?? (x.src = )
}

/**
 * Plugin that reads source files.
 */
export const output = file => state => {
  if (file.written) return
  if (!file.dst) return
  if (isNil(file.output)) return

  const { dst, output } = (file = current(file))

  return async send => {
    await mkdir(dirname(dst), { recursive: true })
    await writeFile(dst, output)
    send({ ...file, written: true })
  }
}

/**
 * Plugin that compiles typescript files
 */
export const typescript = file => {
  if (exists(file.output)) return
  if (isNil(file.source)) return
  if (!/\.(mjs|js|ts)$/.test(file.src)) return

  const { source } = (file = current(file))

  return state => send => {
    const { outputText } = ts.transpileModule(source, {
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
      ...file,
      output: outputText,
    })
  }
}

export const all = [glob, rename, copy, source, file, typescript, output]
