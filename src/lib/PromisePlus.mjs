export class UncancellableError extends Error {
  constructor() {
    super("This Promise cannot be cancelled.")
  }
}

export default class PromisePlus extends Promise {
  static of(fn) {
    return new this(fn)
  }

  static is(x) {
    return (
      x != null &&
      typeof x == "object" &&
      "then" in x &&
      typeof x.then == "function"
    )
  }

  constructor(fn) {
    let onCancel
    super((res, rej) => {
      onCancel = fn(res, rej)
    })

    if (typeof onCancel == "function") this.onCancel = onCancel
  }

  get cancelled() {
    return this._cancelled || this.parent?.cancelled || false
  }

  cancel(reason) {
    if (this.parent) return this.parent.cancel(reason)
    if (!this.onCancel) throw new UncancellableError()
    this._cancelled = true
    return this.onCancel(reason)
  }

  then(onRes, onRej) {
    const next = super.then(onRes, onRej)
    next.parent = this
    return next
  }
}

PromisePlus.test?.(({ eq, throws }) => {
  const p = new PromisePlus(res => res(1))
  eq(p.then(() => {}).constructor, PromisePlus)
  p.then(v => eq(v, 1))
  throws(UncancellableError, () => p.cancel())
})
