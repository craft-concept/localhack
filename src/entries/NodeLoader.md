# Node ESM Module Loader

This file implements hooks for Node's experimental ESM Module Loader API.

WIP

```mjs
// import fg from "fast-glob"
```

```mjs
const ROOT = process.cwd()
```

```mjs
export function resolve(specifier, { conditions, parentURL }, defaultResolve) {
  // fg.sync([], { onlyFiles: true })
  // console.log("resolving:", specifier)
  return defaultResolve(specifier, { conditions, parentURL }, defaultResolve)
}
```
