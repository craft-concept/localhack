import { fnWith } from "lib/fns"
import { T, match } from "lib/patterns"

export { T }

export class MissingPatternError extends Error {
  constructor(name, args) {
    super(`Missing pattern for ${name}(${args.map(JSON.stringify).join(", ")})`)
    this.name = name
    this.args = args
  }
}

export default function dynFn(name) {
  function self(...args) {
    return self.invoke.apply(self, args)
  }

  return fnWith(
    {
      name,
      patterns: [],
      invoke(...args) {
        for (let fn of self.patterns) {
          if (match(fn.inputs)(args)) {
            return fn.apply(this, args)
          }
        }

        throw new MissingPatternError(self.name, args)
      },

      accept(...inputs) {
        let fn = inputs.pop()
        this.patterns.unshift(fnWith({ inputs }, fn))
        return this
      },

      fallback(...inputs) {
        let fn = inputs.pop()

        this.patterns.push(fnWith({ inputs }, fn))
        return this
      },
    },
    self,
  )
}

dynFn.test?.(({ eq, throws }) => {
  let inspect = dynFn("inspect")
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
})
