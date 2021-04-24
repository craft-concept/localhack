# Node ESM Module Loader

This file implements hooks for Node's experimental ESM Module Loader API.

WIP

```mjs
// import fg from "fast-glob"
import fs from "fs/promises"
import { dirname } from "path"
import * as Res from "../lib/Resolution.mjs"
```

```mjs
const root = process.cwd()
```

```mjs
export async function resolve(
  specifier,
  { conditions, parentURL },
  defaultResolve,
) {
  let [spec, query = ""] = specifier.split("?")
  if (query) query = "?" + query

  const parent = parentURL && dirname(new URL(parentURL).pathname)
  const path = (await Res.realPathFor(spec, parent)) || spec

  return defaultResolve(path + query, { conditions, parentURL }, defaultResolve)
}
```
