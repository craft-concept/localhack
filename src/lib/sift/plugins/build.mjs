import fg from "fast-glob"
import * as fs from "fs"
import * as ts from "typescript"
import { mkdir, copyFile } from "fs/promises"
import { dirname } from "path"
import { iter, current } from "../edit.mjs"
import * as project from "../../project.mjs"

const { COPYFILE_FICLONE } = fs.constants
/**
 * Plugin that turns globs into files.
 */
export const glob = input => state => async send => {
  for (const glob of iter(input.glob))
    for await (const path of fg.stream(project.find(glob), { dot: true })) {
      send({ path, via: glob })
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
 * Plugin that compiles typescript files
 */
export const compiler = input => {
  if (!input.path) return
  if (!/\/src\/.*\.m?js$/.test(input.path)) return
}
