# The Library

"lib" is the Library. Import common exports of the nested modules from `lib`.

```mjs
export {
  edit,
  isNil,
  exists,
  reify,
  deepAssign,
  current,
  original,
} from "lib/edit"
export { Enum, iter, entries, keys, values } from "lib/Enum"
export { Future } from "lib/Future"
export { T, isObj } from "lib/reify"
export { test } from "lib/Testing"
```
