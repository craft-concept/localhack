import { program } from "commander"
import Translate from "lib/Translate"

import "translate/Json"
import "translate/Yaml"
import "translate/Stdio"

program
  .command("to <type>")
  .description("Translate stdin to other types.")
  .action(main)

async function main(type) {
  try {
    const source = await Translate.string(process.stdin).first
    const out = Translate.to(type, Translate.parse(source).first).first
    console.log(out)
  } catch (err) {
    console.error(err)
  }
}
