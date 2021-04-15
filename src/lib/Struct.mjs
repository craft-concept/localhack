export class RequiredPropError extends Error {
  constructor(prop, name) {
    super(`'${prop}' is a required property of a ${name}.`)
  }
}

export default class Struct {
  static required = []

  static defaults() {
    return {}
  }

  constructor(props) {
    for (let prop of this.constructor.required) {
      if (!(prop in props))
        throw new RequiredPropError(prop, this.constructor.name)
    }

    Object.assign(this, this.constructor.defaults(), props)
  }
}
