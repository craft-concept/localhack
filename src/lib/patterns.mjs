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

  Maybe: item => T.OneOf(T.Nil, item),

  Var: (name, pattern = T.Any) => ({
    __type: "var",
    name,
    pattern,
  }),
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

export const match = pattern => {
  if (isType(pattern)) return matchType(pattern)
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

export const isType = pattern =>
  pattern && typeof pattern === "object" && "__type" in pattern

export const matchObject = pattern => data => {
  if (typeof data !== "object") return false

  for (const key in pattern) {
    if (!(key in data)) return false
    if (!match(pattern[key])(data[key])) return false
  }

  return true
}

export const matchType = pattern => {
  switch (pattern.__type) {
    case "any":
      return _data => true

    case "nil":
      return data => data == null

    case "null":
      return data => data === null

    case "var":
      return match(pattern.pattern)

    default:
      return data => pattern.__type === typeof data
  }
}
