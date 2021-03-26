import { Enum, iter } from "lib/Enum"
import { createWith } from "lib/edit"

export class Transmute {
  constructor(plugins, root) {
    this.plugins = plugins
    this.root = root
  }

  send(msg) {
    return this.transform({ sent: msg })
  }

  transform(ctx = {}) {
    return Enum.of(this.walk(ctx, this.root))
  }

  /**
   * Walk a level down
   */
  walkDown(parentCtx, nodes, addCtx = {}) {
    if (nodes == null) return

    const ctx = createWith(parentCtx, addCtx)

    return this.walk(ctx, nodes)
  }

  *walk(ctx, nodes) {
    if (nodes == null) return

    const recur = this.walkDown.bind(this, ctx)
    const returns = []

    for (const node of iter(nodes)) {
      // Mutate the current node
      for (const plugin of this.plugins) {
        // console.log("walking with", plugin.name, node)
        returns.push(yield* iter(plugin.call(node, ctx, recur)))
      }
    }

    const send = this.send.bind(this)

    const values = []
    for (const fn of iter(returns)) {
      if (typeof fn === "function") fn(send)
      else values.push(fn)
    }

    return values
  }
}

Transmute.test?.(({ eq }) => {
  const plugins = [Emphasis, Button, AsciiTags, AsciiText]
  const tx = root => new Transmute(plugins, root).transform().join()

  eq(tx({ Button: true, children: "Hello" }), "[Hello]")
  eq(
    tx({
      Button: true,
      children: [{ Emphasis: true, children: "Hello" }, " there"],
    }),
    "[_Hello_ there]",
  )

  function Button() {
    if (!this.Button) return

    this.open = "["
    this.close = "]"
  }

  function Emphasis() {
    if (!this.Emphasis) return

    this.open = "_"
    this.close = "_"
  }

  function* AsciiTags(_, recur) {
    const { open, close, children } = this
    if (!open || !close) return

    yield open
    yield* recur(children)
    yield close
  }

  function AsciiText() {
    if (typeof this == "string") return this
  }
})
