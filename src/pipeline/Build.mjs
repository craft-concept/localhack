import fg from "fast-glob"

export default Pipeline.new("Build").of(InputGlobs)

export let InputGlobs = Queue.new("InputGlobs").accepts(String)

export let Globbing = Step.new("Globbing")
  .from(InputGlobs)
  .act(glob => fg.stream(glob))

let Inputs = Globs("src/").files()

export default Constructor.def({
  name: "Build",
}).instance.def({
  name: "Build",
})

let Inbox = Messages.select({ to: "@me" })
let Outbox = Messages.select({ from: "@me" })
