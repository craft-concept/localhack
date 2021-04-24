import { program } from "commander"
import { spawn } from "child_process"

import { testModule, runAll } from "lib/Testing"

program
  .command("test [modules...]")
  .description("Test some modules and its dependencies.")
  .action(main)

async function main(modules) {
  try {
    if (!modules.length) return runAll()
    for (const mod of modules) await testModule(mod)
  } catch (err) {
    console.error(err)
  }
}
