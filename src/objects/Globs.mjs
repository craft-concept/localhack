import Collection, { T } from "lib/Collection"

export default Collection.clone
  .accepts(String, [String], RegExp)
  .accepts(String)
  .accepts([String], strs => internal => internal.push(...strs))
  .translation("paths")
