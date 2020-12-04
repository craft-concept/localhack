/** Returns whether the given object a plain Object. */
export const isObj = obj =>
  obj != null &&
  typeof obj === "object" &&
  Object.getPrototypeOf(obj) === Object.prototype

export const T = {
  // Primitives
  Number: x => Number(One(x)),
  String: x => String(One(x)),
  Boolean: x => Boolean(One(x)),

  // Collections
  Set: x => (x instanceof Set ? x : new Set(T.Iterable(x))),
  Array: x => (Array.isArray(x) ? x : [...T.Iterable(x)]),
  Object: x => {
    if (x == null) return {}
    if (isObj(x)) return x
    return {}
  },

  // Special
  Iterable: x => {
    if (x == null) return []
    if (x instanceof Map) return x.keys()
    if (typeof x === "object" && Symbol.iterator in x) return x
    return [x]
  },

  One: x => {
    for (const v of T.Iterable(x)) {
      return v
    }
  },
}
