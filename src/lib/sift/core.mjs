import { produce } from "immer"
import { test } from "../testing.mjs"
import { iter, current } from "./edit.mjs"

/** The standard function for making a sift instance */
export const sift = (...inputs) => {
  const send = make()
  send(...inputs)
  return send
}

export const make = () =>
  /**
   * Simultaneous sends are queued and processed after the current inputs.
   */
  function send(...inputs) {
    if (send.sending) {
      send.queue || (send.queue = [])
      send.queue.push(...inputs)
      return inputs
    }

    send.sending = true
    send.state ?? (send.state = {})

    const result = produce(inputs, inputs => {
      send.state = produce(send.state, state => {
        state.plugins ?? (state.plugins = [])

        for (const input of iter(inputs)) {
          if (typeof input === "function") state.plugins.push(input)

          const inputStage = current(state.plugins)
          const transformStage = run(inputStage, input)
          const outputStage = run(transformStage, state)
          run(outputStage, send)
        }
      })
    })

    send.sending = false

    /**
     * Sending one at a time helps the stack grow quicker and thus helps
     * detect broken plugins.
     */
    const queued = send.queue?.pop()
    if (queued) send(queued)
    return result
  }

export const run = (fns, x) => {
  const out = []
  for (const fn of iter(fns)) out.push(...iter(fn(x)))
  return out.filter(x => typeof x === "function")
}

test(make, ({ eq }) => {
  const send = make()
  send(
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
