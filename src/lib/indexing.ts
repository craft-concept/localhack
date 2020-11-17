// /** An Index of records of type T. */
// export interface Index<T> {}

import { makeFn } from "./fns.mjs"
import { always, map, mapValues } from "./edit"

// export type Indexer<T> = (item: T) => string
// export type IndexerMap<T> = {
//   [name: string]: Indexer<T>
// }

// export type IndexDesc<T, M extends IndexerMap<T>> = M & {
//   id: keyof M
// }

// export const db = <T, M extends IndexerMap<T>>(
//   desc: IndexDesc<T, M>,
// ): Index<T> => ({
//   desc,
//   init() {
//     const data = {}
//   },
// })

export type Index<Cache> = { [key: string]: Cache }
export type Merge<T, C> = (record: T) => (cache?: C) => C
export type Derive<T> = (value: T) => string
export type Add<T, Cache> = (
  ...items: T[]
) => (idx: Index<Cache>) => Index<Cache>

export interface Indexer<T, Cache> {
  /** For use as a type: `typeof Foo.Index` */
  Index: Index<Cache>

  (indx: Index<Cache>): Cache

  init(): Index<Cache>
  derive: Derive<T>
  merge: Merge<T, Cache>
  add: (...items: T[]) => (idx: Index<Cache>) => {}
}

export const index = <T, Cache = T>(
  derive: Derive<T>,
  merge: Merge<T, Cache> = always as any,
) =>
  makeFn((x: T) => x, {
    derive,
    merge,
    init: () => ({}),
    add: (...items) =>
      map(Object.fromEntries(items.map(x => [derive(x), merge(x)]))),
  })

// export const db = (key, desc) => ({
//   byPath,
//   init: () => desc.to(mapValues(always({}))),
// })
