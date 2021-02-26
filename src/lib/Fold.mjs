import { Enum, iter } from "./Enum"
import { edit, current } from "./edit"
import { ReplySet } from "./ReplySet"

export function Fold(state = {}) {
  function self(...inputs) {
    return self.send(...inputs)
  }

  self.state = state
  self.self = self
  self.send = function send(...inputs) {
    const replies = new ReplySet(self.send)
    self.state = edit(self.state, state => {
      for (const input of iter(inputs)) self.mutate(input, state, replies)
    })

    return replies
  }

  self.mutate = function mutate(input, state, replies) {
    state.plugins ??= []

    if (typeof input == "function") {
      input.key ??= input.name || "anon"
      input.plugin = true
      state.plugins.push(input)
    }

    for (const plugin of state.plugins) {
      state[plugin.key] ??= {}
      replies.add(plugin.call(state[plugin.key], input, state))
    }
  }

  return self
}

Fold.test?.(({ eq }) => {
  const self = Fold()
  self(
    () => ({ x: 1 }),
    () => ({ y: 2 }),
  )
  eq([...self({})], [{ x: 1 }, { y: 2 }])
})

Fold.test?.(({ eq }) => {
  const self = Fold()

  self(
    (input, state) => {
      state.count ?? (state.count = 0)
      state.count++
    },
    input => {},
    input => input,
    input => {
      input.testing = true
    },
    (input, state) => send => {
      if (state.count === 4) send({ msg: "count is 4!" })
    },
    function test1(input) {
      this.foo = "success"
    },
  )

  eq([...self({})], [{ testing: true }])
  eq(self.state.count, 7)
  eq(self.state.test1.foo, "success")
})
