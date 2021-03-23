# Markdown Parsing and Rendering Test

- An
- Unordered
- List

```mjs
import { readFile } from "fs/promises"
import * as Project from "lib/Project"
import { Transmute } from "lib/Transmute"
import * as Markdown from "./Markdown"

function MarkdownTest() {}

MarkdownTest.test?.(async ({ eq }) => {
  const tm = new Transmute([Markdown.parse, Markdown.explore, Markdown.render])
  const tx = n => tm.transform(n).join()

  const text = String(await readFile(Project.src("transforms/MarkdownTest.md")))

  eq(tx({ ext: ".md", text }), text)
})
```
