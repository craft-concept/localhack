import fg from "fast-glob"
import { plugin } from "../core.mjs"
import { iter } from "../edit.mjs"
import * as project from "../../project"

/**
 * Plugin that finds files
 */
export const files = dispatch =>
  plugin("files", ({ files }) => async state => {
    for (const glob of iter(files?.glob)) {
      for await (const path of fg.stream(project.src(glob), { dot: true })) {
        dispatch({ file: { path } })
      }
    }
  })
