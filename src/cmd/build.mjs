import { program } from "commander"
import chalk from "chalk"

import System from "lib/System"
import Build from "lib/Build"

program
  .command("build")
  .description("Build the files in the current project.")
  .action(main)

async function main() {
  try {
    System.log("Building...")
    await Build.project()
    System.log("Done.")
  } catch (err) {
    System.report(err)
  }
}
