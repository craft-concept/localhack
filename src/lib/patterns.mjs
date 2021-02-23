import { makeFn } from "./fns"
import { test } from "./Testing"

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
  OneOf: (...opts) => ({ __type: "OneOf", opts }),

  Many: item => T.OneOf(item, T.Array(item)),

  Enum: item => T.OneOf(item, T.Iterable(item)),

  Function: (...inputs) => ({
    __type: "function",
    inputs,
  }),

  Maybe: item => T.OneOf(T.Nil, item),

  Iterable: pattern => ({ __type: "iterable", pattern }),

  /** Three names for the same thing. */
  Ask: pattern => ({ __type: "pattern", pattern }),
  Quote: pattern => ({ __type: "pattern", pattern }),
  Pattern: pattern => ({ __type: "pattern", pattern }),

  Rest: pattern => ({ __type: "rest", pattern }),

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
    case Function:
      return T.Function(...(pattern.inputs || [T.Any]))
    default:
      return pattern
  }
}

/**
 * Define a function that exposes its input and output types as patterns.
 */
export function fn(inputs, f, output = undefined) {
  return makeFn(f, {
    inputs,
    output,
  })
}

export function matchInputs(fn, inputs) {
  if (!fn.inputs) return
  return match(fn.inputs)(inputs)
}

// Todo: return a generator of matched vars
export function match(pattern) {
  pattern = reify(pattern)
  if (isType(pattern)) return matchType(pattern)

  // Handle literals
  switch (typeof pattern) {
    case "string":
    case "number":
    case "boolean":
      return data => data === pattern

    case "object":
      return Array.isArray(pattern) ? matchArray(pattern) : matchObject(pattern)
  }

  throw new Error(`Unimplemented pattern: ${pattern}.`)
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
  if (typeof data !== "object") return

  for (const key in pattern) {
    if (!(key in data)) return
    if (!match(pattern[key])(data[key])) return
  }

  return true
}

export const matchArray = pattern => data => {
  if (!Array.isArray(pattern)) return
  if (typeof data !== "object") return

  for (let i = 0; i < pattern.length; i++) {
    // Todo: pass matched vars
    if (!match(pattern[i])(data[i])) return
  }

  return true
}

export const deepEqual = a => b => {
  if (a === b) return true
  if (typeof a !== typeof b) return
  if (typeof a !== "object") return

  for (const key in a) {
    if (!(key in b)) return
    if (!deepEqual(a[key])(b[key])) return
  }

  return true
}

export function matchType(pattern) {
  // TODO: tuples

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

    case "iterable":
      throw new Error(`Not yet sure how to implement iterable pattern matching`)

    default:
      return data => pattern.__type === typeof data
  }
}

test(match, ({ truthy, falsy }) => {
  const matches = (p, v) => truthy(match(p)(v))
  const noMatch = (p, v) => falsy(match(p)(v))

  matches(T.Any, 1234)

  matches(Number, 1234)
  noMatch(Number, "no")
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

guard(guard, [T.Function(), [T.Any]])
export function guard(fn, inputs) {
  fn.inputs = inputs
  fn.with = makeFn(guardedCall, {
    name: `guarded_${fn.name || "anonymous"}`,
  })
  fn.ensure = makeFn(guardedThrowCall, {
    name: `guarded_throw_${fn.name || "anonymous"}`,
  })

  return fn.with

  function guardedCall(...inputs) {
    const ctx = matchInputs(fn, inputs)
    return ctx ? fn(...inputs) : null
  }

  function guardedThrowCall(...inputs) {
    const ctx = matchInputs(fn, inputs)
    if (!ctx) throw new TypeError(`Invalid inputs: ${inputs}.`)
    return fn(...inputs)
  }
}

test(guard, ({ eq, throws }) => {
  guard(add, [Number, Number])
  function add(a, b) {
    return a + b
  }

  eq(add(1, 2), 3)
  eq(add.with(1, 2), 3)
  eq(add.with(1, 2, 9), 3)
  eq(add.with("hi", 2), null)
  eq(add.with(1, "hi"), null)
  throws(TypeError, () => add.ensure("", 1))
})
