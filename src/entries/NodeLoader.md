# Node ESM Module Loader

This file implements hooks for Node's experimental ESM Module Loader API.

WIP

```mjs
// import fg from "fast-glob"
import fs from "fs/promises"
import * as Res from "../lib/Resolution.mjs"
```

```mjs
const root = process.cwd()
```

```mjs
export async function resolve(spec, { conditions, parentURL }, defaultResolve) {
  for (const path of Res.pathsFor(spec)) {
    try {
      await fs.access(path)
      return defaultResolve(path, { conditions, parentURL }, defaultResolve)
    } catch (e) {}
  }

  return defaultResolve(spec, { conditions, parentURL }, defaultResolve)
}
```
