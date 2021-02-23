import { iter } from "lib/edit"

/**
 * Sends the children of each inputed node.
 */
export function traverse(input, state) {
  return send => {
    for (const id of iter(input.children)) {
      const child = state.nodes[child]
      if (child) send(child)
    }
  }
}
