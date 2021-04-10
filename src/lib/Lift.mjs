import { Enum, iter } from "lib/Enum"
import { createWith } from "lib/edit"

export class Lift {
  constructor(state = {}) {
    this.state = state
    this.plugins = []
    this.send = this.send.bind(this)
  }

  set(state) {
    this.state = state
    return this
  }

  use(...plugins) {
    this.plugins.push(...iter(plugins))
    return this
  }

  send(msg) {
    return this.transform(msg)
  }

  transform(root, ctx = {}) {
    return Enum.of(this.walk(root, ctx))
  }

  walkDown(parentCtx, nodes, addCtx = {}) {
    if (nodes == null) return

    const ctx = createWith(parentCtx, addCtx)
    return this.walk(nodes, ctx)
  }

  *walk(nodes, ctx) {
    if (nodes == null) return

    const recur = this.walkDown.bind(this, ctx)
    const returns = []

    for (const node of iter(nodes)) {
      if (typeof node == "function") this.plugins.push(node)

      // Mutate the current node
      for (const plugin of this.plugins) {
        // console.log("walking with", plugin.name, node)
        returns.push(yield* iter(plugin.call(null, node, ctx, recur)))
      }
    }

    const values = []
    for (const fn of iter(returns)) {
      if (typeof fn === "function") fn(send)
      else values.push(fn)
    }

    return values
  }
}

Lift.test?.(({ eq }) => {
  const plugins = [Emphasis, Button, AsciiTags, AsciiText]
  const self = new Lift().use(plugins)
  const tx = root => self.transform(root).join()

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

  function* AsciiTags({ open, close, children }, _, recur) {
    if (!open || !close) return

    yield open
    yield* recur(children)
    yield close
  }

  function* AsciiText(node) {
    if (typeof node == "string") yield node
  }
})
