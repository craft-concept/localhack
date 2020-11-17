export type ArgsOf<F> = F extends (...args: infer A) => any ? A : never

export function makeFn<F extends Function, F2>(
  fn: F,
  { name, ...props }: Partial<F2> & { name?: string },
): F & F2

export function copyFn<F extends Function>(fn: F, name?: string): F
