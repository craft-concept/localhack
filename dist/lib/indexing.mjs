// /** An Index of records of type T. */
// export interface Index<T> {}
import { makeFn } from "./fns.mjs";
import { always, map } from "./edit";
export const index = (derive, merge = always) => makeFn((x) => x, {
    derive,
    merge,
    init: () => ({}),
    add: (...items) => map(Object.fromEntries(items.map(x => [derive(x), merge(x)]))),
});
// export const db = (key, desc) => ({
//   byPath,
//   init: () => desc.to(mapValues(always({}))),
// })
