import { iter, isEmpty } from "lib/Enum"

export function explore(node, recur) {
  if (isEmpty(node.body)) return

  const body = []
  for (const child of iter(node.body)) {
    body.push(...iter(recur(child)))
  }

  node.body = body
}
