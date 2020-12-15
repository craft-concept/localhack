# Sift

Sift is an experimental data management library with an architecture similar to
Flux.

Note: Keep in mind that sift is something we're still playing around with; it
could be a terrible idea.

The core of Sift is the plugin. A plugin is a function of this shape:
`input => state => send => void`

The plugins are a bit strange however, in that both `input` and `state` are
immer Draft proxy objects. This means that plugins can freely mutate both
`input` and `state`.

Unlike Flux, the `input` objects are not necessarily actions in the traditional
form (`{ type: "AddTodo", todo: {...}}`). Instead, the `input` object is simply
some data you'd like to show to the system. The plugins inspect each input
object to determine if their logic applies. Some plugins might simply decorate
the `input` object with metadata and not touch the `state` at all.

Let's look at the code. We depend on `immer`, our testing lib, and some local
data-structure helpers.

```mjs
import { produce } from "immer"
import { test } from "./testing.mjs"
import { iter, current, iterate } from "./edit.mjs"
```

`make` is the small core of all sift instances. First, we create the `self`
function. `self` is the sift instance itself and holds the internal data.

You could imagine each sift instance as a little machine that gobbles up
objects. You can feed objects via `self(obj)` or `self.send(obj)`. `send`
returns an array of the updated inputs as well as any inputs sent internally by
plugins: `send(a, b) //=> [updatedA, updatedB, other, values]`.

```mjs
export function make(...metas) {
  function self(...inputs) {
    return self.send(...inputs)
  }

  self.self = self
  self.send = inputs => (self.inputs = inputs)

  self.meta = (...metas) => {
    for (const meta of iter(metas)) self.send = meta(self) || self.send
    return self
  }

  self.meta(originalPlugin, ...metas)

  return self
}
```

So far, we only have a single meta-plugin which defines our default behavior. We
plan to split this plugin into smaller parts, but it can be a bit of a
boondoggle to try and fold the sift core into itself.

This plugin implements:

- Send queueing of inputs sent while still processing an input.
- The regular plugin system: send fns to register plugins.
- The use of immer to produce immutable values between inputs.

```mjs
export function originalPlugin({ self }) {
  return (...inputs) => {
    if (self.sending) {
      self.queue ??= []
      self.queue.push(...iter(inputs))
      return inputs
    }

    self.sending = true
    self.state ??= {}

    const results = produce(inputs, inputs => {
      self.state = produce(self.state, state => {
        state.plugins ?? (state.plugins = [])

        for (const input of iter(inputs)) {
          if (typeof input === "function") state.plugins.push(input)

          runWith(state.plugins, input, state, self.send)
        }
      })
    })

    self.sending = false

    const queued = self.queue?.shift()
    if (queued) self.send(queued)

    return results
  }
}
```

Next, we define a couple helper functions:

```mjs
export const isFunction = x => typeof x === "function"

export const apply = (fn, x) => [...iter(fn(x))].filter(isFunction)
```

Each plugin runs in a series of stages: `input => state => send => {}`.

`run` executes a single stage and collects the returned functions. These
functions can then be passed to run along with the next stage's input.

```mjs
export function run(fns, x) {
  const out = []
  for (const fn of iter(fns)) out.push(...apply(fn, x))
  return out
}
```

`runWith` accepts a series of values (generally `input, state, send`) and uses
`run` to apply one after another to a set of plugins (`fns`). Each function in
`fns` can return another function which receives the next value in the series of
`steps`.

```mjs
export const runWith = (fns, ...steps) => {
  for (const step of steps) {
    fns = run(fns, step)
  }
}
```

Now we define some tests using our custom testing library. These only run when
`NODE_ENV=test`.

```mjs
test(make, ({ eq }) => {
  const self = make()

  self(
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

  eq(self({}), [{ testing: true }])
  eq(self.state.count, 6)
})
```

## Notes

I think it's important that we name each of these stages. This will both make
things more reasonable and encourage people to think with helpful concepts in
mind.

- Pre-Stage: Meta

  - `self => replacementSend`
  - Only possible during config time. Used for internals.

I think it could be neat to put the meta stage at the end:
`input => state => send => self => void`. Meta-plugins would be registered
separately and would be called an extra time with `self`. One neat side-effect
is that meta-plugins could still operate as standard plugins.

- Stage: Input

  - `input => { mutate(input) }`

- Stage: Transform `input => state => { mutate(input) & mutate(state) }`

- Stage: Output
  - `input => state => send => { send(futureInputs) }`

Set of meta-plugins that gets the raw input, state, and send. I guess that'd be
the same as simply replacing send.
