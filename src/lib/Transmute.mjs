/**
 * A plugin is a class.
 * methods that start with a capital letter are considered transforms.
 */
export class Transmute {
  constructor(ctx = {}) {
    this.plugins = []
    this.ctx = ctx
  }

  add(impl) {
    this.plugins.push(new Plugin(impl))
    return this
  }

  transform(node) {
    return new Transformation(node, this.ctx)
  }
}

// export class Transformation {
//   constructor(node, ctx) {
//     this.node = node
//     this.ctx = ctx
//   }
// }

export class Plugin {
  constructor(impl) {
    this.impl = impl
    this.root = new impl()
  }

  get key() {
    return (this._key ??=
      this.impl.key || this.impl.name || Symbol("Unknown plugin"))
  }

  get methods() {
    return (this._methods ??= Object.keys(this.impl.prototype).filter(
      name => !["constructor"].includes(name),
    ))
  }

  get transforms() {
    return (this._transforms ??= this.methods.filter(name =>
      /^[A-Z]/.test(name),
    ))
  }
}
