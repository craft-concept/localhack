import fg from "fast-glob"
import Pipeline, { T } from "lib/Pipeline"

Build.files("src/*").modified().read()

export default Pipeline.new("Build").on("files", files =>
  files.accept(T.Rest(String), (_, ...strs) => _.push(strs.map())),
)

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
