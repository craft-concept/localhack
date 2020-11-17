import { produce } from "immer"
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
  const send = make(withPlugins)
  send(...inputs)
  return send
}

const start = (...plugins) =>
  function send(input) {
    for (const plugin of iter(plugins)) {
      send = plugin(send)(input)
    }
    return send
  }

// export function make2(...plugins) {
//   return function* send(...inputs) {
//     for (const input of iter(inputs))
//       yield produce(input, input => {
//         for (const plugin of iter(plugins))
//           for (const transform of iter(plugin(input))) {
//             if (typeof x === "function") {
//               transform()
//             }
//           }
//       })
//   }
// }

// /** Meta-plugin that iterates over inputs. */
// function* iteratingSend(...inputs) {
//   for (const input of iter(inputs)) yield* send(input)
// }

// const stages = input => state => send => (...inputs) => {
//   return next(input)?.(state)?.(send)
// }

function* inputStage(...inputs) {}

// /** Meta-plugin that iterates over inputs. */
// const iterateInputs = send =>
//   function* iteratingSend(...inputs) {
//     for (const input of iter(inputs)) yield* send(input)
//   }

function* stages(send) {
  return input => {
    yield * send(input)
  }
  yield send
}

/**
 * Accepts a single plugin of the form: `input => state => send => void`
 */
export const make = step =>
  function send(...inputs) {
    if (send.sending) throw new DoubleSendError(inputs, send.state)

    send.sending = true
    send.state ?? (send.state = {})

    const result = produce(inputs, inputs => {
      send.state = produce(send.state, state => {
        for (const input of iter(inputs)) step(input)?.(state)?.(send)
      })
    })

    send.sending = false
    return result
  }

export const make3 = () =>
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

export const run = (fns, x) => {
  const out = []
  for (const fn of fns) out.push(...iter(fn(x)))
  return out.filter(x => typeof x === "function")
}

/**
 * A plugin that runs other plugins.
 */
export const withPlugins = input => state => {
  state.plugins ?? (state.plugins = [])

  if (typeof input === "function") state.plugins.push(input)

  const inputStage = run(state.plugins, input)
  const transformStage = run(inputStage, state)
  return send => {
    const outputStage = run(transformStage, send)
  }
}

test(withPlugins, ({ eq, throws }) => {
  const send = make(withPlugins)
  send(
    input => state => {
      state.count ?? (state.count = 0)
      state.count++
    },
    input => {},
    input => (input.testing = true),
    input => state => send =>
      throws(DoubleSendError, () => {
        send({})
      }),
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
