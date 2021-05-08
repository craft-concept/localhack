import Precursor from "lib/Precursor"
import Dyn from "lib/Dyn"

export let Transformer = Precursor.new()
  .setters({
    named: "name",
    accepts: ["inputs"],
    when: "shape",
    action: "invoke",
  })
  .def({
    apply(self, ...args) {
      this.invoke.apply(self, ...args)
    },

    bind(self, ...args) {
      return this.invoke.bind(this, self, ...args)
    },
  })

export let EmptyPipeline = Precursor.new()
  .lazy({
    _: () => ({}),
    steps: () => [],
    methods: () => ({}),
  })
  .def({
    name: "EmptyPipeline",
    init(name) {
      if (name) this.name = name
    },

    define(name) {
      if (this[name]) return

      this.methods[name] ??= this.new(`${this.name}_${name}`)

      this.def({
        [name](...args) {
          return this.step(name, ...args)
        },
      })
    },

    step(name, ...args) {
      this.steps.push([name, ...args])
      return this
    },

    apply(input, args) {
      let value = input
      for (let [name, ...args] of this.steps) {
        value = this.methods[name].apply(value, args)
      }
      return value
    },

    // on(shape, name, ...inputs) {
    //   this.define(name)
    //   this[name].accept(shape, ...inputs)
    //   return this
    // },

    on(name, fn) {
      this.define(name)
      if (typeof fn == "function") return fn(this.methods[name])
      return this.methods[name]
    },
  })

EmptyPipeline.step.test?.(({ eq }) => {
  let p = EmptyPipeline.new("TestPipeline")

  p.step("a", 1).step("b", 2, 3)

  eq(p.steps, [
    ["a", 1],
    ["b", 2, 3],
  ])

  p.method("on")
    .inputs(String, T.Rest())
    .expand((P, name, ...inputs) => P.method(name).inputs(...inputs))

  p.on("add", Number).expand((_, n) => _.perform(sum => sum + n))

  p.on("")
})

export let Pipeline = EmptyPipeline.tap(EP => {
  EP.on("flatMap", Function).perform(_ => {})

  EP.on("map", Function).expand((_, fn) => _.flatMap(x => [fn(x)]))
  EP.on("map", Function).flatMap(x => [fn(x)]) // not able to see inputs
})
// .when({ map: Function }).on(
//   "map",
//   Function,
//   (arr, fn) => arr.map(fn),
// )

// export default Pipeline

// Pipeline.new.test?.(({ eq }) => {
//   let p = Pipeline.new("MyStringChanges")

//   p.when(String)
//   p.on("append").accept(String, p => p.map((self, str) => self + str))
//   p.on("uppercase").accept(p => p.map(str => str.toUpperCase()))
// })
