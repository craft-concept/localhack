import { v4 as uuid } from "uuid"
import produce, { original } from "immer"
import { make, plugin, set, runPlugins } from "../core.js"

/**
 * Makes the previous state available. More of a simple plugin example than a
 * useful thing.
 */
export const previous = plugin("previous", input => state => {
  state.previous = produce(original(state), set({ previous: null }))
})

/**
 * Plugin that decorates the input with some additional metadata.
 */
export const metadata = plugin("metadata", input => {
  input.id ??= uuid()
  input.ts ??= new Date().toISOString()
})

/**
 * Plugin that allows aliasing this input as an alias field
 */
export const alias = plugin("alias", input => {
  if (input.alias) return set({ [input.alias]: input })
})

/**
 * Plugin that enables adding plugins through inputs and running the plugins on
 * each step.
 */
export const plugins = plugin("plugins", input => state => {
  if (input.plugin) state.plugins.push(input.plugin)
  if (input.plugins) state.plugins.push(...input.plugins)
  if (state.plugins) return runPlugins(state.plugins)(input)(state)
})

/**
 * Plugin that logs the input objects.
 */
export const trace = plugin("trace", input => {
  console.log("input:", input)
})

/** Plugin that sets the default initial state. */
export const init = input => state => {
  state.session ??= { id: uuid() }
  state.plugins ??= [metadata, alias]
}

/**
 * A sift instance configured with the standard plugins.
 */
export const standard = (state = {}) => make(produce(state, init({})), plugins)
