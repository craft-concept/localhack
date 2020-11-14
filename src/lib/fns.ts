export type ArgsOf<F> = F extends (...args: infer A) => any ? A : never

export function makeFn<F extends Function, F2>(
  fn: F,
  { name, ...props }: Partial<F2> & { name?: string },
): F & F2 {
  const fn2: any = copyFn(fn, name)
  return Object.assign(fn2, props)
}

/**
 * Duplicates a function, preserving its name and properties.
 */
export function copyFn<F extends Function>(fn: F, name = fn.name): F {
  const clone: any = function cloned(...args: any) {
    return fn.apply(this, args)
  }
  Object.defineProperty(clone, "name", { value: name })
  return Object.assign(clone, fn)
}

/** Partially apply a function */
export const pre = (fn, ...parts) => (...args) => fn(...parts, ...args)
