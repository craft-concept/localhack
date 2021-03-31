# Markdown Parsing and Rendering Test

A test markdown file. With _emphasis_ and **strong**.

- An
- Unordered
- List

1. An
2. Ordered
3. List

> Quote block

```mjs
import { readFile } from "fs/promises"
import * as Project from "lib/Project"
import { Transmute } from "lib/Transmute"
import Markdown from "./Markdown"

function MarkdownTest() {}

MarkdownTest.test?.(async ({ eq }) => {
  const plugins = [Markdown]
  const tx = root => new Transmute(root, plugins).transform().join()

  const text = String(await readFile(Project.src("transforms/MarkdownTest.md")))

  eq(tx({ ext: ".md", text }), text)
})
```

A final paragraph.
