# Markdown

[markdown-to-ast](https://www.npmjs.com/package/@textlint/markdown-to-ast)

```mjs
import md from "@textlint/markdown-to-ast"

export function parse(node) {
  const { ext, text } = node

  if (typeof text != "string") return
  if (ext != ".md") return

  node.markdown = md.parse(text, {})
}

export function explore(node, recur) {
  if (typeof node.markdown == "object") return recur(node.markdown)
}

export function* render(node, recur) {
  if (typeof node.type != "string") return
  console.log(node)

  switch (node.type) {
    case "Document":
      return recur(node.children)

    case "Header":
      yield node.raw
      return "\n"

    case "Paragraph":
      yield node.value
      return "\n"

    case "Emphasis":
      yield "*"
      yield* recur(node.children)
      return "*"
  }
}
```
