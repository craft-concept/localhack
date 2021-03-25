import { Enum, iter } from "lib/Enum"

export class Transmute {
  constructor(plugins = [], state = {}) {
    this.plugins = plugins
    this.state = state
  }

  transform(input) {
    return Enum.of(this.walk(this.state, input))
  }

  /**
   * Walk a level down
   */
  walkDown(parentCtx, input, addCtx = {}) {
    if (input == null) return

    const ctx = Object.assign(Object.create(parentCtx), addCtx)

    return this.walk(ctx, input)
  }

  *walk(ctx, input) {
    if (input == null) return

    const recur = this.walkDown.bind(this, ctx)
    const asyncFns = []

    for (const node of iter(input)) {
      // Mutate the current node
      for (const plugin of this.plugins) {
        // console.log("walking with", plugin.name, node)
        const returns = yield* iter(plugin.call(ctx, node, recur))
        asyncFns.push(returns)
      }
    }

    const send = this.transform.bind(this)

    for (const fn of iter(asyncFns)) fn(send)
  }
}

Transmute.test?.(({ eq }) => {
  const tm = new Transmute([Emphasis, Button, AsciiTags, AsciiText])
  const tx = n => tm.transform(n).join()

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
