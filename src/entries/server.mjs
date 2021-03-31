// The SendStack server.

import { SMTPServer } from "smtp-server"

const server = new SMTPServer({
  secure: false,
})

// { glob: "lib/*.mjs" }
// async -> [
//   {path: "lib/bar.mjs"},
//   {path: "lib/foo.mjs"},
// ]
