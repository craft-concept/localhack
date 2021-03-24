# Markdown

[markdown-to-ast](https://www.npmjs.com/package/@textlint/markdown-to-ast)

````mjs
import md from "@textlint/markdown-to-ast"

export function parse(node) {
  const { ext, text } = node

  if (typeof text != "string") return
  if (ext != ".md") return

  node.markdown = md.parse(text, {})
}

export function transform(node) {
  if (!this.isMarkdown) return

  switch (node.type) {
    case "Heading":
    case "Paragraph":
    case "List":
    case "BlockQuote":
    case "CodeBlock":
      node.isBlock = true
      break
    default:
      node.isBlock = false
  }
}

export function explore({ markdown }, recur) {
  if (typeof markdown != "object") return

  return recur(markdown, { isMarkdown: true })
}

export function* render(node, recur) {
  if (!this.isMarkdown) return
  if (typeof node.type != "string") return

  if (node.isBlock && this.blockCount != 0 && !this.nested) yield "\n"

  switch (node.type) {
    case "Document":
      yield* recur(node.children, { blockIndex: 0 })
      break

    case "Str":
      yield node.value
      break

    case "Header":
      yield "#".repeat(node.depth)
      yield " "
      yield* recur(node.children, { nested: true })
      yield "\n"
      break

    case "Paragraph":
      yield* recur(node.children, { nested: true })
      if (!this.nested) yield "\n"
      break

    case "List":
      this.ordered = node.ordered
      yield* recur(node.children)
      break

    case "ListItem":
      this.numeral ??= 0
      this.numeral += 1
      yield this.ordered ? `${this.numeral}. ` : "- "
      yield* recur(node.children, { nested: true })
      yield "\n"
      break

    case "BlockQuote":
      yield "> "
      yield* recur(node.children, { nested: true })
      yield "\n"
      break

    case "CodeBlock":
      yield "```"
      yield node.lang
      yield "\n"
      yield node.value
      yield "\n```\n"
      break

    case "Emphasis":
      yield "_"
      yield* recur(node.children)
      yield "_"
      break

    case "Strong":
      yield "**"
      yield* recur(node.children)
      yield "**"
      break
  }

  if (this.blockIndex != null) this.blockIndex += 1
}
````
