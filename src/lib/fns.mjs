/**
 * Make a new function from the given `fn` with changed name and properties.
 */
export function makeFn(fn, { name, ...props }) {
  const fn2 = copyFn(fn, name)
  return Object.assign(fn2, props)
}

/**
 * Add properties to a function.
 */
export function fnWith({ name, ...props }, fn) {
  Object.defineProperty(fn, "name", { value: name || fn.name })
  return Object.assign(fn, props)
}

/**
 * Duplicates a function, preserving its name and properties.
 */
export function copyFn(fn, name = fn.name) {
  const clone = function cloned(...args) {
    return fn.apply(this, args)
  }

  Object.defineProperty(clone, "name", { value: name })
  return Object.assign(clone, fn)
}

/** Partially apply a function */
export const pre = (fn, ...parts) => (...args) => fn(...parts, ...args)
