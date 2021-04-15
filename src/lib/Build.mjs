import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import chalk from "chalk"

import { iter } from "lib"
import Compile from "lib/Compile"
import File from "lib/File"
import * as Project from "lib/Project"

export default class Build {
  static project() {
    return this.all("hack.yml", "src/**/*")
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
    let source = await File.at(path).read().then(String)
    let mods = Compile.module(source, { path })

    for (let modP of mods) this.write(await modP)
  }

  static async write({ path, compiled }) {
    let buildPath = Project.build(path).replace(/\/Readme(\.[.\w]+)$/, "$1")

    await File.at(buildPath).write(compiled)
    console.log(`${chalk.green("Wrote")}: ${path}`)
  }
}
