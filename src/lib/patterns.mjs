import { makeFn } from "./fns.mjs"

export const T = {
  Any: { __type: "any" },
  Nil: { __type: "nil" },
  Null: { __type: "null" },
  Undefined: { __type: "undefined" },

  String: { __type: "string" },
  Number: { __type: "number" },
  Boolean: { __type: "boolean" },

  Tup: (...rest) => rest,
  Array: item => [item],
  OneOf: (...opts) => ({
    __type: "OneOf",
    opts,
  }),

  Many: item => T.OneOf(item, T.Array(item)),

  Function: (...inputs) => ({
    __type: "function",
    inputs,
  }),

  Maybe: item => T.OneOf(T.Nil, item),

  Pattern: pattern => ({
    __type: "pattern",
    pattern,
  }),

  Rest: pattern => ({
    __type: "rest",
    pattern,
  }),

  Var: (name, pattern = T.Any) => ({
    __type: "var",
    name,
    pattern,
  }),
}

export function reify(pattern) {
  switch (pattern) {
    case Number:
      return T.Number
    case String:
      return T.String
    case Boolean:
      return T.Boolean
    default:
      return pattern
  }
}

/**
 * Define a function that exposes its input and output types as patterns.
 */
export function fn(input, f, output = undefined) {
  return makeFn(f, {
    input,
    output,
  })
}

guard(guard, T.Function(), T.Rest(T.Pattern))
export function guard(fn, ...inputs) {
  fn.inputs = inputs
  fn.with = makeFn(guardedCall, {
    name: `guarded_${fn.name || "anonymous"}`,
  })

  return fn

  function guardedCall(...inputs) {
    const ctx = matchInputs(fn, inputs)
    return ctx ? fn(...inputs, ctx) : null
  }
}

export function matchInputs(fn, inputs) {
  return fn.matches ? match(fn.inputs)(inputs) : true
}

export const match = pattern => {
  pattern = reify(pattern)
  if (isType(pattern)) return matchType(pattern)

  // TODO: tuples
  if (Array.isArray(pattern)) throw new Error("Can't match arrays yet.")

  // Handle literals
  switch (typeof pattern) {
    case "string":
    case "number":
    case "boolean":
      return data => data === pattern

    case "object":
      return matchObject(pattern)
  }
}

export const transform = fn => {
  const input = match(fn.input)

  return item => {
    if (input(item)) return fn(item)
    return item
  }
}

export function isType(pattern) {
  return pattern && typeof pattern === "object" && "__type" in pattern
}

export const matchObject = pattern => data => {
  if (typeof data !== "object") return false

  for (const key in pattern) {
    if (!(key in data)) return false
    if (!match(pattern[key])(data[key])) return false
  }

  return true
}

export const deepEqual = a => b => {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== "object") return false

  for (const key in a) {
    if (!(key in b)) return false
    if (!deepEqual(a[key])(b[key])) return false
  }

  return true
}

export function matchType(pattern) {
  switch (pattern.__type) {
    case "any":
      return _data => true

    case "nil":
      return data => data == null

    case "null":
      return data => data === null

    case "var":
      return match(pattern.pattern)

    case "pattern":
      return deepEqual(pattern.pattern)

    default:
      return data => pattern.__type === typeof data
  }
}

import { test } from "./Testing.mjs"
test(match, ({ eq }) => {
  const matches = (p, v) => eq(match(p)(v), true)
  const noMatch = (p, v) => eq(match(p)(v), false)

  matches(T.Any, 1234)

  matches(Number, 1234)
  matches(T.Number, 1234)
  noMatch(T.Number, "no")

  matches(String, "hi")
  matches(T.String, "hi")
  noMatch(T.String, 1234)

  matches(Boolean, true)
  matches(T.Boolean, true)
  matches(T.Boolean, false)
  noMatch(T.Boolean, 1234)

  matches("hi", "hi")
  noMatch("hi", "no")

  matches(T.Pattern(T.Number), T.Number)
  noMatch(T.Pattern(T.Number), T.String)
  noMatch(T.Pattern(T.Number), 1234)
  matches(T.Pattern(1), 1)
})
