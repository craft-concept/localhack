# CLI

A library for building CLI tools.

```ohm
FlagParser {
  greeting = "Hello" | "Hola"
}
```

```mjs
// import * as fs from "fs/promises"
// import flagParserGrammar from "./CLI.ohm"

// export const flagParser = ohm.grammar(flagParserGrammar)
// console.log(flagParser)
```

```mjs
import { iter } from "../lib/edit.mjs"

export function parseFlags(input, state) {
  for (const arg of iter(input.args)) {
    const [m, name, value] = arg.match(/^--(\w[-_\w]*)(?:=(\w+))?$/) || []
    if (!name) continue
    input.flags ??= {}
    input.flags[name] ??= []
    if (value) input.flags[name].push(value)
  }

  state.flags ??= {}
  Object.assign(state.flags, input.flags)
}

export const all = [parseFlags]
```
