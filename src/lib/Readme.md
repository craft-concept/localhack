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

export { default as Precursor } from "lib/Precursor"
export { default as Stream } from "lib/Stream"
export { default as Hash } from "lib/Hash"
export { default as System } from "lib/System"
export { default as File } from "lib/File"

export { default as Watch } from "lib/Watch"
export { default as Build } from "lib/Build"
export { default as Compile } from "lib/Compile"
export * as Project from "lib/project"
```
