# Enum Library

`iter` iterates over a collection of objects. Nested iterables are also
iterated. We iterate over the values of Maps.

```mjs
export function* iter(x) {
  if (x == null) return
  if (x instanceof Map) x = x.values()
  if (typeof x === "object" && Symbol.iterator in x) {
    for (const xa of x) yield* iter(xa)
  } else {
    yield x
  }
}

test(iter, ({ eq }) => {
  eq([...iter()], [])
  eq([...iter(null)], [])
  eq([...iter(undefined)], [])
  eq([...iter(1)], [1])
  eq([...iter([1])], [1])
  eq([...iter([1, [2, 3], 4])], [1, 2, 3, 4])
  eq(
    [
      ...iter(
        new Map([
          ["1", 1],
          ["2", 2],
        ]),
      ),
    ],
    [1, 2],
  )
})
```

```mjs
export function* fns(...x) {
  for (const v of iter(x)) if (typeof x === "function") yield x
}
```

Some object iteration helpers:

```mjs
import { isObj } from "./reify.mjs"

/** Iterate over the keys of an object. */
export function* keys(obj) {
  if (isObj(obj)) for (const k in obj) yield k
}

/** Iterate over the entries of an object. */
export function* entries(obj) {
  if (isObj(obj)) for (const k in obj) yield [k, obj[k]]
}

/** Iterate over the entries of an object. */
export function* values(obj) {
  if (isObj(obj)) for (const k in obj) yield obj[k]
}
```

```mjs
/**
 * `iter` over the inputs, passing each through `fn`.
 */
export const iterMap = fn =>
  function* iterMap(...xs) {
    for (const v of iter(xs)) yield* iter(fn(v))
  }

test(iterMap, ({ eq }) => {
  const inc = x => x + 1
  const evenOnly = x => (x % 2 === 0 ? x : null)
  const incs = iterMap(inc)
  const evens = iterMap(evenOnly)

  eq([...incs()], [])
  eq([...incs([])], [])
  eq([...incs(null)], [])
  eq([...incs(undefined)], [])
  eq([...incs(1, 2, [3, [4]], 5)], [2, 3, 4, 5, 6])
  eq([...incs(null, undefined, 1)], [2])
  eq([...evens(1, 2, [3, [4]], 5)], [2, 4])
})
```

```mjs
export class Enum {
  static of(...values) {
    return new Enum(() => iter(values))
  }

  static gen(generator) {
    return new Enum(generator)
  }

  constructor(fn) {
    this.iter = fn
  }

  [Symbol.iterator]() {
    return this.iter()[Symbol.iterator]()
  }

  chain(fn) {
    const values = this.iter()
    return Enum.gen(function* chained() {
      for (const value of values) {
        yield* iter(fn(value))
      }
    })
  }

  map(fn) {
    const values = this.iter()
    return Enum.gen(function* mapped() {
      for (const value of values) {
        yield fn(value)
      }
    })
  }

  each(fn) {
    for (const value of this.iter()) fn(value)
    return this
  }

  forEach(fn) {
    return this.each(fn)
  }

  array() {
    return [...this.iter()]
  }

  set() {
    return new Set(this.iter())
  }
}
```

And some tests for `Enum`:

```mjs
import { test } from "./Testing.mjs"

test(Enum, ({ eq }) => {
  const inc = x => x + 1
  const dup = x => [x, x]

  const en = Enum.of(1, 2, 3)
  const en2 = Enum.of(en)

  eq([...en], [1, 2, 3])
  eq([...en2], [1, 2, 3])

  eq(en.array(), [1, 2, 3])
  eq(en2.array(), [1, 2, 3])

  eq(en.map(inc).array(), [2, 3, 4])
  eq(en2.map(inc).array(), [2, 3, 4])

  eq(en.map(dup).array(), [
    [1, 1],
    [2, 2],
    [3, 3],
  ])
  eq(en2.map(dup).array(), [
    [1, 1],
    [2, 2],
    [3, 3],
  ])

  eq(en.chain(dup).array(), [1, 1, 2, 2, 3, 3])
  eq(en2.chain(dup).array(), [1, 1, 2, 2, 3, 3])

  eq(en.set(), new Set([1, 2, 3]))
  eq(en2.set(), new Set([1, 2, 3]))
})
```
