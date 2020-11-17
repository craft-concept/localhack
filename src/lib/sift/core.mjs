import {
  isDraft,
  produce,
  current as currentIm,
  original as originalIm,
} from "immer"
import { test } from "../testing.mjs"
import { iter } from "./edit.mjs"

export class DoubleSendError extends Error {
  constructor(inputs, state) {
    super("Cannot send while already sending.")
    this.inputs = inputs
    this.state = state
  }
}

/** The standard function for making a sift instance */
export const sift = (...inputs) => {
  const send = make()
  send(...inputs)
  return send
}

export const make = () =>
  function send(...inputs) {
    if (send.sending) throw new DoubleSendError(inputs, send.state)

    send.state ?? (send.state = {})

    return produce(inputs, inputs => {
      send.state = produce(send.state, state => {
        state.plugins ?? (state.plugins = [])

        for (const input of iter(inputs)) {
          if (typeof input === "function") state.plugins.push(input)

          send.sending = true
          const inputStage = state.plugins
          const transformStage = run(inputStage, input)
          const outputStage = run(transformStage, state)
          send.sending = false

          const outputResult = run(outputStage, send)
        }
      })
    })
  }

export const current = input => (isDraft(input) ? currentIm(input) : input)

export const original = input => (isDraft(input) ? originalIm(input) : input)

export const run = (fns, x) => {
  const out = []
  for (const fn of fns) out.push(...iter(fn(x)))
  return out.filter(x => typeof x === "function")
}

test(make, ({ eq, throws }) => {
  const send = make()
  send(
    input => state => {
      state.count ?? (state.count = 0)
      state.count++
    },
    input => {},
    input => (input.testing = true),
    input => state => send => {
      if (state.count == 3) send({ msg: "count is 3!" })
    },
  )

  eq(send({}), [{ testing: true }])
  eq(send.state.count, 5)
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


Should some stages run in reverse? What does the order affect?

`reverseIter` could be interesting.

Set of meta-plugins that gets the raw input, state, and send.

*/
