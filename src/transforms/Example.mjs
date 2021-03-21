// export function explore(node) {
//   return node.children
// }

// Linear to tree
export function parse(input) {
  return input.toNode()
}

export function transform(node) {
  node.make = "changes"
  delete node.bad

  return ["before", node, "after"]
}

// Tree to linear
export function* render(node, recur) {
  yield "before"
  yield node.before
  yield* recur()
  yield node.after
  yield "after"
}
