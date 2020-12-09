import { fnWith } from "../lib/fns.mjs"
import { current, original, deepAssign, keys, entries } from "../lib/edit.mjs"
import * as memory from "./memory.mjs"

/**
 * Makes the previous state available. More of a simple plugin example than a
 * useful thing.
 */
export const previous = input => state => {
  state.previous = { ...original(state), previous: null }
}

/** Plugin that allows aliasing this input as an alias field. */
export const alias = input => {
  if (typeof input.alias === "string") state[input.alias] = input
}

/** Plugin that enables easy configuration. */
export const config = input => {
  if (typeof input.config !== "object") return

  return state => {
    state.config || (state.config = {})
    deepAssign(state.config, input.config)
  }
}

/** Plugin that logs the input objects. */
export const logInputs = input => {
  console.log("input:", current(input))
}

export const trace = key =>
  function trace(input) {
    if (key in input) console.log(`input.${key}:`, input[key])
  }

/** The standard set of plugins. */
export const standard = [memory.default, config, alias]

/** Set of plugins for debugging. */
export const debugging = []
