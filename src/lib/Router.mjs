import Stream from "lib/Stream"
import Precursor, { tap } from "lib/Precursor"
import { match } from "lib/patterns"

export default Precursor.clone
  .def({
    name: "Router",

    push(...msgs) {
      this.queue.push(...msgs)
      return this
    },

    send(...msg) {
      this.push(msg)
      return this
    },

    select(...pattern) {
      let next = this.clone.def({
        messages: this.messages.filter(match(pattern)),
      })

      return next
    },
  })
  .lazy({
    queue: () => [],
    messages() {
      return Stream.stream(emitter => {
        this.push = (...msgs) => {
          for (let msg of msgs) emitter.value(msg)
          return this
        }

        this.push(...this.queue)
        delete this.queue

        return () => {
          delete this.push
        }
      })
    },
  })
  .test(async (Router, { eq }) => {
    let R = Router.clone

    await R.send("hello")

    R.messages.observe(msg => {
      eq(msg, { to: "@me", from: "@me", body: "hello" })
    })
  })
