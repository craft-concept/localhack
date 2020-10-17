/**
 * A single method `to()` is added to Object.
 */
declare interface Object {
  /** Pass this object to the given fn. */
  to<T>(fn: (item: this) => T): T
}

declare interface Array<T> {
  /** Pass this object to the given fn. */
  to<V>(fn: (item: this) => V): V
}

Object.defineProperty(Object.prototype, "to", {
  value: function to(fn: any) {
    return fn(this)
  },
})
