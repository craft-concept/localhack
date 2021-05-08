import { fnWith } from "lib/fns"
import { T, match } from "lib/patterns"

export { T }

export class MissingPatternError extends Error {
  constructor(name, this_, args) {
    super(
      `Missing pattern for ${name}.call(${this_}, ${args
        .map(JSON.stringify)
        .join(", ")})`,
    )
    this.name = name
    this.this = this_
    this.args = args
  }
}

export default function Dyn(name) {
  function self(...args) {
    return self.invoke.apply(self, args)
  }

  return fnWith(
    {
      this: T.Any,
      name,
      patterns: [],

      invoke(...args) {
        for (let x of self.all.apply(this, args)) return x
        throw new MissingPatternError(self.name, this, args)
      },

      *all(...args) {
        for (let fn of self.patterns) {
          if (match(fn.this)(this) && match(fn.inputs)(args))
            yield fn.apply(this, args)
        }
      },

      withThis(thisShape) {
        self.this = thisShape
        return self
      },

      withoutThis() {
        self.this = T.Any
        return self
      },

      accept(...inputs) {
        let fn = inputs.pop()
        self.patterns.unshift(fnWith({ this: self.this, inputs }, fn))
        return self
      },

      fallback(...inputs) {
        let fn = inputs.pop()
        self.patterns.push(fnWith({ this: self.this, inputs }, fn))
        return self
      },
    },
    self,
  )
}

Dyn.test?.(({ eq, throws }) => {
  let inspect = Dyn("inspect")
    .accept(String, str => `str: ${str}`)
    .accept(Number, num => `num: ${num}`)

  eq(inspect("hello"), "str: hello")
  eq(inspect(10), "num: 10")

  throws(MissingPatternError, () => {
    inspect({ break: "me" })
  })

  inspect.fallback(T.Any, x => `any: ${JSON.stringify(x)}`)

  eq(inspect(1), "num: 1")
  eq(inspect({}), "any: {}")
  eq([...inspect.all(1)], ["num: 1", "any: 1"])

  inspect
    .withThis(String)
    .accept(Number, function (num) {
      return `${this}: ${num}`
    })
    .withoutThis()

  eq(inspect.call("tag", 42), "tag: 42")
})
