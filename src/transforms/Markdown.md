# Markdown

[markdown-to-ast](https://www.npmjs.com/package/@textlint/markdown-to-ast)

````mjs
import md from "@textlint/markdown-to-ast"

export default [parse, transform, explore, render]

export function parse() {
  const { ext, text } = this

  if (typeof text != "string") return
  if (ext != ".md") return

  this.markdown = md.parse(text, {})
}

export function transform({ isMarkdown }) {
  if (!isMarkdown) return

  switch (this.type) {
    case "Heading":
    case "Paragraph":
    case "List":
    case "BlockQuote":
    case "CodeBlock":
      this.isBlock = true
      break
    default:
      this.isBlock = false
  }
}

export function explore(_, recur) {
  if (typeof this.markdown != "object") return

  return recur(this.markdown, { isMarkdown: true })
}

export function* render(ctx, recur) {
  if (!ctx.isMarkdown) return
  if (ctx.markdown != String) return
  if (typeof this.type != "string") return

  if (this.isBlock && ctx.blockCount != 0 && !ctx.nested) yield "\n"

  switch (this.type) {
    case "Document":
      yield* recur(this.children, { blockIndex: 0 })
      break

    case "Str":
      yield this.value
      break

    case "Header":
      yield "#".repeat(this.depth)
      yield " "
      yield* recur(this.children, { nested: true })
      yield "\n"
      break

    case "Paragraph":
      yield* recur(this.children, { nested: true })
      if (!ctx.nested) yield "\n"
      break

    case "List":
      ctx.ordered = this.ordered
      yield* recur(this.children)
      break

    case "ListItem":
      ctx.numeral ??= 0
      ctx.numeral += 1
      yield ctx.ordered ? `${ctx.numeral}. ` : "- "
      yield* recur(this.children, { nested: true })
      yield "\n"
      break

    case "BlockQuote":
      yield "> "
      yield* recur(this.children, { nested: true })
      yield "\n"
      break

    case "CodeBlock":
      yield "```"
      yield this.lang
      yield "\n"
      yield this.value
      yield "\n```\n"
      break

    case "Emphasis":
      yield "_"
      yield* recur(this.children)
      yield "_"
      break

    case "Strong":
      yield "**"
      yield* recur(this.children)
      yield "**"
      break
  }

  if (ctx.blockIndex != null) ctx.blockIndex += 1
}
````
