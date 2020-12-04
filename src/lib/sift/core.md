# Sift core

This file is our first attempt at converting LocalHack to a literate programming
environment. Our hope is that the entirety of the codebase can be written with
the human reader in mind.

We depend on `immer`, our testing lib, and some local data-structure helpers.

```js
import { produce } from "immer"
import { test } from "../testing.mjs"
import { iter, current, iterate } from "./edit.mjs"
```

First, we expose our standard function for creating a sift instance.

```js
export const sift = (...inputs) => {
  const send = make(originalPlugin)
  send(...inputs)
  return send
}
```

Our standard sift instance-creating function uses `make`. `make` creates a sift
instance and applies the given meta-plugins.

```js
export const make = (...metaPlugins) => root().meta(metaPlugins)
```

`root`: The small core of all sift instances. It doesn't do much more than
provide a `send` function and supports adding meta-plugins.

```js
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
```

So far, we only have a single meta-plugin which defines our default behavior. We
plan to split this plugin into smaller parts, but it can be a bit of a
boondoggle to try and fold the sift core into itself.

This plugin implements:

- Send queueing of inputs sent while still processing an input.
- The regular plugin system: send fns to register plugins.
- The use of immer to produce immutable values between inputs.

```js
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
```

Next, we define a couple helper functions:

```js
export const isFunction = x => typeof x === "function"

export const apply = (fn, x) => [...iter(fn(x))].filter(isFunction)
```

Each plugin runs in a series of stages: `input => state => send => {}`.

`run` executes a single stage and collects the returned functions. These
functions can then be passed to run along with the next stage's input.

```js
export const run = (fns, x) => {
  const out = []
  for (const fn of iter(fns)) out.push(...apply(fn, x))
  return out
}
```

`runWith` accepts a series of values (generally `input, state, send`) and uses
`run` to apply one after another to a set of plugins (`fns`). Each function in
`fns` can return another function which receives the next value in the series of
`steps`.

```js
export const runWith = (fns, ...steps) => {
  for (const step of steps) {
    fns = run(fns, step)
  }
}
```

Now we define some tests using our custom testing library. These only run when
`NODE_ENV=test`.

```js
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
```

## Notes

I think it's important that we name each of these stages. This will both make
things more reasonable and encourage people to think with helpful concepts in
mind.

- Pre-Stage: Meta

  - `send => replace(send)`
  - Only possible during config time. Used for internals.
  - Haven't made this one yet, but it would probably be useful.

- Stage: Input

  - `input => { mutate(input) }`

- Stage: Transform `input => state => { mutate(input) & mutate(state) }`

- Stage: Output
  - `input => state => send => { send(futureInputs) }`

Set of meta-plugins that gets the raw input, state, and send. I guess that'd be
the same as simply replacing send.
