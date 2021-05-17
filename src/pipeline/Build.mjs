import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import chalk from "chalk"

import Stream from "lib/Stream"
import { iter, Enum } from "lib/Enum"
import Precursor from "lib/Precursor"
import Compile from "lib/Compile"
import File from "lib/File"
import Watch from "lib/Watch"
import System from "lib/System"
import * as Project from "lib/Project"

export default Pipeline.new("Build")
  .def({
    get roots() {
      // Todo: These should instead be provided by project
      return ["src/**/*", "hack.yml", "package.json"]
    },
  })
  .tap(Build => {
    Build.method("watch")
      .batch()
      .performs(_ => {
        return Watch(..._).all()
      })


    Build.method("files")
      .expands(B =>
        B.read()
        .flatMap(Compile.module)
        .write()
        .tap(({ path }) => System.log(chalk.green("   Built:"), path))
      )
    (path) {
      return Stream.fromPromise(File.at(path).read(String))
        .map(source => ({ path, source }))
        .flatMap(Compile.module)
        .tap(this.write)
        .tap(({ path }) => System.log(chalk.green("   Built:"), path))
        .tapErrors(System.report)
    },

  })
  .def({
    watch(...roots) {
      if (!roots.length) roots = this.roots

      return Watch.all(...roots)
        .tap(path => {
          console.log(chalk.yellow("Building:"), path)
        })
        .flatMap(this.file)
    },

    project() {
      return this.all(...this.roots)
    },

    glob(pattern) {
      let paths = fg.stream(Project.root(pattern), {
        dot: true,
        absolute: true,
      })

      return Stream.fromAsync(paths)
    },

    all(...globs) {
      return Stream.iterate(globs)
        .flatMap(this.glob)
        .map(Project.file)
        .flatMap(this.file)
    },

    file(path) {
      return Stream.fromPromise(File.at(path).read(String))
        .map(source => ({ path, source }))
        .flatMap(Compile.module)
        .tap(this.write)
        .tap(({ path }) => System.log(chalk.green("   Built:"), path))
        .tapErrors(System.report)
    },

    async write({ path, compiled }) {
      let buildPath = Project.build(path).replace(/\/Readme(\.[.\w]+)$/, "$1")

      await File.at(buildPath).write(compiled)
      return path
    },
  })
