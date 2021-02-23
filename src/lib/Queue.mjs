class QueueLockError extends Error {
  constructor(name) {
    super(`This Queue${name && ` (${name})`} is already locked.`)
  }
}

export class Queue {
  constructor() {
    this.q = []
    this.push = (...items) => (this.q.push(...items), this)
  }

  async *[Symbol.asyncIterator]() {
    if (this.locked) throw new QueueLockError()
    this.locked = true
    while (this.q.length) yield this.q.shift()
  }
}
