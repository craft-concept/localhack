export function assignFnName(fn, name, namespace) {
  if (typeof fn != "function") return fn
  if (namespace) name = `${namespace}_${name}`
  Object.defineProperty(fn, "name", { value: name })
  return fn
}

export function preBindFunctions(desc, name) {
  if (typeof desc.value != "function") return desc
  let fn = desc.value
  assignFnName(fn, name, this.name)

  return {
    get() {
      return fn.bind(this)
    },
  }
}

export function def(defs) {
  if (typeof defs == "function") defs = defs.prototype

  let descriptors = Object.getOwnPropertyDescriptors(defs)

  for (let name in descriptors) {
    let desc = preBindFunctions.call(this, descriptors[name], name)
    if ("value" in desc) desc.writable = true
    desc.configurable = true
    Object.defineProperty(this, name, desc)
  }

  return this
}

/**
 *
 * Todo:
 * - Make `.immutable` switch that prevents assignments without clone
 * - `.mutate(block)` for mutating
 */
export function Precursor(...args) {
  return this instanceof Precursor
    ? Precursor.new(...args)
    : this.invoke(...args)
}

export default def
  .call(Precursor, {
    name: "Precursor",
    def,

    init(...inputs) {
      return this.assign(...inputs)
    },

    new(...inputs) {
      let clone = this.clone
      let result = clone.init(...inputs)
      return typeof result == "undefined" ? clone : result
    },

    get precursor() {
      return Object.getPrototypeOf(this)
    },

    assign(...props) {
      Object.assign(this, ...props)
      return this
    },

    lazy(defs) {
      for (let name in defs) {
        let derive = defs[name]
        let cached = `_${name}`

        this.def({
          get [name]() {
            if (!this.hasOwnProperty(cached))
              this[cached] = derive.call(this, this[cached])
            return this[cached]
          },
        })
      }

      return this
    },

    setters(desc) {
      for (let name in desc) {
        let key = desc[name]
        if (typeof key == "string") {
          this.def({
            [name](x) {
              return this.assign({ [key]: x })
            },
          })
        } else if (typeof key == "function") {
          this.def({
            [name](...xs) {
              key.apply(this, xs)
              return this
            },
          })
        } else {
          this.def({
            [name](...xs) {
              return this.assign({ [key[0]]: xs })
            },
          })
        }
      }
      return this
    },

    tap(fn) {
      fn.call(this, this)
      return this
    },

    get clone() {
      function other(...args) {
        return this instanceof other ? other.new(...args) : this.invoke(...args)
      }
      delete other.name
      return Object.setPrototypeOf(other, this)
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
  })
  .tap(P => {
    P.def.test?.(({ eq }) => {
      eq(P.def.name, "bound Precursor_def")

      let p = P.clone
        .def({
          x: 5,
        })
        .lazy({
          y() {
            return this.x++
          },
          depth(parentDepth = 0) {
            return parentDepth + 1
          },
        })

      let p2 = p.clone
      let p3 = p2.clone

      eq(p.x, 5)
      eq(p.y, 5)
      eq(p.x, 6)

      eq(p.depth, 1)
      eq(p2.depth, 2)
      eq(p3.depth, 3)
      eq(p3.precursor, p2)
    })
  })
