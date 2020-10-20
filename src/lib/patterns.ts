import { makeFn } from "./fns"

/**
 * A "logic variable". Used to express equality within patterns.
 */
export type LVar = { __type: "LVar"; name: string; shape?: Shape }
export const lvar = (name: string, shape?: Shape): LVar => ({
  __type: "LVar",
  name,
  shape,
})

export type Type = keyof TypeMap
export interface TypeMap {
  lvar: LVar
  string: string
  number: number
  object: ShapeObj
  shape: Shape
}

export type Shape = string | number | LVar | ShapeObj
export interface ShapeObj {
  [key: string]: Shape
}

/**
 * `Data<typeof pattern>` evaluates to the proper TS type for data that
 * matches the given pattern.
 */
export type Data<P> = P extends typeof String
  ? string
  : P extends typeof Number
  ? number
  : P extends typeof Boolean
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

export interface Field {
  name: string | LVar
  value: Shape
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
