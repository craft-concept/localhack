import { makeFn } from "./fns"

export const T = {
  Any: { __type: "any" as "any" },
  String: { __type: "string" as "string" },
  Number: { __type: "number" as "number" },
  Boolean: { __type: "boolean" as "boolean" },
}

/**
 * A "logic variable". Used to express equality within patterns.
 */
export type LVar = { __type: "lvar"; name: string; pattern?: Pattern }
export const lvar = (name: string, pattern: Pattern = T.Any): LVar => ({
  __type: "lvar",
  name,
  pattern,
})

export type Type = keyof TypeMap

export interface TypeMap {
  lvar: LVar
  string: string
  number: number
  boolean: boolean
  object: PatternObj
  pattern: Pattern
}

export type PatternType =
  | LVar
  | typeof T.Any
  | typeof T.String
  | typeof T.Number
  | typeof T.Boolean

export type PatternValue = string | number | boolean
export type Pattern = PatternValue | PatternType | Pattern[] | PatternObj

export interface PatternObj {
  [name: string]: Pattern
}

/**
 * `Data<typeof pattern>` evaluates to the proper TS type for data that
 * matches the given pattern.
 */
export type Data<P> = P extends string | number | boolean
  ? P
  : P extends typeof T.String
  ? string
  : P extends typeof T.Number
  ? number
  : P extends typeof T.Boolean
  ? boolean
  : P extends Array<infer T>
  ? T[]
  : P extends object
  ? { [K in keyof P]: Data<P[K]> }
  : void

/**
 * A function with attached input and output patterns.
 */
export interface Fn<I, O = void> {
  (input: Data<I>): Data<O>
  input: I
  output: O
}

/**
 * Define a function that exposes its input and output types as patterns.
 */
export function fn<I, O = void>(
  input: I,
  f: (value: Data<I>) => Data<O>,
  output?: O,
): Fn<I, O> {
  return makeFn<Fn<I, O>>(f, {
    input,
    output,
  })
}

export interface Matcher<T extends Pattern> {
  (data: any): data is Data<T>
}

export const isType = (pattern: Pattern): pattern is PatternType =>
  pattern && typeof pattern === "object" && "__type" in pattern

export const match = <T extends Pattern>(pattern: T): Matcher<T> => {
  if (isType(pattern)) return matchType(pattern)
  if (Array.isArray(pattern)) throw new Error("Can't match arrays yet.")

  // Handle literals
  switch (typeof pattern) {
    case "string":
    case "number":
    case "boolean":
      return (data: Data<T>): data is Data<T> => data === pattern

    case "object":
      return matchObject(pattern as any)
  }
}

export const matchObject = <T extends PatternObj>(pattern: T): Matcher<T> => (
  data: any,
): data is Data<T> => {
  if (typeof data !== "object") return false

  for (const key in pattern) {
    if (!(key in data)) return false
    if (!match(pattern[key])(data[key])) return false
  }

  return true
}

export const matchType = <T extends PatternType>(pattern: T): Matcher<T> => {
  switch (pattern.__type) {
    case "any":
      return (_data: any): _data is Data<T> => true

    case "lvar":
      return match((pattern as any).pattern)

    default:
      return (data: any): data is Data<T> => pattern.__type === typeof data
  }
}
