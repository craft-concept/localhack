import { isObj } from "./edit.mjs"

export const Set = x => (x instanceof Set ? x : new Set(Iterable(x)))

export const Array = x => (Array.isArray(x) ? x : [...Iterable(x)])

export const Iterable = x => {
  if (x == null) return []
  if (x instanceof Map) return x.keys()
  if (Symbol.iterator in x) return x
  return [x]
}

export const Object = x => {
  if (x == null) return {}
  if (isObj(x)) return x
  return {}
}

export const Number = x => Number(One(x))
export const String = x => String(One(x))
export const Boolean = x => Boolean(One(x))

export const One = x => {
  for (const v of Iterable(x)) {
    return v
  }
}
