import { Stream, producerStream } from "@funkia/hareactive"

export { Future, Stream, producerStream as produce } from "@funkia/hareactive"

export type Listener<Args extends any[]> = (...args: Args) => void

export interface EventMap {
  [eventName: string]: any[]
}

export interface Emitter<T extends EventMap> {
  on<K extends keyof T>(name: K, cb: Listener<T[K]>): this
  off<K extends keyof T>(name: K, cb: Listener<T[K]>): this
}

export function eventArgsStream<T extends EventMap, K extends keyof T>(
  target: Emitter<T>,
  name: K,
): Stream<T[K]> {
  return producerStream(push => {
    const onEvent = (...args: T[K]) => push(args)

    target.on(name, onEvent)

    return () => {
      target.off(name, onEvent)
    }
  })
}
