# Resolution

Helpers for resolving pages.

> Todo: What should we call individual files within libraries? Using "page" for
> now.

Pages within LocalHack have names. The name of this page is `lib/Resolution`. We
can refer to facets of a page using a file extension: `lib/Resolution.md` is the
full page. `lib/Resolution.mjs` refers to the ES Module code defined within. We
could also imagine `lib/Resolution.sql` containing all code defined in
sql-labeled code fence blocks.

```mjs
function* facetsFor(name) {
  if (/\.\w+$/.test(name)) yield name

  yield `${name}.mjs`
  yield `${name}/Readme.mjs`
}
```

```mjs
function* pathsFor(name, from) {}

import { test } from "lib.mjs"
test()
```
