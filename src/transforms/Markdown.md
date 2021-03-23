# Markdown

[markdown-to-ast](https://www.npmjs.com/package/@textlint/markdown-to-ast)

```mjs
import md from "@textlint/markdown-to-ast"

export function parse(node) {
  const { ext, text } = node

  if (!text) return
  if (ext != ".md") return

  node.markdown = md.parse(text, {})
}

export function explore(node, recur) {
  if (Array.isArray(node.markdown)) {
    node.children = node.markdown.map(recur)
  }

  if (typeof node.markdown == "object") recur(node.markdown)
}
```

```mjs
transform.test?.(({ eq }) => {})
```
