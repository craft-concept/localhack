import { Enum, iter } from "./Enum"
import { edit, current } from "./edit"
import { ReplySet } from "./ReplySet"

export function make(state = {}) {
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
    if (typeof input == "function") {
      input.key ??= input.name || "anon"
      state.plugins.push(input)
    }

    for (const plugin of state.plugins) {
      replies.add(plugin.call(state[plugin.key], input, state))
    }
  }

  return self
}

make.test?.(({ eq }) => {
  const self = make()
  self(() => ({ x: 1 }))
  eq([...self({})], [{ x: 1 }])
})
