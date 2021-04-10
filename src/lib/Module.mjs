export default class Module {
  static *namedExports(mod) {
    for (const k in mod) {
      if (k != "default") yield [k, mod[k]]
    }
  }

  static async fromString(source) {
    return import(this.asDataUri(source))
  }

  static asDataUri(source) {
    const prefix = "data:text/javascript;charset=utf-8,"
    return prefix + source
  }
}
