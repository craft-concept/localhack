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
  state.plugins ??= [metadata, alias]

  if (!input.plugins) return runPlugins(state.plugins)(input)(state)

  const { add, remove, before, after } = input.plugins

  if (add) state.plugins.push(...add)

  for (const plug of remove ?? []) {
    const idx = state.plugins.indexOf(plug)
    if (idx >= 0) state.plugins.splice(idx, 1)
  }

  if (before) runPlugins(before)(input)(state)
  runPlugins(state.plugins)(input)(state)
  if (after) runPlugins(after)(input)(state)

  return state
})

export const engines = dispatch =>
  plugin("engines", ({ engines }) => state => {
    if (!engines) return
    const { add } = engines

    if (add) state.plugins.push(...add.map(f => f(dispatch)))
  })

/**
 * Plugin that logs the input objects.
 */
export const trace = plugin("trace", input => {
  console.log("input:", input)
})

/**
 * A sift instance configured with the standard plugins.
 */
export const standard = (state = {}) => make(plugins, state)
