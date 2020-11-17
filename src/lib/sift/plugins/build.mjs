import fg from "fast-glob"
import { mkdir, copyFile } from "fs/promises"
import { dirname } from "path"
import { iter } from "../edit.mjs"
import { current } from "../core.mjs"
import * as project from "../../project.mjs"

/**
 * Plugin that turns globs into files.
 */
export const glob = input => state => {
  return async send => {
    for (const path of iter(current(input).glob)) {
      for await (const path of fg.stream(project.find(path), { dot: true })) {
        send({ file: { path } })
      }
    }
  }
}

export const modules = input => state => {
  if (input.file?.path?.endsWith(".mjs")) {
    const src = input.file.path
    const dest = src.replace(/\/src\//, "/build/")
    console.log(dest)
    return async send => {
      await mkdir(dirname(dest))
      await copyFile(src, dest, fs.constants.COPYFILE_FICLONE)
      send({ file: { path: dest } })
    }
  }
}
