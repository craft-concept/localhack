# The Libraries

"lib" is the Library of Libraries.

We're planning to allow importing libraries using the lib namespace:
`import { Enum } from 'lib/Enum'`.

Soon, Readme's will behave like `index.js` files: `import { Enum } from 'lib'`.

```mjs
export * from "./Enum"
```
