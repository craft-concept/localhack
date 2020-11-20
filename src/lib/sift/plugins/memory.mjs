import { v4 as uuid } from "uuid"
import { current, iter, entries, deepAssign } from "../edit.mjs"

export const acceptIndexes = input => state => {
  state.index ??= {}

  for (const [name, fn] of entries(input.index)) {
    state.index[name] = fn
    state[name] ??= state[name]
  }
}

export const findId = input => state => {
  if (input.id) return

  for (const [name, indexer] of entries(state.indexes)) {
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
  state.index ??= {}
  state.byId ??= {}

  input.id ??= uuid()
  input.createdAt ??= new Date().toISOString()

  deepAssign(input, state.byId[input.id])
  state.byId[input.id] = current(input)
}

export const writeIndexes = input => state => {
  if (!input.id) return

  for (const [name, indexer] of entries(state.index)) {
    state[name] ??= {}

    for (const key of iter(indexer(input))) {
      state[name][key] = input.id
    }
  }
}

export default [acceptIndexes, findId, populateFromId, writeIndexes]
