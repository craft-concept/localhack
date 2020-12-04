We depend on `immer`, our testing lib, and some local data-structure helpers.

```js
import { produce } from "immer"
import { test } from "../testing.mjs"
import { iter, current, iterate } from "./edit.mjs"
```

```js
/** The standard function for making a sift instance */
export const sift = (...inputs) => {
  const send = make(originalPlugin)
  send(...inputs)
  return send
}

export const make = (...metaPlugins) => root().meta(metaPlugins)

export const root = () => {
  send.send = send
  send.next = () => {}
  send.meta = (...fns) => {
    for (const fn of iter(fns)) send.next = fn(send) || send.next
    return send
  }
  return send

  function send(...inputs) {
    return send.next(inputs)
  }
}

export const originalPlugin = ({ send }) => inputs => {
  if (send.sending) {
    send.queue || (send.queue = [])
    send.queue.push(...iter(inputs))
    return inputs
  }

  send.sending = true
  send.state ?? (send.state = {})

  const result = produce(inputs, inputs => {
    send.state = produce(send.state, state => {
      state.plugins ?? (state.plugins = [])

      for (const input of iter(inputs)) {
        if (typeof input === "function") state.plugins.push(input)

        runWith(state.plugins, input, state, send)
      }
    })
  })

  send.sending = false

  /**
   * Sending one at a time helps the stack grow quicker and thus helps
   * detect broken plugins.
   */
  const queued = send.queue?.shift()
  if (queued) send(queued)

  return result
}

export const isFunction = x => typeof x === "function"

export const apply = (fn, x) => [...iter(fn(x))].filter(isFunction)

export const run = (fns, x) => {
  const out = []
  for (const fn of iter(fns)) out.push(...apply(fn, x))
  return out
}

export const runWith = (fns, ...steps) => {
  for (const step of steps) {
    fns = run(fns, step)
  }
}

test(make, ({ eq }) => {
  const send = sift(
    input => state => {
      state.count ?? (state.count = 0)
      state.count++
    },
    input => {},
    input => (input.testing = true),
    input => state => send => {
      if (state.count === 4) send({ msg: "count is 4!" })
    },
  )

  eq(send({}), [{ testing: true }])
  eq(send.state.count, 6)
})

/*

I think it's important that we name each of these stages. This will both make
things more reasonable and encourage people to think with helpful concepts
in mind.

- Pre-Stage: Meta
  - `send => replace(send)`
  - Only possible during config time. Used for internals.
  - Haven't made this one yet, but it would probably be useful.

- Stage: Input
  - `input => { mutate(input) }`

- Stage: Transform
  `input => state => { mutate(input) & mutate(state) }`

- Stage: Output
  - `input => state => send => { send(futureInputs) }`

Set of meta-plugins that gets the raw input, state, and send.
I guess that'd be the same as simply replacing send.

*/
```
