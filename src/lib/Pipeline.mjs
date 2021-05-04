import Precursor from "lib/Precursor"

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

Transformer.new.test?.(({ eq }) => {
  let tx = P.on("append", String)
    .when(String)
    .map((self, str) => self + str)

  eq
})

export let Pipeline = Precursor.new()
  .lazy({
    registry() {
      return {}
    },
  })
  .def({
    on(name, ...inputs) {
      let tx = Transformer.new({ name, inputs })
      this.registry[name] ??= []
      this.registry[name].push(tx)
      return tx
    },
  })

export default Pipeline

Pipeline.new.test?.(({ eq }) => {
  let p = Pipeline.new()

  let tx = P.on("append", String)
    .when(String)
    .map((self, str) => self + str)

  p.on("uppercase")
    .when(String)
    .map(str => str.toUpperCase())
})
