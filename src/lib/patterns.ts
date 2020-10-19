import { makeFn } from "./fns"

export interface Fn<I, O = void> {
  (input: Data<I>): Data<O>
  input: I
  output: O
}

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
