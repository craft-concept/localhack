function def(defs) {
  const descriptors = Object.getOwnPropertyDescriptors(defs)

  for (const name in descriptors) {
    const prop = descriptors[name]
    Object.defineProperty(
      this,
      name,
      prop.value
        ? { configurable: true, value: prop.value }
        : { configurable: true, get: prop.get, set: prop.set },
    )
  }

  return this
}

const root = {}

module.exports = def.call(root, {
  def,

  get precursor() {
    return Object.getPrototypeOf(this)
  },

  get clone() {
    return Object.create(this)
  },

  tap(fn) {
    const x = this.clone
    fn.call(x, x)
    return x
  },

  with(props) {
    return this.tap(self => {
      for (const k in props) {
        self[k] = props[k]
      }
    })
  },

  flag(name, props) {
    return this.def({
      get [name]() {
        return this.with(props)
      },
    })
  },

  lazy(defs) {
    for (const name in defs) {
      this.def({
        get [name]() {
          return this.def({ [name]: defs[name].call(this, this) })[name]
        },
      })
    }
    return this
  },

  promise(fn) {
    return this.def({
      then(onRes, onRej) {
        return new Promise(fn.bind(this)).then(onRes, onRej)
      },
      catch(onRej) {
        return this.then(undefined, onRej)
      },
    })
  },
})
