import { Enum } from "./Enum"

export class ReplySet extends Enum {
  constructor(send) {
    super(() => this.replies)
    this.send = send
    this.replies = []
    this.errors = []
  }

  add(replies) {
    for (const reply of iter(replies)) {
      if (typeof reply == "function") this.add(reply(this.send))
      else if (typeof reply.then == "function")
        reply.then(
          r => this.add(r),
          x => this.errors.push(x),
        )
      else this.replies.push(reply)
    }
  }
}
