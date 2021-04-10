import { program } from "commander"
import Translate from "lib/Translate"
import Compile from "lib/Compile"
import Module from "lib/Module"

import "translate/Stdio"

program
  .command("eval [code...]")
  .description("Eval code in the LocalHack context.")
  .action(main)

async function main(code) {
  try {
    code = code.join(" ")

    if (!code) code = await Translate.string(process.stdin).first

    const compiled = await Compile.js(code, { path: "(eval)" })
    await Module.fromString(compiled)
  } catch (err) {
    console.error(err)
  }
}
