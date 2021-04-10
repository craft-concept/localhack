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
import { Lift } from "lib/Lift"
import Markdown from "./Markdown"

function MarkdownTest() {}

MarkdownTest.test?.(async ({ eq }) => {
  const lift = new Lift().use(Markdown)
  const tx = (root, ctx) => lift.transform(root, ctx).join()

  const text = String(await readFile(Project.src("transforms/MarkdownTest.md")))
  const { markdown } = tx({ ext: ".md", text }, { markdown: Object })

  eq(tx({ markdown }, { markdown: String }), text)
})
```

A final paragraph.
