import Translate, { T } from "lib/Translate"

Translate.shape("json", String).shape("parse", T.Any)

Translate.register("json", T.Any, JSON.stringify)

Translate.register("parse", String, str => {
  try {
    return JSON.parse(str)
  } catch (_) {}
})
