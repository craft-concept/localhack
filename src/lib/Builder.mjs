import Precursor from "lib/Precursor"

export default Precursor.clone
  .lazy({
    _(parent) {
      return Object.assign({}, parent)
    },
  })
  .def({
    name: "Builder",

    set(props) {
      Object.assign(this._, props)
      return this
    },

    setter(...names) {
      for (let name of names) {
        this.def({
          [name](value) {
            return this.set({ [name]: value })
          },
        })
      }

      return this
    },

    flag(name, props) {
      return this.def({
        get [name]() {
          return this.set(props)
        },
      })
    },

    with(props) {
      return this.clone.set(props)
    },
  })
  .tap(Builder => {
    Builder.setter.test?.(({ eq }) => {
      let b = Builder.clone

      b.flag()
      eq(1, 1)
    })
  })
