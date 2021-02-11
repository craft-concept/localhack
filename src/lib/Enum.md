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
export function* withNext(iterable) {
  let it = iter(iterable),
    val,
    res,
    next = v => (val = v)
  do {
    res = it.next(val)
    yield [res, next]
  } while (res.done === false)
}

test(withNext, ({ eq }) => {})
```

```mjs
export function isEmpty(x) {
  for (const _ of iter(x)) return false
  return true
}

test(isEmpty, ({ eq }) => {
  eq(isEmpty(null), true)
  eq(isEmpty([]), true)
  eq(isEmpty([1]), false)
  eq(isEmpty(1), false)
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

  gen(fn) {
    return Enum.gen(() => fn(this.iter()))
  }

  chain(fn) {
    return this.gen(function* chained(xs) {
      for (const x of xs) yield* iter(fn(x))
    })
  }

  map(fn) {
    return this.gen(function* mapped(xs) {
      for (const x of xs) yield fn(x)
    })
  }

  filter(fn) {
    return this.select(fn)
  }

  select(fn) {
    return this.gen(function* filtered(xs) {
      for (const x of xs) if (fn(x)) yield x
    })
  }

  reject(fn) {
    return this.gen(function* filtered(xs) {
      for (const x of xs) if (!fn(x)) yield x
    })
  }

  each(fn) {
    for (const x of this.iter()) fn(x)
    return this
  }

  forEach(fn) {
    return this.each(fn)
  }

  get array() {
    return (this._array ??= [...this.iter()])
  }

  get set() {
    return (this._set ??= new Set(this.iter()))
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

  eq(en.array, [1, 2, 3])
  eq(en2.array, [1, 2, 3])

  eq(en.map(inc).array, [2, 3, 4])
  eq(en2.map(inc).array, [2, 3, 4])

  eq(en.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3],
  ])
  eq(en2.map(dup).array, [
    [1, 1],
    [2, 2],
    [3, 3],
  ])

  eq(en.chain(dup).array, [1, 1, 2, 2, 3, 3])
  eq(en2.chain(dup).array, [1, 1, 2, 2, 3, 3])

  eq(en.set, new Set([1, 2, 3]))
  eq(en2.set, new Set([1, 2, 3]))

  test(en.select, () => {
    const isOdd = x => x % 2

    eq(en.select(isOdd).array, [1, 3])
    eq(en2.select(isOdd).array, [1, 3])
    eq(en.filter(isOdd).array, [1, 3])

    eq(en.map(inc).reject(isOdd).array, [2, 4])
  })
})
```