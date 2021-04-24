import Precursor from "lib/Precursor"
import { Enum } from "lib/Enum"
import { T, matchInputs } from "lib/patterns"
import { fnWith } from "lib/fns"
import Yaml from "yaml"

export { T }

export default Precursor.clone.def({
  registry: {},
  shapes: {},

  shape(type, pattern) {
    this.define(type)

    this.shapes[type] ??= []
    if (!this.shapes[type].includes(pattern)) this.shapes[type].push(pattern)
    return this
  },

  register(type, pattern, fn) {
    this.define(type)

    if (!fn) return new Translator(type)
    return this.add(type, [pattern], fn)
  },

  add(type, inputs, fn) {
    fn = fnWith({ inputs, name: fn.name || `unnamed_${type}` }, fn)

    this.registry[type] ??= []
    this.registry[type].unshift(fn)
    return this
  },

  to(type, ...inputs) {
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
  },

  define(name) {
    if (this[name]) return

    this[name] = fnWith({ name }, (item, ...rest) =>
      this.to(name, item, ...rest),
    )
  },
})

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
