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
// export Stream from "lib/Stream"
// export Hash from "lib/Hash"
// export System from "lib/System"
// export File from "lib/File"

// export Watch from "lib/Watch"
// export Build from "lib/Build"
// export Compile from "lib/Compile"
// export * as Project from "lib/project"
```
