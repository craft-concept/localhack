import { program } from "commander"
import { createServer } from "http"
import Translate from "lib/Translate"
import Config from "lib/Config"

import "translate/Http"

program
  .command("http")
  .description("Start an http server.")
  .option("-p, --port <number>", "Port to listen on.", Config.http.port)
  .action(main)

function main({ port }) {
  server.listen(port, () => console.log(`HTTP listening on port ${port}.`))
}

export let server = createServer(async (req, res) => {
  console.log(`Request: '${req.url}'`)
  try {
    const str = await Translate.http(req, res).first
    res.end(typeof str == "string" ? `${str}` : undefined)
  } catch (e) {
    console.error(e)
  }
})
