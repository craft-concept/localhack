import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import chalk from "chalk"

import { iter } from "lib"
import Compile from "lib/Compile"
import * as Project from "lib/Project"

export default class Build {
  static project() {
    return this.all("hack.yml", "src/**/*.{yml,html,ts,js,mjs,md,ohm}")
  }

  static async all(...globs) {
    for (let glob of iter(globs)) {
      // Todo: I'd like to create some kind of Pipeline concept here
      let paths = fg.stream(Project.root(glob), {
        dot: true,
        absolute: true,
      })

      let prom = []
      for await (let path of paths) {
        // Todo: This would be a step in the pipeline
        prom.push(this.file(Project.file(path)))
      }

      // Todo: await pipeline.end()
      // This would close the pipeline and wait for all steps to complete
      await Promise.all(prom)
    }
  }

  static async file(path) {
    let source = String(await fs.readFile(Project.root(path)))
    let mods = Compile.module(source, { path })

    for (let modP of mods) {
      const { path, compiled } = await modP
      let buildPath = Project.build(path)

      let mode = compiled.slice(0, 2) == "#!" ? 0o755 : 0o644
      let fullPath = Project.root(buildPath)

      await fs.mkdir(dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, compiled, { mode })
      console.log(`${chalk.green("Wrote")}: ${path}`)
    }
  }
}
