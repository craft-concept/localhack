import chalk from "chalk"
import * as fs from "fs"
import Esbuild from "esbuild"
import * as project from "../../project.mjs"
import { current, exists, isNil, iter } from "../edit.mjs"

export function bundle(input) {
  const entries = [...iter(input.entries)].filter(ent =>
    /\.(mjs|js|ts)x?$/.test(ent),
  )
  if (entries.length === 0) return

  return state => send => {
    console.log(`${chalk.green("Building")}: ${entries}`)
    state.entries ??= Esbuild.build({
      entryPoints: entries,
      platform: "node",
      target: "node12",
      // keepNames: true,
      // external: ["electron", "esbuild"],
      outdir: project.build(),
    })
  }
}

export function watchEntries(input) {
  return state => send => {
    state.watcher ??= fs.watch(
      project.src(),
      { recursive: true },
      (event, relativePath) => {
        if (event !== "change") return
        const path = project.src(relativePath)

        send({ path, watched: true })
      },
    )
  }
}

export const all = [bundle, watchEntries]
