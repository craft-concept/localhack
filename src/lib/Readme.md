# The Library

"lib" is the Library. Import common exports of the nested modules from
`lib.mjs`.

```mjs
export {
  edit,
  isNil,
  exists,
  reify,
  deepAssign,
  current,
  original,
} from "./lib/edit.mjs"
export { Enum, iter, entries, keys, values } from "./lib/Enum.mjs"
export { Future } from "./lib/Future.mjs"
export { T, isObj } from "./lib/reify.mjs"
export { test } from "./lib/Testing.mjs"
```
