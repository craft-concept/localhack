# Markdown

[markdown-to-ast](https://www.npmjs.com/package/@textlint/markdown-to-ast)

````mjs
import md from "@textlint/markdown-to-ast"

export default [parse, markBlocks, render]

export function* parse({ ext, text }, { markdown }) {
  if (typeof text != "string") return
  if (ext != ".md") return
  if (markdown != Object) return

  yield { markdown: md.parse(text) }
}

export function markBlocks(node) {
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

export function* render(node, ctx, recur) {
  if (ctx.markdown != String) return
  if (typeof node.type != "string") return

  if (node.isBlock && ctx.blockCount != 0 && !ctx.nested) yield "\n"

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
      if (!ctx.nested) yield "\n"
      break

    case "List":
      ctx.ordered = node.ordered
      yield* recur(node.children)
      break

    case "ListItem":
      ctx.numeral ??= 0
      ctx.numeral += 1
      yield ctx.ordered ? `${ctx.numeral}. ` : "- "
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

  if (ctx.blockIndex != null) ctx.blockIndex += 1
}
````
