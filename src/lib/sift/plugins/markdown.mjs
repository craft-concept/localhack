import MarkdownIt from "markdown-it"

const md = new MarkdownIt({})

export function parseMarkdown(input) {
  const { path, text } = input

  if (!text) return
  if (!path.endsWith(".md")) return

  input.markdown = md.parse(text)
}

export const all = [parseMarkdown]
