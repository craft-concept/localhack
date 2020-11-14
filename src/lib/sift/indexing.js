import { makeFn } from "../fns"

export function index(derive, merge = always) {
  return makeFn(x => x, {
    derive,
    merge,
    init: () => ({}),
    add: (...items) =>
      map(Object.fromEntries(items.map(x => [derive(x), merge(x)]))),
  })
}
