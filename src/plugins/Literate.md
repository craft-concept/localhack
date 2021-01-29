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
import { iter, entries } from "../lib/edit.mjs"
```

First we'll define a plugin that tangles our markdown source.

```mjs
export function tangling(input, state) {
  const { path, markdown } = input
  if (!path) return
  if (!markdown) return

  const code = {}
  for (const node of iter(markdown)) {
    if (node.type !== "fence") continue

    const blocks = (code[node.info] ??= [])
    blocks.push(node.content)
  }

  return send => {
    for (const [ext, blocks] of entries(code)) {
      send({
        virtual: true,
        path: path.replace(/\.md$/, "." + ext),
        text: blocks.join("\n\n"),
      })
    }
  }
}

export const all = [tangling]
```

## Notes

Currently, this literate style comes at a cost; most tooling does not work
properly on code blocks within markdown documents.
