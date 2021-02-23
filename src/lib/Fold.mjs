import { Enum, iter } from "./Enum"
import { edit, current } from "./edit"

export function make() {
  function self(...inputs) {
    for (const input of iter(inputs)) {
      self.send(input).each(x => x.then?.())
    }
  }

  Object.assign(self, {
    self,
    state: {},
    *send(input) {
      edit(input, input => {
        self.state = edit(self.state, state => {
          state.plugins ??= []

          if (typeof input == "function") state.plugins.push(input)
          if (typeof input.with === "function") state.plugins.push(input.with)

          runAll(state.plugins, input, state, self)
        })
      })
    },
  })

  return self
}

export function runAll(fns, input, state, self) {
  return Enum.of(fns).flatMap(run(input, state, self)).array
}

export function run(input, state, self) {
  return fn => {
    const key = fn.key || fn.name || "anon"
    const local = (state[key] ??= {})
    const replies = fn.call(local, input, state, self)

    return Enum.of(replies).selectMap(reply =>
      typeof reply == "function" ? reply.call(local, self.send) : reply,
    )
  }
}

runAll.test?.(({ eq }) => {
  eq(runAll([(a, b) => a + b], 1, 2), runAll([(a, b) => a - b], 1, 2), [3, -1])
})
