import { makeFn } from "./fns"

export interface Fn<P, O = void> {
  (input: Data<P>): Data<O>
  pattern: P
  output: O
}

export function fn<P, O = void>(
  pattern: P,
  f: (value: Data<P>) => Data<O>,
  output?: O,
): Fn<P, O> {
  return makeFn<Fn<P, O>>(f, {
    pattern,
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
