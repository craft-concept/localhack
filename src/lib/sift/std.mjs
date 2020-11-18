import { v4 as uuid } from "uuid"
import { current, original } from "./edit.mjs"

/**
 * Makes the previous state available. More of a simple plugin example than a
 * useful thing.
 */
export const previous = input => state => {
  state.previous = { ...original(state), previous: null }
}

/** Plugin that decorates the input with some additional metadata. */
export const metadata = input => {
  input.id || (input.id = uuid())
  input.ts || (input.ts = new Date().toISOString())
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
    Object.assign(state.config, input.config)
  }
}

/** Plugin that logs the input objects. */
export const trace = input => {
  console.log("input:", current(input))
}

/** The standard set of plugins. */
export const standard = [metadata, config, alias]

/** Set of plugins for debugging. */
export const debugging = [trace, previous]
