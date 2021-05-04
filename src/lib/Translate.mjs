import Yaml from "yaml"
import Precursor from "lib/Precursor"
import { Enum } from "lib/Enum"
import { T, matchInputs } from "lib/patterns"
import { fnWith } from "lib/fns"

export { T }

export default Precursor.clone
  .lazy({
    registry: () => ({}),
    shapes: () => ({}),
  })
  .def({
    shape(type, pattern) {
      this.define(type)

      this.shapes[type] ??= []
      if (!this.shapes[type].includes(pattern)) this.shapes[type].push(pattern)
      return this
    },

    type(typ) {
      return TranslateType.new(this, typ)
    },

    register(type, pattern, fn) {
      this.define(type)

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

export let TranslateType = Precursor.clone.def({
  init(translate, type) {
    this.assign({ translate, type })
  },

  accept(...inputs) {
    let fn = inputs.pop()
    if (typeof fn != "function")
      throw new Error("Missing fn in: .accept(...inputs, fn)")

    this.translate.add(this.type, inputs, fn)
  },
})
