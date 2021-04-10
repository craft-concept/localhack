import Translate, { T } from "lib/Translate"

Translate.register("json", T.Any, JSON.stringify)

Translate.register("parse", String, str => {
  try {
    return JSON.parse(str)
  } catch (_) {}
})

Translate.register("parse")
  .accepts(String)
  .then(str => {
    try {
      return JSON.parse(str)
    } catch (_) {}
  })
