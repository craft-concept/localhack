import { v4 as uuid } from "uuid"
import { current, iter, entries, deepAssign } from "../edit.mjs"

/** Records sent indexes. */
export const acceptIndexes = input => state => {
  state.indexers ??= {}

  for (const [name, fn] of entries(input.indexers)) {
    state.indexers[name] = fn
    state[name] ??= state[name]
  }
}

/** Use our recorded indexes to find ids for id-less inputs. */
export const findId = input => state => {
  if (input.id) return

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

export const populateFromId = input => state => {
  state.byId ??= {}

  input.id ??= uuid()
  input.createdAt ??= new Date().toISOString()

  const cache = (state.byId[input.id] ??= {})
  deepAssign(cache, current(input))
  deepAssign(input, current(cache))
}

export const writeIndexes = input => state => {
  if (!input.id) return

  for (const [name, indexer] of entries(state.indexers)) {
    state[name] ??= {}

    for (const key of iter(indexer(input))) {
      state[name][key] = input.id
    }
  }
}

export default [acceptIndexes, findId, populateFromId, writeIndexes]
