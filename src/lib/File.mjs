import fs from "fs"
import fp from "fs/promises"
import { dirname } from "path"

import Struct from "lib/Struct"
import * as Project from "lib/Project"

export default class File extends Struct {
  static required = ["path"]

  static at(path) {
    return new this({ path })
  }

  get absolutePath() {
    return (this._absolutePath ??= Project.root(this.path))
  }

  get dir() {
    return (this._dir ??= dirname(this.absolutePath))
  }

  stream() {
    return fs.createReadStream(this.absolutePath)
  }

  async mkdir() {
    return fp.mkdir(this.dir, { recursive: true })
  }

  async read(map = x => x) {
    return fp.readFile(this.absolutePath).then(map)
  }

  async write(data) {
    // Hack: this does not belong here
    this.mode ??= String(data.slice(0, 2)) == "#!" ? 0o755 : 0o644

    await this.mkdir()
    return fp.writeFile(this.absolutePath, data, { mode: this.mode })
  }

  async append(data) {
    await this.mkdir()
    return fp.appendFile(this.path, data)
  }
}
