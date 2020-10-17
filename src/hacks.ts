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

Object.prototype.to = function to(fn) {
  return fn(this)
}
