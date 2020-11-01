export function makeFn<F extends Function, F2>(
  fn: F,
  props: Partial<F2>,
): F & F2 {
  const fn2: any = copyFn(fn, (props as any).name)
  return Object.assign(fn2, props)
}

/**
 * Duplicates a function, preserving its name and properties.
 */
export function copyFn<F extends Function>(fn: F, name = fn.name): F {
  const clone: any = (...args: any) => fn(...args)
  Object.defineProperty(clone, "name", { value: name })
  return Object.assign(clone, fn)
}
