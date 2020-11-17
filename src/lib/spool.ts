import { ArgsOf, makeFn } from "./fns"

export interface SpoolDesc<S> {
  [name: string]: (...args: any[]) => (state: S) => S
}

export type Spool<S, D extends SpoolDesc<S>> = {
  [K in keyof D]: (...args: ArgsOf<D[K]>) => Spool<S, D>
}

export function spool<S, D extends SpoolDesc<S>>(
  desc: D,
): (init: S) => Spool<S, D> {
  function Spool(v: S) {
    if (!(this instanceof Spool)) return new (Spool as any)(v)

    this.v = v
  }

  const proto: any = (Spool.prototype = {
    valueOf() {
      return this.v
    },
    toString() {
      return String(this.v)
    },
    toJSON() {
      return this.v
    },
  })

  for (const k in desc)
    proto[k] = makeFn(
      function fn(...args: any[]) {
        return Spool(desc[k](...args)(this.v))
      },
      {
        name: k,
      },
    )

  return Spool
}

export async function tests() {
  const { deepEqual } = await import("./testing.mjs")
  const num = spool({
    add: x => (s: number) => s + x,
    sub: x => (s: number) => s - x,
  })

  deepEqual(+num(3).add(4).sub(1), 6)
}
