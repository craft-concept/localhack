import Kefir from "kefir"

import Promise from "lib/PromisePlus"
import { def } from "lib/Precursor"
import { iter } from "lib/Enum"

let Stream = Kefir

def.call(Kefir.Observable.prototype, {
  name: "Observable",

  deep() {
    return this.flatMap(Stream.deep)
  },

  awaitValues() {
    return this.flatMap(Stream.fromPromise)
  },

  /**
   * End on any error.
   */
  clean() {
    return this.takeErrors(1)
  },

  tap(fn) {
    return this.map(v => (fn(v), v))
  },

  tapErrors(fn) {
    return this.mapErrors(err => (fn(err), err))
  },

  get then() {
    let p = this.toPromise()
    return p.then.bind(p)
  },
})

def.call(Kefir, {
  name: "Stream",

  isStream(v) {
    return v instanceof Kefir.Observable
  },

  make(fn) {
    return this.stream(emitter => {
      try {
        let res = fn(emitter)

        if (Promise.is(res)) {
          res.catch(emitter.error)
          return () => res.cancel?.()
        } else {
          return res
        }
      } catch (err) {
        emitter.error(err)
        emitter.end()
      }
    })
  },

  deep(x) {
    if (x == null) return Stream.never()

    if (typeof x == "object") {
      if (x instanceof Map) x = x.values()

      if (Symbol.iterator in x) return Stream.iterate(x).flatMap(Stream.deep)
      if (Symbol.asyncIterator in x)
        return Stream.fromAsync(x).flatMap(Stream.deep)
      if (Promise.is(x)) return Stream.fromPromise(x).flatMap(Stream.deep)
      if (Stream.isStream(x)) return x.flatMap(Stream.deep)
    }

    return Stream.constant(x)
  },

  fromAsync(asyncIterable) {
    return this.make(async emitter => {
      try {
        for await (let value of asyncIterable) emitter.value(value)
      } catch (err) {
        emitter.error(err)
      }

      emitter.end()
    })
  },

  iterate(iterable) {
    return this.make(emitter => {
      for (let value of iterable) emitter.value(value)
      emitter.end()
    })
  },
})

export default Stream

let p = Stream.Observable.prototype

Stream.deep.test?.(async ({ eq }) => {
  eq(await Stream.deep(2), 2)
  eq(await Stream.deep([2, 3]), 3)
  eq(await Stream.deep(Promise.resolve(4)), 4)
})

Stream.isStream.test?.(({ eq }) => {
  eq(Stream.isStream({}), false)
  eq(Stream.isStream(Stream.never()), true)
  eq(Stream.isStream(Stream.stream(e => e.end())), true)
})

p.tap.test?.(async ({ eq }) => {
  let s1 = Stream.constant(1).tap(x => eq(x, 1))
  eq(await s1, 1)
  eq(await s1.tap(x => eq(x, 1)), 1)
})

p.awaitValues.test?.(async ({ eq }) => {
  eq(await Stream.constant(Promise.resolve("awaitMe")).awaitValues(), "awaitMe")
})
