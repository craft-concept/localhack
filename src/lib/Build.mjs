import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import Stream from "lib/Stream"

import { iter, Enum } from "lib/Enum"
import Precursor from "lib/Precursor"
import Compile from "lib/Compile"
import File from "lib/File"
import * as Project from "lib/Project"

export default Precursor.clone.def({
  name: "Build",
  project() {
    return this.all("hack.yml", "src/**/*")
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
  },

  async write({ path, compiled }) {
    let buildPath = Project.build(path).replace(/\/Readme(\.[.\w]+)$/, "$1")

    await File.at(buildPath).write(compiled)
    return path
  },
})
