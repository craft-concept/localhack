# Resolution

Helpers for resolving pages. Still a Work in Progress.

> Todo: What should we call individual files within libraries? Using "page" for
> now.

Pages within LocalHack have names. The name of this page is `lib/Resolution`. We
can refer to facets of a page using a file extension: `lib/Resolution.md` is the
full page. `lib/Resolution.mjs` refers to the ES Module code defined within. We
could also imagine `lib/Resolution.sql` containing all code defined in
sql-labeled code fence blocks.

```mjs
function* facetsFor(name) {
  /** We always resolve to itself first. */
  if (/\.\w+$/.test(name)) yield name

  yield `${name}.mjs`
  yield `${name}/Readme.mjs` // Not actually sure we need this one
  yield `${name}/index.mjs` // Will probably deprecate eventually
}

import { test } from "lib.mjs"
test(facetsFor, ({ eq }) => {
  eq([...facetsFor("lib/Resolution")], ["lib/Resolution.mjs", "lib/Res"])
})
```

```mjs
export const defaultRoots = [process.cwd()]

function* pathsFor(name, from, ...roots) {
  if (isRelative(name)) {
    yield* facetsFor(name)
    return
  }

  for (const root of [...roots, ...defaultRoots]) {
    yield* facetsFor(join(name))
  }
}

test(pathsFor, ({ eq }) => {
  eq([...pathsFor("lib/Resolution")], ["lib/Resolution"])
})
```

A lazily implemented `join` function.

> Todo: Make this better.

```mjs
function join(...parts) {
  return parts.join("/").replaceAll(/\/+/g, "/")
}

function isRelative(path) {
  return /^\.\.?\//.test(path)
}

function isAbsolute(path) {
  return path.beginsWith("/")
}
```
