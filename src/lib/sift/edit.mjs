import { test } from "../testing.mjs"

/**
 * Iterate over an object collection of objects. Only Arrays and Sets are themselves also iterated.
 */
export function* iter(x) {
  if (x == null) return
  if (Array.isArray(x) || x instanceof Set) {
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
})
