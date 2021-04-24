import Builder from "lib/Builder"
import Router from "lib/Router"
import { match } from "lib/patterns"

export let Messenger = Builder.clone
  .def({
    name: "Messenger",
    body(...body) {
      return this.assign({ body })
    },
  })
  .setter("to", "from", "subject")
  .to("@me")
  .from("@me")

export default Router.clone
  .def({
    name: "Mail",
    send(...body) {
      return Messenger.clone
        .body(...body)
        .promise(async ({ _ }) => this.push(_))
    },
  })
  .lazy({
    inbox: x => x.select({ to: "@me" }),
    outbox: x => x.select({ from: "@me" }),
  })
  .test(async (Mail, { eq }) => {
    let M = Mail.clone

    await M.send("hello")
    M.messages.observe(msg => {
      eq(msg, { to: "@me", from: "@me", body: "hello" })
    })
  })
