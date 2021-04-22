/**
 *
 * Todo:
 * - Make `.immutable` switch that prevents assignments without clone
 * - `.mutate(block)` for mutating
 */
export function def(defs, val) {
  if (typeof defs == "string") defs = { [defs]: val }
  if (typeof defs == "function") defs = defs.prototype

  let descriptors = Object.getOwnPropertyDescriptors(defs)

  for (let name in descriptors) {
    let desc = descriptors[name]
    if ("value" in desc) desc.writable = true
    desc.configurable = true
    Object.defineProperty(this, name, desc)
  }

  return this
}

export let Precursor = {}

export default def
  .call(Precursor, {
    name: "Precursor",
    def,

    get precursor() {
      return Object.getPrototypeOf(this)
    },

    assign(props) {
      Object.assign(this._, props)
      return this
    },

    flag(name, props) {
      return this.def({
        get [name]() {
          return this.assign(props)
        },
      })
    },

    setter(...names) {
      for (let name of names) {
        this.def({
          [name](value) {
            return this.assign({ [name]: value })
          },
        })
      }

      return this
    },

    lazy(defs, val) {
      if (typeof defs == "string") defs = { [defs]: val }

      for (let name in defs) {
        this.def({
          [`_${name}`]: val,
          get [name]() {
            return this.def(name, this[`_${name}`](this))[name]
          },
        })
      }

      return this
    },

    tap(fn) {
      fn.call(this, this)
      return this
    },

    get clone() {
      return Object.create(this)
    },

    with(props) {
      return this.clone.assign(props)
    },

    promise(fn) {
      return this.def({
        then(onRes, onRej) {
          return fn.call(this, this).then(onRes, onRej)
        },

        catch(onRej) {
          return this.then(undefined, onRej)
        },
      })
    },

    test(fn) {
      import("lib/Testing").then(({ test }) => {
        test(this, fn.bind(this, this), 0)
      })
      return this
    },
  })
  .lazy("_", () => ({}))
  .test((P, { eq }) => {
    let p = P.clone
      .lazy("y", t => t.x++)
      .def({
        x: 1,
      })

    eq(p.x, 1)
    eq(p.y, 1)
    eq(p.x, 2)
  })
