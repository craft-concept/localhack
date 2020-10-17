import { Transform } from "./flow"

export const identity = <T>(x: T): T => x
export const always = <T>(x: T) => () => x
export const tap = <T, R extends any[] = []>(
  fn: (x: T, ...rest: R) => void,
) => (x: T, ...rest: R) => (fn(x, ...rest), x)
export const each = <T>(fn: (x: T) => void) => tap<T[]>(xs => xs.forEach(fn))

export const set = <T, S extends T>(partial: T): Transform<S> => state => {
  const res = partial as S
  const out = {} as S
  for (const k in state) {
    out[k] = k in res ? res[k] : state[k]
  }
  return out
}

export function clone<T extends object | any[]>(v: T): T {
  if (Array.isArray(v)) {
    return [...v] as T
  } else {
    return { ...v }
  }
}

export type KeyMap<T> = {
  [K in keyof T]: (v: T[K]) => T[K]
}

export const edit = <T, S extends T>(
  editFn: (state: S) => T,
): Transform<S> => state => set<T, S>(editFn(state))(state)

export const mut = <T extends object | any[]>(mutFn: (item: T) => void) => (
  item: T,
) => tap(mutFn)(clone(item))

export const map = <T, S extends T>(mapFns: KeyMap<T>): Transform<S> =>
  edit(state => {
    let changes = {} as T
    for (const k in mapFns) {
      changes[k] = mapFns[k](state[k])
    }
    return changes
  })

export type Obj<T> = { [key: string]: T }

export const mapValues = <T, V>(entryFn: (val: T, key: string) => V) => (
  obj: Obj<T>,
): Obj<V> => {
  const out = {} as Obj<V>
  for (const k in obj) {
    out[k] = entryFn(obj[k], k)
  }
  return out
}

export const makeObj = <T, V>(
  items: T[],
  fn: (item: T) => [string, V],
): Obj<V> => Object.fromEntries(items.map(fn))

export const mapWhen = <T>(pred: (item: T) => boolean, fn: (item: T) => T) => (
  items: T[],
): T[] => items.map(item => (pred(item) ? fn(item) : item))

export const apply = <T>(v: T, applyFn?: (v: T) => T) => applyFn?.(v) ?? v
export const toggle = (v: boolean) => !v

export const pipe = <T>(...pipeFns: Transform<T>[]) => (val: T): T =>
  pipeFns.reduce(apply, val)

export const push = <T>(...vals: T[]) => (list: T[]) => [...list, ...vals]
