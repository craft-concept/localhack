import { T, match } from "lib/patterns"
import Precursor from "lib/Precursor"

export class MissingPatternError extends Error {
  constructor(name, args) {
    let rest = args.map(JSON.stringify).join(", ")
    super(`Missing pattern for ${name}(${rest})`)
    this.name = name
    this.args = args
  }
}

export let $ = Precursor.new({ name: "$" })
  .lazy({
    methods: (p = {}) => p,
    expanders: (p = []) => p,
    performers: (p = []) => p,
  })
  .def({
    method(name) {
      if (this.methods[name]) return this[name]

      let method = this.new(name).assign({
        parent: this,
      })

      this.methods[name] = method

      this.def({
        get [name]() {
          return this.methods[name].with({ parent: this })
        },
      })

      return method
    },

    *performAll(...args) {
      if (this._) {
        for (let fn of this.performers) {
          if (match(fn.inputs)(args)) yield fn(this._, ...args)
        }
      } else {
      }
    },

    invokeAll() {
      return this.parent.withStep(this.name, args)
    },

    invoke(...args) {
      for (let x of this.invokeAll(args)) return x
      throw new MissingPatternError(this.name, this, args)
    },

    init(name) {
      return this.assign({ name })
    },

    performer(inputs, fn) {
      this.performers.push({
        inputs,
        fn,
      })
      return this
    },

    withStep(name, args) {
      return this.clone.tap(x => {
        x.steps = [...this.steps, [name, args]]
      })
    },

    with(...assigns) {
      return this.clone.assign(...assigns)
    },

    accept(...inputs) {
      return this.with({ inputs })
    },

    *allExpands(...args) {
      for (let fn of this.patterns) {
      }
    },
  })
  .tap($ => {
    $.performer(T.Any, (..._) => this.with({ _ }))

    $(T.Any)
      .method("reduce")
      .accept(T.Any, T.Function(T.Any, T.Any))
      .perform((_, init, fn) => _.reduce(fn, init))

    $(Number)
      .method("sum")
      .expand(_ => _.reduce(0, (sum, n) => sum + n))
  })

$({ map: Function })
  .on("map", Function)
  .perform(($, fn) => $._.map(_ => _.map(fn)))

$(T.Any)
  .method("method")
  .accept(String)
  .perform(($, name) => ($[name] ??= $.new(name)))

export default $

$("@matt").send({ subject: "Hi" })
$("@matt")

$(/^@\w+/)
  .method("send")
  .accept(String)
  .expand((_, to, subject) => _.send({ to, subject }))

// $(1,2,3).sum() // this does not work. cannot sum 1 or 2 or 3
// $(Number, String) // this is equivalent to a `T.OneOf(Number, String)`

$.test?.(({ eq }) => {
  eq($.add(1).add(2).invoke(1, 2, 3), [4, 5, 6])
  eq($(1, 2, 3).add(1).add(2)._, [4, 5, 6])
})
