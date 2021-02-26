import { Fold } from "lib/Fold"

export let state = {}
export let self = Fold(state)

const originalSend = self.send
self.send = send

export function send(...inputs) {
  const replies = originalSend(...inputs)
  state = self.state
  return replies
}
