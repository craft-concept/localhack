import { program } from "commander"
import { spawn } from "child_process"

import { iter } from "lib/Enum"
import { runAll } from "lib/Testing"

program
  .command("test [modules...]")
  .description("Test some modules and its dependencies.")
  .action(main)

async function main(modules) {
  try {
    for (const mod of iter(modules)) {
      await import(mod).catch(console.error)
    }

    runAll()
  } catch (err) {
    console.error(err)
  }
}
