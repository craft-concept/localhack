import Precursor from "lib/Precursor"

export let Objects = Precursor.clone
  .lazy({
    query(parent) {
      return Object.assign({}, parent)
    },
  })
  .def({
    where(attrs) {
      return this.clone.tap(x => x.assignQuery(attrs))
    },

    assignQuery(attrs) {
      for (let k in attrs) this.assignValue(k, attrs[k])
    },

    assignValue(key, value) {
      this.query[key] = value
    },
  })

export default Objects
