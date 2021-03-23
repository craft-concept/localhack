export function* render(node, recur) {
  if (typeof tag != "string") return recur()

  this.depth = (this.__proto__.depth ?? 0) + 1

  yield "  ".repeat(this.depth)
  yield "<" + tag
  yield* renderAttributes(attributes)
  yield ">"
  yield* recur()
  yield "  ".repeat(this.depth)
  yield "</" + tag + ">\n"
}

function* renderAttributes(attrs) {
  for (const k in attrs) {
    yield ` ${k}="${attrs[k]}"`
  }
}
