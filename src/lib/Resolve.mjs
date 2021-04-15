import Config from "lib/Config"
import * as Res from "lib/Resolution"
// import Resolve from "@core/lib/Resolve"

export default class Resolve {
  static *roots() {}

  static *aliased(name) {
    for (const path of Config.paths) {
      yield path.replace("%", name)
    }

    for (const path of Config.paths) {
      yield* aliased(path.replace("%", name))
    }
  }

  static async real(path, parent) {
    return Res.realPathFor(path, parent)
  }
}
