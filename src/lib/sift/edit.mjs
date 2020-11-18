import { test } from "../testing.mjs"
import {
  produce,
  isDraft,
  current as currentIm,
  original as originalIm,
} from "immer"

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

export const DRAFT_STATE = Symbol.for("immer-state")

export const draftState = input => input[DRAFT_STATE]
export const isModified = input => draftState(input)?.modified_
export const isOriginal = input => !isModified(input)
export const current = input => (isDraft(input) ? currentIm(input) : input)
export const original = input => (isDraft(input) ? originalIm(input) : input)

test(isModified, ({ eq }) => {
  produce({ test: { a: 1 } }, obj => {
    eq(isModified(obj), false)
    eq(isModified(obj.test), false)

    obj.test.a = 2

    eq(isModified(obj), true)
    eq(isModified(obj.test), true)
  })
})
