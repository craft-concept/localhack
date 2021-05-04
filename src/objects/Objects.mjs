import Precursor from "lib/Precursor"

export let Objects = Precursor.clone
  .lazy({
    query(parent) {
      return Object.assign({}, parent)
    },
  })
  .def({
    async execute() {},

    change(fn) {
      // Todo: check mutability before cloning
      return this.clone.tap(fn)
    },

    where(attrs) {
      return this.change(x => x.assignQuery(attrs))
    },

    assignQuery(attrs) {
      for (let k in attrs) this.assignValue(k, attrs[k])
    },

    assignValue(key, value) {
      this.query[key] = value
    },
  })
  .promise(th => th.execute(th))

export default Objects

export class RequiredCallError extends Error {
  constructor(methodName, ...exampleArguments) {
    super()
    this.methodName = methodName
    this.exampleArguments = exampleArguments

    this.message = `Missing required call: ${this.renderExample()}`
  }

  renderExample() {
    let method = this.methodName
    let args = this.exampleArguments.map(JSON.stringify).join(", ")
    return `.${this.methodName}(${args})`
  }
}
