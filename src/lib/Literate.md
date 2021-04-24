# Literate Programming

> I believe that the time is ripe for significantly better documentation of
> programs, and that we can best achieve this by considering programs to be
> works of literature. Hence, my title: "Literate Programming."
>
> Let us change our traditional attitude to the construction of programs:
> Instead of imagining that our main task is to instruct a computer what to do,
> let us concentrate rather on explaining to human beings what we want a
> computer to do.
>
> — Donald Knuth. "Literate Programming (1984)" in Literate Programming. CSLI,
> 1992, pg. 99.

This module is something of an experiment. _Tangling_ turns the source into js
code. _Weaving_ turns our source code into documentation. For now, we've only
implemented tangling. Weaving is supported well enough by viewing the source on
github.

```mjs
import md from "@textlint/markdown-to-ast"
import { entries } from "lib"
import Stream from "lib/Stream"

export default class Literate {
  static parse(source) {
    return md.parse(source)
  }

  static tangle(source, { path }) {
    return Stream.make(({ emit }) => {
      let doc = this.parse(source)

      let code = {}
      for (let node of doc.children) {
        if (node.type != "CodeBlock") continue
        if (!node.lang) continue

        code[node.lang] ??= []
        code[node.lang].push(node.value)
      }

      for (let [ext, blocks] of entries(code)) {
        emit({
          path: path.replace(/\.md$/, "." + ext),
          source: blocks.join("\n\n"),
        })
      }
    })
  }
}
```

## Notes

Currently, this literate style comes at a cost; most tooling does not work
properly on code blocks within markdown documents.
