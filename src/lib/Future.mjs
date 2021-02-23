/**
 * A promise that is not executed until the first time it is thenned.
 */
export class Future {
  static of(fn) {
    return new this(fn)
  }

  constructor(execute) {
    this.watchers = []
    this.execute = execute
  }

  get promise() {
    if (this._promise) return this._promise
    this._promise = Promise.resolve(this.execute())

    for (const fn in this.watchers) this.watch(fn)
    this.watchers = []
    return this._promise
  }

  then(thenFn, catchFn) {
    return this.promise.then(thenFn, catchFn)
  }

  catch(fn) {
    return this.promise.catch(undefined, catchFn)
  }

  watch(fn) {
    this._promise?.then(fn) || this.watchers.push(fn)
  }
}

Future.test?.(async ({ eq }) => {
  let executeCount = 0
  const a = Future.of(() => executeCount++)

  await a
  eq(executeCount, 1)
  await a
  eq(executeCount, 1)
})
