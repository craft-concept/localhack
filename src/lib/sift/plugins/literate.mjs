import { iter, entries } from "../edit.mjs"

export function tangle(input) {
  const { path, markdown } = input
  if (!path) return
  if (!markdown) return

  return state => send => {
    const code = {}
    for (const node of iter(markdown)) {
      if (node.type !== "fence") continue

      const blocks = (code[node.info] ??= [])
      blocks.push(node.content)
    }

    for (const [ext, blocks] of entries(code)) {
      send({
        virtual: true,
        path: path.replace(/\.md$/, "." + ext),
        text: blocks.join("\n\n"),
      })
    }
  }
}

export const all = [tangle]
