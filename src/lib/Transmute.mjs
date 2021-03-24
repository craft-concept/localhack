import { Enum, iter } from "lib/Enum"

export class Transmute {
  constructor(plugins = []) {
    this.plugins = plugins
  }

  transform(input, ctx = {}) {
    return Enum.of(this.walk(ctx, input))
  }

  *walk(parentCtx, input, addCtx = {}) {
    if (input == null) return

    const ctx = Object.assign(Object.create(parentCtx), addCtx)
    const recur = this.walk.bind(this, ctx)

    for (const node of iter(input)) {
      // Mutate the current node
      for (const plugin of this.plugins) {
        // console.log("walking with", plugin.name, node)
        yield* iter(plugin.call(ctx, node, recur))
      }
    }
  }
}

Transmute.test?.(({ eq }) => {
  const tm = new Transmute([Emphasis, Button, AsciiTags, AsciiText])
  const tx = n => tm.transform(n).join("")

  eq(tx({ Button: true, children: "Hello" }), "[Hello]")
  eq(
    tx({
      Button: true,
      children: [{ Emphasis: true, children: "Hello" }, " there"],
    }),
    "[_Hello_ there]",
  )

  function Button(node) {
    if (!node.Button) return

    node.open = "["
    node.close = "]"
  }

  function Emphasis(node) {
    if (!node.Emphasis) return

    node.open = "_"
    node.close = "_"
  }

  function* AsciiTags({ open, close, children }, recur) {
    if (!open || !close) return

    yield open
    yield* recur(children)
    yield close
  }

  function AsciiText(node) {
    if (typeof node == "string") return node
  }
})
