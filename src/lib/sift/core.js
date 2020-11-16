import produce, { enableMapSet } from "immer"

/** Enable immer Map and Set support. */
enableMapSet()

/** Easily make a function with attached properties. */
export function makeFn(fn, { name, ...props }) {
  return Object.assign(copyFn(fn, name), props)
}

/**
 * Duplicates a function, preserving its name and properties.
 */
export function copyFn(fn, name = fn.name) {
  function clone(...args) {
    return fn.apply(this, args)
  }
  Object.defineProperty(clone, "name", { value: name })
  return Object.assign(clone, fn)
}

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

/** Make a dispatcher. Call it to add plugins, etc. */
export const make = (start, state = {}) => {
  const step = start(dispatch)
  return dispatch

  function dispatch(input) {
    if (input !== undefined) {
      const fn = step(input)
      if (fn) state = fn(state)
    }
    return state
  }
}
