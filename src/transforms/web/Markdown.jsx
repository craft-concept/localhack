export function render({ markdown: md, react }) {
  if (typeof md != "object") return
  if (!react) return

  switch (md.type) {
    case "Str":
      return <>{md.value}</>

    case "Heading":
      return <h1>{this(md.children)}</h1>

    case "Paragraph":
      return <p>{this(md.children)}</p>
  }
}
