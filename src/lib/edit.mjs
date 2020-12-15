import { test } from "./testing.mjs"
import {
  produce,
  isDraft,
  current as currentIm,
  original as originalIm,
} from "immer"
import { T, isObj } from "./reify.mjs"
import { Enum, iter, entries, keys, values } from "./Enum.mjs"

/** Default type conversions. */
export { T, isObj }
export { Enum, iter, entries, keys, values }

/**
 * Returns whether `x` is null or undefined.
 * Opposite of `exists`.
 */
export const isNil = x => x == null

/**
 * Returns whether `x` is not null or undefined.
 * Opposite of `isNil`.
 */
export const exists = x => x != null

/**
 * Enforce properties as certain types.
 */
export const reify = desc => state => {
  for (const [k, as] of entries(desc)) {
    state[k] = as(state[k])
  }

  return state
}

test(reify, ({ eq }) => {
  const state = {
    number: 12,
    string: "something",
  }

  eq(
    reify({
      number: T.Array,
      string: T.Set,
    })(state),
    {
      number: [12],
      string: new Set(["something"]),
    },
  )
})

/**
 * Returns a function that maps over its inputs, passing each through `fn`.
 */
export const iterate = fn => (...inputs) => {
  const out = []
  for (const input of iter(inputs)) out.push(...iter(fn(input)))
  return out
}

export const DRAFT_STATE = Symbol.for("immer-state")

export const draftState = input => input[DRAFT_STATE]
export const isModified = input => draftState(input)?.modified_
export const isOriginal = input => !isModified(input)
export const current = input => (isDraft(input) ? currentIm(input) : input)
export const original = input => (isDraft(input) ? originalIm(input) : input)

export function deepAssign(target, ...sources) {
  for (const source of sources)
    for (const k of keys(source))
      if (typeof target[k] === "object" && typeof source[k] === "object") {
        deepAssign(target[k], source[k])
      } else {
        target[k] = source[k]
      }

  return target
}

test(deepAssign, ({ eq }) => {
  const source = { a: { b: 2 } }
  eq(deepAssign({ a: 1, c: 3 }, source), { a: { b: 2 }, c: 3 })
})

test(isModified, ({ eq }) => {
  produce({ test: { a: 1 } }, obj => {
    eq(isModified(obj), false)
    eq(isModified(obj.test), false)

    obj.test.a = 2

    eq(isModified(obj), true)
    eq(isModified(obj.test), true)
  })
})
