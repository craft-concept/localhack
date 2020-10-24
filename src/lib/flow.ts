export type Dispatch<A> = (action: A) => void
export type Dispatcher<A, S> = (action?: A) => S
export type Init<S> = () => S

export type Cleanup = () => void | Promise<void>

export type Props<A, S> = {
  state: S
  dispatch: Dispatch<A>
}

export type Listener<S> = (state: S) => void | Cleanup | Promise<void | Cleanup>

export type Engine<A, S> = (
  dispatch: Dispatch<A>,
) => Listener<S> | Promise<Listener<S>>

export type Transform<S> = (state: S) => S
export type Update<A, S> = (action: A) => Transform<S> | undefined

export interface Plugin<A, S> {
  init: Init<S>
  update: Update<A, S>

  engine?: Engine<A, S>
}

export interface Store<A, S> {
  readonly state: S
  readonly dispatching: boolean
  dispatch: Dispatcher<A, S>
  plugin: Plugin<A, S>
}

export function make<A, S>(plugin: Plugin<A, S>): Store<A, S> {
  let state = plugin.init()

  const store = {
    plugin,
    dispatching: false,
    get state() {
      if (store.dispatching)
        throw new Error("Cannot access state during dispatch")
      return state
    },
    dispatch,
  }

  const listener = makeListener(plugin.engine?.(store.dispatch))

  function dispatch(action?: A): S {
    if (store.dispatching)
      throw new Error(
        `Already dispatching. Dispatching ${JSON.stringify(action)}`,
      )

    if (action != null) {
      store.dispatching = true
      state = plugin.update(action)?.(state) ?? state
      store.dispatching = false
    }

    listener(state)

    return state
  }

  return store
}

export function makeListener<S>(
  listener: Listener<S> | Promise<Listener<S>>,
): Listener<S> {
  if (typeof listener === "function") return listener

  let prevState: any = undefined
  let onState = (state: any) => {
    prevState = state
  }

  listener.then(cb => {
    onState = cb
    prevState !== undefined && onState(prevState)
  })

  return state => onState(state)
}
