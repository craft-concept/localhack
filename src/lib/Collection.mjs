import Precursor from "lib/Precursor"
import { T } from "lib/patterns"

export { T }

export let Collection = Precursor.clone
  .lazy({
    translations: () => ({}),
    currentValues: () => [],
    currentErrors: () => [],
    filters: () => [],
  })
  .def({
    name: "Collection",

    translationTo(col) {
      if (!col.name || col.name == "Collection")
        throw new Error("Collection must have a name.")

      let translations = (this.translations[col.name] ??= [])
      let translation = Translation.clone.assign({ to: col })
      translations.push(translation)
      return translation
    },
  })

export default Collection

export let Translation = Precursor.clone.def({
  accepts(pattern, translate) {
    this.pattern = pattern
    this.translate = translate
  },
})
