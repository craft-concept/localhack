import { Enum } from "lib/Enum"
import { T, matchInputs } from "lib/patterns"
import { fnWith } from "lib/fns"
import Yaml from "yaml"

export { T }

export default class Translate {
  static registry = {}

  static register(type, pattern, fn) {
    this.define(type)

    if (!fn) return new Translator(type)
    return this.add(type, [pattern], fn)
  }

  static add(type, inputs, fn) {
    fn = fnWith({ inputs, name: fn.name || `unnamed_${type}` }, fn)

    this.registry[type] ??= []
    this.registry[type].unshift(fn)
  }

  static to(type, ...inputs) {
    this.registry[type] ??= []

    return Enum.gen(
      function* translations() {
        for (const fn of this.registry[type]) {
          if (matchInputs(fn, inputs)) {
            const res = fn(...inputs)
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

export class Translator {
  constructor(type) {
    this.type = type
  }

  accepts(...inputs) {
    this._accepts = inputs
    return this
  }

  then(fn) {
    this._fn = fn
    Translate.add(this.type, this._accepts[0], fn)
    return this
  }
}
