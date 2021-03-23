# Markdown Parsing and Rendering Test

- An
- Unordered
- List

```mjs
import { source } from "./MarkdownTest.md"
import { Transmute } from "lib/Transmute"
import * as Markdown from "./Markdown"

transform.test?.(async ({ eq }) => {
  const inst = new Transmute([Markdown.parse])

  const output = [
    ...inst.transform({
      text: source,
    }),
  ]
})
```
