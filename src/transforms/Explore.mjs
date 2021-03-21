class Recipes {
  removeNode(node) {
    return null
  }

  removeChildren(node) {
    delete node.children
  }

  appendWithArray(node) {
    return [{ something: "before" }, node, { something: "after" }]
  }

  *appendWithGenerator(node) {
    yield { something: "before" }
    yield node
    yield { something: "after" }
  }

  renderThisNode(node) {
    return recur => {
      return node.pre + recur(node.children) + node.post
    }
  }

  exploreChildren(node) {
    return function* () {
      yield* node.children
    }
  }
}

export function Button({ node }) {
  if (!node.Button) return
  node.tag = "button"
}

export function Dom(node) {
  return recur => {
    if (!Array.isArray(node.children)) return
    node.children = node.children.map(recur)
  }
}

/**
 * The stages:
 * Transform - Alter, replace, or remove the current node
 * Explore   - Find new places to search; find children. Push onto the stack.
 * Render    - Output data as we unwind the stack.
 */

export function* Html({ tag, attributes = {} }) {
  ;``
  if (typeof tag != "string") return
  this.depth ??= 0
  this.depth = this.__proto__.depth + 1

  return recur => [
    "<" + tag,
    this.renderAttributes(attributes),
    ">",
    recur(),
    "</" + tag + ">\n",
  ]
}

function* renderAttributes(attrs) {
  for (const k in attrs) {
    yield `${k}="${attrs[k]}"`
  }
}

function transform(plugins, node) {
  const ctx = {}
  for (const plugin of plugins) {
    ctx[plugin.name] = {}
  }

  for (const key in ctx) {
  }

  plugin.transform?.(node)
  // plugin.explore?.(node)
  // yield* plugin.render?.(node)
}

function* walk(plugins, node) {
  for (const k in plugins) {
    for (const result of iter(plugins[k].call(this[k], node))) {
    }
  }
}

transform.rest?.(({ eq }) => {
  const plugins = [Button, Dom, Html]

  eq(transform(plugins, { Button: true, children: "Hello" }), {
    Button: true,
    tag: "button",
    attributes: {},
    children: "Hello",
  })
})
