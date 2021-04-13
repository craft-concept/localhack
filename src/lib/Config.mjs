import { deepAssign } from "lib/edit"
import { matchAll } from "lib/patterns"

import defaults from "hack.yml"

export default class Config {
  static paths = []
  static http = {}

  static merge(config) {
    for (let k in config) {
      switch (k) {
        case "paths":
          this.paths.unshift(...config[k])

        default:
          if (matchAll({}, this[k], config[k])) {
            deepAssign(this[k], config[k])
          } else {
            this[k] = config[k]
          }
      }
    }
  }
}

Config.merge(defaults)
