import { Enum, iter } from "lib/Enum"
import { createWith } from "lib/edit"

export class Lift {
  constructor(state = {}) {
    this.state = state
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

  transform(root) {
    return Enum.of(this.walk(root))
  }

  *walk(nodes) {
    if (nodes == null) return

    const recur = this.send
    const returns = []

    for (const node of iter(nodes)) {
      // Mutate the current node
      for (const plugin of this.plugins) {
        // console.log("walking with", plugin.name, node)
        returns.push(yield* iter(plugin.call(node, recur, this.state)))
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

  function* AsciiTags(recur) {
    const { open, close, children } = this
    if (!open || !close) return

    yield open
    yield* recur(children)
    yield close
  }

  function* AsciiText() {
    if (typeof this == "string") yield this
  }
})
