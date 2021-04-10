import { Enum } from "lib/Enum"
import { T, match } from "lib/patterns"
import { fnWith } from "lib/fns"
import Yaml from "yaml"

export { T }

export default class Translate {
  static registry = {}

  static register(type, pattern, fn) {
    this.define(type)
    fn = fnWith({ pattern, name: fn.name || `unnamed_${type}` }, fn)

    this.registry[type] ??= []
    this.registry[type].unshift(fn)
  }

  static to(type, item, ...rest) {
    this.registry[type] ??= []

    return Enum.gen(
      function* translations() {
        for (const fn of this.registry[type]) {
          if (match(fn.pattern)(item)) {
            const res = fn(item, ...rest)
            if (res != null) yield res
          }
        }
      }.bind(this),
    )
  }

  static define(name) {
    if (this[name]) return

    this[name] = fnWith({ name }, (item, ...rest) =>
      this.to(name, item, ...rest),
    )
  }
}
