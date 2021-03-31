export function transform(query) {
  const out = {}
  for (const k in query) {
    if (this[k] === query[k]) yield[(k, this[k])]
    else if (typeof query[k] == "function" && this[k] instanceof query[k])
      yield[(k, this[k])]
    else return
  }
}
