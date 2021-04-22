import Kefir from "kefir"

import Precursor from "lib/Precursor"
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
      return this.messages.filter(match(env))
    },
  })
  .lazy({
    queue: () => [],
    messages() {
      return Kefir.stream(emitter => {
        this.push = (...msgs) => {
          for (let msg of msgs) emitter.emit(msg)
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
