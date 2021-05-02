export function preBindFunctions(desc) {
  if (typeof desc.value != "function") return desc
  let fn = desc.value

  return {
    get() {
      return fn.bind(this)
    },
  }
}

export function def(defs) {
  let descriptors = Object.getOwnPropertyDescriptors(defs)

  for (let name in descriptors) {
    let desc = preBindFunctions(descriptors[name])

    desc.configurable = true
    if ("value" in desc) desc.writable = true
    Object.defineProperty(this, name, desc)
  }

  return this
}

export class Factory {
  static extended() {}

  static get clone() {
    class SubFactory extends this {}

    SubFactory.extended()
    return SubFactory
  }

  static get new() {
    return new this()
  }

  static get named(name) {
    return this.def({ name })
  }

  static static(defs) {
    return def.call(this, defs)
  }

  static def(defs) {
    return def.call(this.prototype, defs)
  }

  /// Instance methods:

  constructor(...args) {
    return this.init(...args)
  }

  init() {}
  tap() {}
}

export default Factory
