import { Enum } from "./Enum"

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

  *[Symbol.iterator]() {
    if (this.locked) throw new QueueLockError()
    this.locked = true
    while (this.q.length) yield this.q.shift()
    this.locked = false
  }

  async *[Symbol.asyncIterator]() {
    yield* this
  }
}

Queue.test?.(({ eq }) => {
  const q = new Queue()

  q.push(1, 2, 3)

  eq([...q], [1, 2, 3])
  eq([...q], [])
})
