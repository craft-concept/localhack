import Translate, { T } from "lib/Translate"
import Yaml from "yaml"

Yaml.defaultOptions.customTags ??= []

Yaml.defaultOptions.customTags.push({
  identify: fn => typeof fn == "function",
  tag: "!function",
  resolve(doc, cst) {
    return () => {}
  },
  stringify(fn, ctx, onComment, onChompKeep) {
    return fn.name || "(anonymous)"
  },
})

Translate.shape("yaml", String).shape("parse", T.Any)

Translate.register("yaml", T.Any, Yaml.stringify)

Translate.register("parse", String, str => {
  try {
    return Yaml.parse(str)
  } catch (_) {}
})
