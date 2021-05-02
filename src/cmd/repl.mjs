import readline from "readline"
import { program } from "commander"
import Translate from "lib/Translate"
import Compile from "lib/Compile"
import Module from "lib/Module"

import "translate/Stdio"

program
  .command("repl")
  .description("Open a REPL in the LocalHack context.")
  .action(main)

async function main() {
  let history = []
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\ncmd/repl> ",
  })

  rl.prompt()
  for await (let line of rl) {
    history.push(line)

    try {
      console.log(await eval(line))
    } catch (err) {
      console.error(err)
    }
    rl.prompt()
  }
}
