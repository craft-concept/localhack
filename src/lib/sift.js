import { T } from "./patterns"
import { v4 as uuid } from "uuid"
import { makeFn } from "./fns"

export const identity = x => x
export const nop = x => {}

export const { assign } = Object

export const set = values => state => void assign(state, values)

/**
 * Used to define plugins. A plugin is a function of some input object.
 * The input is an immer Draft. You can modify the input before it reaches
 * later plugins.
 *
 * Using immer should allow us to capture the set of changes made by each
 * plugin. It could also be cool to support automerge documents.
 *
 * A pattern can be assigned to the `input` prop and later on, we'll likely
 * probably add pattern matching.
 */
export const plugin = (props, fn) => {
  if (typeof props === "string") props = { name: props }

  return makeFn(fn, props)
}

/**
 * Apply the plugins to the input. Mutates the input and returns a function
 * that mutates state.
 */
export const runPlugins = plugins => input => {
  const fns = []

  /** We first run the input through all of the plugins. */
  for (const plugin of plugins) {
    const res = runPlugin(plugin)(input)
    if (typeof res === "function") fns.push(res)
  }

  return state => {
    for (const fn of fns) {
      fn(state)
    }
  }
}

/**
 * Run a single stage of the `plugin` on the `input`. Optionally returns a fn
 * to be used on the next stage.
 */
export const runPlugin = plugin => input => mapRes(plugin(input))

/**
 * Convert a plugin return value to a function for the next stage.
 */
export const mapRes = res => {
  switch (res == null ? res : typeof res) {
    /** Undefined means the plugin is done. */
    case undefined:
    /** Not quite sure what to do with null. */
    case null:
    /** Return a function to be applied on the next stage. */
    case "function":
      return res

    /** A shortcut for mapping over a set of keys. */
    case "object":
      if (Array.isArray(input)) {
        for (const plug of input) {
          runPlugin(plug)(input)
        }
      }

      return state => {
        for (const k in res) {
          state[k] = runPlugin(res[k])(state[k])
        }
      }
  }
}

/**
 * Makes the previous state available. More of a simple plugin example than a
 * useful thing.
 */
export const previous = plugin(
  { name: "previous", input: T.Any },
  input => state => {
    state.previous = produce(original(state), set({ previous: null }))
  },
)

/**
 * Plugin that decorates the input with some additional metadata.
 */
export const metadata = plugin("metadata", input => {
  input.id ??= uuid()
  input.ts ??= Date.now()
})

/**
 * Plugin that allows aliasing this input as an alias field
 */
export const alias = plugin("alias", input => {
  if (input.alias) return set({ [input.alias]: input })
})

export const plugins = plugin("plugins", input => state => {
  if (input.plugin) state.plugins.push(input.plugin)
  if (input.plugins) state.plugins.push(...input.plugins)
  if (state.plugins) return runPlugins(state.plugins)(input)(state)
})

/** The initial state of all  instances. */
export const init = {
  session: { id: uuid() },
  plugins: [metadata, alias, previous],
}

/** Make a dispatcher. Call it to add plugins, etc. */
export const make = () => {
  let state = init
  return function dispatch(input) {
    if (input !== undefined) state = produce(state, plugins(input))
    return state
  }
}
