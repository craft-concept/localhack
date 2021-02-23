class FutureSet {
  constructor() {
    this.pending = []
    this.createNext()
  }

  createNext() {
    this.next = new Promise((res, rej) => {
      this.resolve = res
      this.reject = rej
    })
  }

  add(thennable) {
    thennable.then(value => this.push(value))
    return this
  }

  push(value) {
    this.resolve(value)
    this.createNext()
  }

  async *[Symbol.asyncIterator]() {
    while (this.next) {
      yield await this.next
    }
  }
}

function defer() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  promise.resolve = resolve
  promise.reject = reject

  return promise
}

FutureSet.test?.(async ({ eq }) => {
  const set = new FutureSet()
  const a = defer()
  const b = defer()

  set.add(a).add(b)
})
