import * as uuid from "uuid"
import { current, iter, entries, deepAssign } from "../lib/edit.mjs"

export function handleFunctionIds(input) {
  if (typeof input.id !== "function") return

  input.id = input.id(uuid.v4)
}

/** Records sent indexes. */
export const acceptIndexes = input => state => {
  state.indexers ??= {}

  for (const [name, fn] of entries(input.indexers)) {
    state.indexers[name] = fn
    state[name] ??= state[name]
  }
}

/** Use our recorded indexes to find ids for id-less inputs. */
export function findId(input) {
  if (input.id) return

  return state => {
    for (const [name, indexer] of entries(state.indexers)) {
      const index = state[name]
      if (!index) return

      for (const key of iter(indexer(input))) {
        if (index[key]) {
          input.id = index[key]
          return
        }
      }
    }
  }
}

/**
 * Update our cache with data from the input and fill in the input's properties
 * with values from the cache.
 */
export const populateFromId = input => state => {
  if (!input.id) return

  state.byId ??= {}
  const cached = state.byId[input.id]

  if (cached) {
    deepAssign(cached, current(input))
    deepAssign(input, current(cached))
  }
}

/**
 * Index the current input using our indexers. If the input can be indexed and
 * has no id, then it is given one.
 */
export const writeIndexes = input => state => {
  for (const [name, indexer] of entries(state.indexers)) {
    state[name] ??= {}

    for (const key of iter(indexer(input))) {
      input.id ??= uuid.v4()
      input.createdAt ??= new Date().toISOString()

      state[name][key] = input.id
    }
  }
}

/**
 * Cache any input that has an id.
 */
export function writeToCache(input) {
  if (!input.id) return

  state.byId ??= {}
  const cached = (state.byId[input.id] ??= {})

  deepAssign(cached, current(input))
  deepAssign(input, current(cached))
}

export default [
  acceptIndexes,
  findId,
  populateFromId,
  writeIndexes,
  writeToCache,
]
