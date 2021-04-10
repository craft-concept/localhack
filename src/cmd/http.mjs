import { program } from "commander"
import { createServer } from "http"
import Translate from "lib/Translate"

import "translate/Http"

program
  .command("http")
  .description("Start an http server.")
  .option("-p, --port <number>", "Port to listen on.", 1337)
  .action(main)

function main({ port }) {
  server.listen(port, () => console.log(`HTTP listening on port ${port}.`))
}

export let server = createServer(async (req, res) => {
  try {
    const str = await Translate.http(req, res).first
    res.end(`${str}`)
  } catch (e) {
    console.error(e)
  }
})
